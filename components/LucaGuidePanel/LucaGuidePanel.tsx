import { GuidePanel } from '@navikt/ds-react';
import { Luca } from 'components/LucaGuidePanel/Luca';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const LucaGuidePanel = ({ children }: Props) => (
  <GuidePanel illustration={<Luca />} poster>
    {children}
  </GuidePanel>
);
