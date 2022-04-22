import { Accordion, BodyShort, Button, Cell, Grid, Label } from '@navikt/ds-react';
import React, { useState } from 'react';
import { FieldAndLabel } from '../../../../types/SoknadStandard';
import { isDate } from 'date-fns';
import { formatDate } from '../../../../utils/date';
import * as classes from './AccordianItemOppsummering.module.css';
import { Edit } from '@navikt/ds-icons';

type SummaryAccordianItemProps = {
  title: string;
  data: any;
  onEdit?: () => void;
  showEdit?: boolean;
  children?: React.ReactChild | React.ReactChild[];
};
const formatValue = (val: any) => {
  if (isDate(val)) {
    return formatDate(val);
  }
  return val;
};
const AccordianItemOppsummering = ({
  data,
  title,
  children,
  onEdit,
  showEdit = true,
}: SummaryAccordianItemProps) => {
  const [open, setOpen] = useState<boolean>(true);
  const list: Array<FieldAndLabel<any>> = Object.entries(data)
    .map(([, val]: [string, any]) => {
      return { label: val?.label, value: val?.value };
    })
    .filter((e) => e?.label);
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
        {list?.map((item, index) => (
          <div key={index}>
            <Label>{item?.label}</Label>
            {Array.isArray(item?.value) ? (
              <ul>
                {item?.value?.map((str, subIndex) => (
                  <li key={subIndex}>
                    <BodyShort>{str}</BodyShort>
                  </li>
                ))}
              </ul>
            ) : (
              <BodyShort>{formatValue(item?.value)}</BodyShort>
            )}
          </div>
        ))}
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
