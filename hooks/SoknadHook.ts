import { useContext } from 'react';
import { SoknadContext } from 'context/soknadcontext/soknadContext';

export const useSoknad = () => {
  const context = useContext(SoknadContext);
  if (context === undefined) {
    throw new Error('useSoknadContext must be used within a SoknadContextProvider');
  }
  return context;
};
