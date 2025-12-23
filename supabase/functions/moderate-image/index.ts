import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's auth
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is verified using the is_verified column
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile.is_verified) {
      return new Response(JSON.stringify({ 
        error: "You must verify your email and phone to upload images",
        code: "NOT_VERIFIED"
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const placeId = formData.get("placeId") as string;

    if (!file || !placeId) {
      return new Response(JSON.stringify({ error: "Missing file or placeId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing image for place ${placeId}, file size: ${file.size}`);

    // Convert file to base64 for AI moderation
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Call Lovable AI for image moderation
    console.log("Sending image to AI for moderation...");
    const moderationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an image moderation system for an RV travel app. Analyze the image and determine if it's appropriate.

APPROVE images that show:
- RV parks, campgrounds, or parking areas
- Natural scenery, landscapes
- RVs, campers, trailers, motorhomes
- Facilities like restrooms, hookups, dump stations
- Signs or markers for locations
- General outdoor or travel scenes

REJECT images that contain:
- Explicit or adult content
- Violence or graphic content
- Hate symbols or offensive material
- Spam, advertisements, or unrelated content
- Personal/private information visible
- Blurry or unidentifiable images
- Screenshots or non-photographic content

Respond ONLY with a JSON object:
{"approved": true/false, "reason": "brief explanation"}`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please moderate this image for an RV location listing:" },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ],
      }),
    });

    if (!moderationResponse.ok) {
      if (moderationResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Service busy, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (moderationResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Service unavailable" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await moderationResponse.text();
      console.error("AI moderation error:", moderationResponse.status, errorText);
      throw new Error("Image moderation failed");
    }

    const moderationData = await moderationResponse.json();
    const aiMessage = moderationData.choices?.[0]?.message?.content || "";
    console.log("AI response:", aiMessage);

    // Parse and validate the AI response with strict schema validation
    let moderationResult: { approved: boolean; reason: string };
    try {
      // Extract JSON from the response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure explicitly
      if (typeof parsed.approved !== 'boolean') {
        throw new Error("Invalid approved field");
      }
      
      // Sanitize and validate the reason field
      const rawReason = parsed.reason;
      if (typeof rawReason !== 'string') {
        throw new Error("Invalid reason field");
      }
      
      // Sanitize the reason: strip HTML/script tags, limit length, escape special chars
      const sanitizedReason = rawReason
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>"'&]/g, (char) => {
          const escapeMap: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
          };
          return escapeMap[char] || char;
        })
        .slice(0, 200) // Limit length
        .trim();
      
      moderationResult = {
        approved: parsed.approved,
        reason: sanitizedReason || "No reason provided"
      };
    } catch (e) {
      console.error("Failed to parse moderation response:", e);
      // Default to rejection if we can't parse
      moderationResult = { approved: false, reason: "Unable to verify image safety" };
    }

    if (!moderationResult.approved) {
      console.log("Image rejected:", moderationResult.reason);
      return new Response(JSON.stringify({ 
        error: "Image not approved",
        reason: moderationResult.reason,
        code: "MODERATION_FAILED"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Image approved - upload to storage
    console.log("Image approved, uploading to storage...");
    const fileName = `${user.id}/${placeId}/${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("place-images")
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload image");
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("place-images")
      .getPublicUrl(fileName);

    console.log("Image uploaded:", publicUrl);

    // Update the place with the new cover image
    const { error: updateError } = await supabase
      .from("places")
      .update({ cover_image_url: publicUrl })
      .eq("id", placeId);

    if (updateError) {
      console.error("Update error:", updateError);
      // Still return success since image was uploaded
    }

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: publicUrl,
      message: "Image uploaded successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in moderate-image function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
