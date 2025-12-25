import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FooterContextType {
  isFooterVisible: boolean;
  hideFooter: () => void;
  showFooter: () => void;
  setMapInteracting: (interacting: boolean) => void;
  isMapInteracting: boolean;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export function FooterProvider({ children }: { children: ReactNode }) {
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  const hideFooter = useCallback(() => {
    setIsFooterVisible(false);
  }, []);

  const showFooter = useCallback(() => {
    setIsFooterVisible(true);
  }, []);

  const setMapInteracting = useCallback((interacting: boolean) => {
    setIsMapInteracting(interacting);
  }, []);

  return (
    <FooterContext.Provider value={{ 
      isFooterVisible, 
      hideFooter, 
      showFooter, 
      setMapInteracting,
      isMapInteracting 
    }}>
      {children}
    </FooterContext.Provider>
  );
}

export function useFooter() {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
}
