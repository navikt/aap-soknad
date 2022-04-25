import { Accordion, Button, Cell, Grid } from '@navikt/ds-react';
import React, { useState } from 'react';
import * as classes from './AccordianItemOppsummering.module.css';
import { Edit } from '@navikt/ds-icons';

type SummaryAccordianItemProps = {
  title: string;
  onEdit?: () => void;
  showEdit?: boolean;
  children?: React.ReactChild | React.ReactChild[];
};
const AccordianItemOppsummering = ({
  title,
  children,
  onEdit,
  showEdit = true,
}: SummaryAccordianItemProps) => {
  const [open, setOpen] = useState<boolean>(false);
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
            <Cell xs={6}>
              <Button variant={'tertiary'} onClick={onEdit}>
                <Edit />
                Endre opplysninger
              </Button>
            </Cell>
          </Grid>
        )}
      </Accordion.Content>
    </Accordion.Item>
  );
};
export default AccordianItemOppsummering;
