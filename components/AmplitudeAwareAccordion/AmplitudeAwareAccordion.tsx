import { Accordion } from '@navikt/ds-react';
import { useState } from 'react';
import { logAccordionChangeEvent } from 'utils/amplitude';

interface Props {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}

export const AmplitudeAwareAccordion = ({ title, open = false, children }: Props) => {
  const [isOpen, setIsOpen] = useState(open);

  const onClick = () => {
    logAccordionChangeEvent(title, isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <Accordion>
      <Accordion.Item open={isOpen}>
        <Accordion.Header onClick={onClick}>{title}</Accordion.Header>
        <Accordion.Content tabIndex={!isOpen ? -1 : undefined}>{children}</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};
