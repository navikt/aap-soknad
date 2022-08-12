import { GuidePanel } from '@navikt/ds-react';
import React from 'react';
import { Luca } from './Luca';

interface Props {
  children: React.ReactNode;
}

export const LucaGuidePanel = ({ children }: Props) => (
  <GuidePanel illustration={<Luca />} poster>
    {children}
  </GuidePanel>
);
