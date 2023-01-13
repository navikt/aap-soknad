import { FormErrorSummary } from './FormErrorSummary';
import { render, screen, waitFor, within } from 'setupTests';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TextFieldWrapper from '../input/TextFieldWrapper';
import { DatePickerWrapper } from '../input/DatePickerWrapper/DatePickerWrapper';
import { Button, Checkbox, Radio } from '@navikt/ds-react';
import userEvent from '@testing-library/user-event';
import RadioGroupWrapper from '../input/RadioGroupWrapper/RadioGroupWrapper';
import CheckboxGroupWrapper from '../input/CheckboxGroupWrapper';
import CountrySelector from '../input/CountrySelector';
import TextAreaWrapper from '../input/TextAreaWrapper';
import ConfirmationPanelWrapper from '../input/ConfirmationPanelWrapper';
import { JaEllerNei } from '../../types/Generic';

expect.extend(toHaveNoViolations);

interface FormField {
  aarstall: string;
  begrunnelse: string;
  skalHaFerie: JaEllerNei;
  ukedager: string[];
  land: string;
  enig: boolean;
  dato: {
    fraDato: Date;
  };
}

const schema = yup.object().shape({
  dato: yup.object().shape({
    fraDato: yup.date().required('Du må velge en dato').typeError('Ugyldig format på dato'),
  }),
  aarstall: yup.string().required('Du må velge et årstall'),
  begrunnelse: yup.string().required('Du må skrive en begrunnelse'),
  skalHaFerie: yup.string().required('Du må svare på om du skal ha ferie'),
  land: yup.string().required('Du må velge et land'),
  enig: yup.boolean().required('Du må være enig').oneOf([true], 'Du må være enig'),
  ukedager: yup.array().required('Du må velge minst en ukedag'),
});

const TestComponent = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormField>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(() => jest.fn())}>
      <FormErrorSummary errors={errors} />
      <TextFieldWrapper name={'aarstall'} label={'Hvilket år?'} control={control} />
      <TextAreaWrapper name={'begrunnelse'} label={'Begrunnelse'} control={control} />
      <RadioGroupWrapper name={'skalHaFerie'} control={control} legend={'Skal du ha ferie?'}>
        <Radio value={JaEllerNei.JA}>Ja</Radio>
        <Radio value={JaEllerNei.NEI}>Nei</Radio>
      </RadioGroupWrapper>
      <CheckboxGroupWrapper name={'ukedager'} control={control} legend={'Hvilke dager?'}>
        <Checkbox value={'mandag'}>Mandag</Checkbox>
        <Checkbox value={'tirsdag'}>Tirsdag</Checkbox>
      </CheckboxGroupWrapper>
      <CountrySelector name={'land'} control={control} label={'Hvilket land?'} />
      <ConfirmationPanelWrapper name={'enig'} label={'Du må bekrefte dette'} control={control}>
        Ja
      </ConfirmationPanelWrapper>
      <DatePickerWrapper name={'dato.fraDato'} label={'Fra hvilken dato?'} control={control} />
      <Button>Fullfør</Button>
    </form>
  );
};

