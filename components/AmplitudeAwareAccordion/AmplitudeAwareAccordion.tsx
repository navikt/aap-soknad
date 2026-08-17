import { Accordion } from '@navikt/ds-react';
import { useState } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const AmplitudeAwareAccordion = ({ title, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
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
