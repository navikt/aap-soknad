import React, { forwardRef } from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { parse } from 'date-fns';
import { nb } from 'date-fns/locale';
import 'react-day-picker/lib/style.css';
import { TextField } from '@navikt/ds-react';
import { formatDate } from '../../utils/date';
import { DateUtils } from 'react-day-picker';

const parseDate = (str: string, format: string) => {
  try {
    const res = parse(str, format, new Date(), { locale: nb });
    if (DateUtils.isDate(res)) {
      return res;
    }

    return undefined;
  } catch (err) {
    console.error('parseDate error', err);
  }
};
const wrapFormatDate = (date: Date, dateFormat: string) => formatDate(date, dateFormat);

interface DatovelgerProps {
  onChange: (nyDato: Date) => void;
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  value?: string;
  description?: React.ReactChild | React.ReactChild[];
}

const datovelger = ({ onChange, error, name, label, id, value, description }: DatovelgerProps) => {
  const TextFieldInput = forwardRef((props, ref) => (
    <TextField
      label={label}
      id={id}
      name={name}
      style={{ maxWidth: '255px' }}
      error={error}
      description={description}
      autoComplete={'off'}
      {...props}
      {...ref}
    />
  ));

  return (
    <div className="datovelger navds-form-field">
      <DayPickerInput
        format="dd.MM.yyyy"
        placeholder=""
        value={value}
        dayPickerProps={{ locale: 'nb' }}
        parseDate={parseDate}
        formatDate={wrapFormatDate}
        onDayChange={onChange}
        inputProps={{ name, id }}
        component={TextFieldInput}
      />
    </div>
  );
};

export default datovelger;
