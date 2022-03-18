import { Accordion, BodyShort, Label } from '@navikt/ds-react';
import React, { useState } from 'react';
import { FieldAndLabel } from '../../../types/SoknadStandard';
type SummaryAccordianItemProps = {
  title: string;
  data: any;
  children?: React.ReactChild | React.ReactChild[];
};
const AccordianItemOppsummering = ({ data, title, children }: SummaryAccordianItemProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const list: Array<FieldAndLabel<any>> = Object.entries(data).map(([, val]: [string, any]) => {
    return { label: val?.label, value: val?.value };
  });
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
        {list?.map((item) => (
          <>
            <Label>{item?.label}</Label>
            {Array.isArray(item?.value) ? (
              <ul>
                {item?.value?.map((str) => (
                  <li>
                    <BodyShort>{str}</BodyShort>
                  </li>
                ))}
              </ul>
            ) : (
              <BodyShort>{item?.value}</BodyShort>
            )}
          </>
        ))}
        {children}
      </Accordion.Content>
    </Accordion.Item>
  );
};
export default AccordianItemOppsummering;
