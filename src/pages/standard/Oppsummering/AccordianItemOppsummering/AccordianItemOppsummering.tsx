import { Accordion, Button, Cell, Grid, Link } from '@navikt/ds-react';
import React, { useState } from 'react';
import * as classes from './AccordianItemOppsummering.module.css';
import { Back } from '@navikt/ds-icons';

type SummaryAccordianItemProps = {
  title: string;
  onEdit?: () => void;
  defaultOpen?: boolean;
  showEdit?: boolean;
  editText?: string;
  children?: React.ReactChild | React.ReactChild[];
};
const AccordianItemOppsummering = ({
  title,
  children,
  defaultOpen,
  onEdit,
  showEdit = true,
  editText,
}: SummaryAccordianItemProps) => {
  const [open, setOpen] = useState<boolean>(defaultOpen ?? false);
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
      <Accordion.Content className={classes?.oppsummeringContent}>
        {children}
        {showEdit && (
          <Grid>
            <Cell xs={12}>
              <Link href="#" onClick={onEdit}>
                <Back />
                {editText}
              </Link>
            </Cell>
          </Grid>
        )}
      </Accordion.Content>
    </Accordion.Item>
  );
};
export default AccordianItemOppsummering;
