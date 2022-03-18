import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { FieldAndLabel } from '../../../types/SoknadStandard';
import { isDate } from 'date-fns';
import { formatDate } from '../../../utils/date';
import * as classes from './SummaryAccordianNestedItem.module.css';
type SummaryAccordianItemProps = {
  title: string;
  data: any;
};
const formatValue = (val: any) => {
  if (isDate(val)) {
    return formatDate(val, 'dd.MM.yyyy');
  }
  return val;
};
const SummaryAccordianNestedItem = ({ title, data }: SummaryAccordianItemProps) => {
  const list: Array<Array<FieldAndLabel<any>>> = data.map((nestedItem: Array<FieldAndLabel<any>>) =>
    Object.entries(nestedItem).map(([key, val]) => {
      console.log(key);
      return { label: val?.label, value: val?.value };
    })
  );
  return (
    <>
      <Label>{title}</Label>
      {list?.map((nestedItemList) => (
        <div className={classes?.nestedSummaryItem}>
          {nestedItemList.map((valAndLabel) => (
            <>
              <Label>{valAndLabel?.label}</Label>
              <BodyShort>{formatValue(valAndLabel?.value)}</BodyShort>
            </>
          ))}
        </div>
      ))}
    </>
  );
};
export default SummaryAccordianNestedItem;
