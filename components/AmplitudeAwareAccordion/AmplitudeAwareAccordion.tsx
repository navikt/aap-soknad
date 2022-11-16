import { Accordion } from '@navikt/ds-react';
import { useState } from 'react';
import { logAccordionChangeEvent } from 'utils/amplitude';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const AmplitudeAwareAccordion = ({ title, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    logAccordionChangeEvent(title, isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <Accordion>
      <Accordion.Item open={isOpen}>
        <Accordion.Header onClick={onClick}>{title}</Accordion.Header>
        <Accordion.Content>{children}</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};
