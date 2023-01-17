import * as yup from 'yup';
import { render, screen, waitFor } from 'setupTests';
import { MonthPickerWrapper } from './MonthPickerWrapper';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { Button } from '@navikt/ds-react';

const onSubmitMock = jest.fn();
interface FormFields {
  måned: Date;
}
const Månedsvelger = () => {
  const schema = yup.object().shape({
    måned: yup.date().required(),
  });

  const { control, handleSubmit } = useForm<FormFields>({ resolver: yupResolver(schema) });
  return (
    <form onSubmit={handleSubmit(() => onSubmitMock())}>
      <MonthPickerWrapper name={'måned'} label={'Velg en måned'} control={control} />
      <Button>Fullfør</Button>
    </form>
  );
};
describe('MonthPickerWrapper', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('tegner input-felt', () => {
    render(<Månedsvelger />);

    expect(screen.getByRole('textbox', { name: /Velg en måned/ })).toBeVisible();
  });

  test('kan taste inn måned og år', async () => {
    render(<Månedsvelger />);
    const input = screen.getByRole('textbox', { name: /Velg en måned/ });
    await waitFor(() => user.type(input, '02.2022'));
    expect(input).toHaveValue('02.2022');
    await waitFor(() => user.click(screen.getByRole('button', { name: /^Fullfør$/ })));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  test('kan velge måned fra måneds-velgeren', async () => {
    render(<Månedsvelger />);
    await waitFor(() => user.click(screen.getByRole('button', { name: /^Åpne månedsvelger$/ })));
    const januarKnapp = screen.getByRole('button', { name: /^januar$/ });
    expect(januarKnapp).toBeVisible();
    await waitFor(() => user.click(januarKnapp));
    expect(screen.getByRole('textbox', { name: /^Velg en måned$/ })).toHaveValue(
      `01.${format(new Date(), 'yyyy')}`
    );
    await waitFor(() => user.click(screen.getByRole('button', { name: /^Fullfør$/ })));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
});
