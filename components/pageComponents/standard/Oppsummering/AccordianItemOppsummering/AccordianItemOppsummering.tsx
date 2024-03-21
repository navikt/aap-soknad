import { Accordion, Alert, BodyShort, HGrid, Link } from '@navikt/ds-react';
import React, { useState } from 'react';
import * as classes from './AccordianItemOppsummering.module.css';
import { Back } from '@navikt/ds-icons';
import { useEffect } from 'react';

type SummaryAccordianItemProps = {
  title: string;
  onEdit?: () => void;
  defaultOpen?: boolean;
  toggleAll: boolean | undefined;
  showEdit?: boolean;
  editText?: string;
  children?: React.ReactChild | React.ReactChild[];
  hasError?: boolean;
};
const AccordianItemOppsummering = ({
  title,
  children,
  defaultOpen,
  toggleAll,
  onEdit,
  showEdit = true,
  editText,
  hasError,
}: SummaryAccordianItemProps) => {
  const [open, setOpen] = useState<boolean>((defaultOpen || hasError) ?? false);

  useEffect(() => {
    if (toggleAll !== undefined) setOpen(toggleAll);
  }, [toggleAll]);

  return (
    <Accordion.Item open={open}>
      <Accordion.Header
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        {title}
      </Accordion.Header>
      <Accordion.Content>
        <div className={classes?.oppsummeringContent}>
          {children}
          {hasError && (
            <Alert variant="error">
              <BodyShort>
                Alle de obligatoriske spørsmålene i søknaden er ikke besvart enda. Du må tilbake til
                steget for å fylle inn svarene før du kan sende inn søknaden.
              </BodyShort>
            </Alert>
          )}
          {showEdit && (
            <HGrid columns={{ xs: 1 }}>
              <Link href="#" onClick={onEdit}>
                <Back />
                {editText}
              </Link>
            </HGrid>
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};
export default AccordianItemOppsummering;