describe('FormErrorSummary', () => {
  const user = userEvent.setup();
  it('skjuler ErrorSummary når vi ikke har feil', () => {
    const { container } = render(<TestComponent />);
    expect(within(container).getByRole('alert', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(within(container).getByRole('list', { hidden: true }).childElementCount).toBe(1);
    expect(within(container).getByRole('listitem', { hidden: true })).toHaveTextContent('hidden');
  });

  it('lister opp alle feil', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const datoFeilmelding = await screen.findByRole('link', { name: /du må velge en dato/i });
    expect(datoFeilmelding).toBeInTheDocument();
    expect(datoFeilmelding.getAttribute('href')).toBe('#dato.fraDato');

    const årstallFeilmelding = await screen.findByRole('link', { name: /du må velge et årstall/i });
    expect(årstallFeilmelding).toBeInTheDocument();
    expect(årstallFeilmelding.getAttribute('href')).toBe('#aarstall');
  });

  it('skal ha samme Id i datepicker som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const datoFeilmelding = await screen.findByRole('link', { name: /du må velge en dato/i });
    expect(datoFeilmelding).toBeInTheDocument();
    expect(datoFeilmelding.getAttribute('href')).toBe('#dato.fraDato');

    await waitFor(() => user.click(datoFeilmelding));

    const datoFelt = await screen.findByRole('textbox', {
      name: /fra hvilken dato\?/i,
    });

    expect(datoFelt.getAttribute('id')).toBe('dato.fraDato');
  });

  it('skal ha samme Id i textfield som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const årstallFeilmelding = await screen.findByRole('link', { name: /du må velge et årstall/i });
    expect(årstallFeilmelding).toBeInTheDocument();
    expect(årstallFeilmelding.getAttribute('href')).toBe('#aarstall');

    const tekstFelt = await screen.findByRole('textbox', {
      name: /hvilket år\?/i,
    });

    expect(tekstFelt.getAttribute('id')).toBe('aarstall');
  });

  it('skal ha samme Id i textarea som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const begrunnelseFeilmelding = await screen.findByRole('link', {
      name: /du må skrive en begrunnelse/i,
    });
    expect(begrunnelseFeilmelding).toBeInTheDocument();
    expect(begrunnelseFeilmelding.getAttribute('href')).toBe('#begrunnelse');

    const tekstFelt = await screen.findByRole('textbox', {
      name: /begrunnelse/i,
    });

    expect(tekstFelt.getAttribute('id')).toBe('begrunnelse');
  });

  it('skal ha samme Id i radiogroup som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const ferieFeilmelding = await screen.findByRole('link', {
      name: /du må svare på om du skal ha ferie/i,
    });
    expect(ferieFeilmelding).toBeInTheDocument();
    expect(ferieFeilmelding.getAttribute('href')).toBe('#skalHaFerie');

    const radiogroupFelt = await screen.findByRole('group', {
      name: /skal du ha ferie\?/i,
    });

    expect(radiogroupFelt.getAttribute('id')).toBe('skalHaFerie');
  });

  it('skal ha samme Id i select som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const landFeilmelding = await screen.findByRole('link', {
      name: /du må velge et land/i,
    });
    expect(landFeilmelding).toBeInTheDocument();
    expect(landFeilmelding.getAttribute('href')).toBe('#land');

    const selectFelt = await screen.findByRole('combobox', {
      name: /hvilket land\?/i,
    });

    expect(selectFelt.getAttribute('id')).toBe('land');
  });

  it('skal ha samme Id i confirmationpanel som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const enigFeilmelding = await screen.findByRole('link', {
      name: /du må være enig/i,
    });
    expect(enigFeilmelding).toBeInTheDocument();
    expect(enigFeilmelding.getAttribute('href')).toBe('#enig');

    const confirmationPanel = await screen.findByRole('checkbox', {
      name: /du må bekrefte dette/i,
    });

    expect(confirmationPanel.getAttribute('id')).toBe('enig');
  });

  it('skal ha samme Id i checkboxgroup som i linken i errorSummary', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const ukedagerFeilmelding = await screen.findByRole('link', {
      name: /du må velge minst en ukedag/i,
    });
    expect(ukedagerFeilmelding).toBeInTheDocument();
    expect(ukedagerFeilmelding.getAttribute('href')).toBe('#ukedager');

    const checkboxGroup = await screen.findByRole('group', {
      name: /hvilke dager\?/i,
    });

    expect(checkboxGroup.getAttribute('id')).toBe('ukedager');
  });

  it('uu-sjekk', async () => {
    const { container } = render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });
    await waitFor(() => user.click(fullførKnapp));

    const res = await axe(container);

    expect(res).toHaveNoViolations();
  });
});
