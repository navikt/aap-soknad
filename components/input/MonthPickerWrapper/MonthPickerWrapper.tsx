import { MonthPicker, useMonthpicker } from '@navikt/ds-react';

interface Props {
  id: string;
  label: string;
  selectedDate?: Date;
  fromDate?: Date;
  toDate?: Date;
  onChange: (date?: Date) => void;
  dropdownCaption?: boolean;
  error?: string;
}

export const MonthPickerWrapper = ({
  id,
  label,
  selectedDate,
  fromDate,
  toDate,
  onChange,
  dropdownCaption,
  error,
}: Props) => {
  console.log('selectedDate', selectedDate);

  const { monthpickerProps, inputProps, selectedMonth } = useMonthpicker({
    fromDate: fromDate,
    toDate: toDate,
    onMonthChange: onChange,
    defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
  });

  return (
    <MonthPicker
      {...monthpickerProps}
      id={id}
      dropdownCaption={dropdownCaption}
      defaultSelected={selectedDate}
    >
      <MonthPicker.Input {...inputProps} label={label} error={error} />
    </MonthPicker>
  );
};
