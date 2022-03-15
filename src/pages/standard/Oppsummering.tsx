import { Control, FieldErrors, UseFormProps } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import { Accordion, BodyShort, Label } from '@navikt/ds-react';
import React, { useReducer } from 'react';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import { StepNames } from './index';

interface OppsummeringProps {
  control: Control<UseFormProps<SoknadStandard>>;
  getText: GetText;
  errors: FieldErrors;
}
interface AccordianAction {
  payload?: StepNames;
  error?: any;
  type: 'ACCORDIAN_OPEN';
}
type Accordians = {
  [key in StepNames]?: boolean;
};

function stateReducer(state: Accordians, action: AccordianAction) {
  switch (action.type) {
    case 'ACCORDIAN_OPEN': {
      const key = action.payload as string;
      const oldVal = !!state[key as StepNames];
      return { ...state, [key]: !oldVal };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const Oppsummering = ({ getText, errors, control }: OppsummeringProps) => {
  const [accordians, dispatch] = useReducer(stateReducer, {});
  const steps = [
    {
      name: StepNames.YRKESSKADE,
      title: getText('steps.yrkesskade.title'),
      data: [
        {
          label: getText('form.yrkesskade.legend'),
          formKey: 'yrkesskade',
        },
      ],
    },
    {
      name: StepNames.MEDLEMSKAP,
      title: getText('steps.medlemskap.title'),
      data: [
        {
          label: getText('form.yrkesskade.legend'),
          formKey: 'yrkesskade',
        },
      ],
    },
  ];
  return (
    <>
      <Accordion>
        {steps.map((step) => (
          <Accordion.Item open={!!accordians?.[step.name]}>
            <Accordion.Header
              onClick={(e) => {
                e.preventDefault();
                dispatch({ type: 'ACCORDIAN_OPEN', payload: step.name });
              }}
            >
              {step.title}
            </Accordion.Header>
            {step?.data?.map((item) => (
              <Accordion.Content>
                <Label>{item?.label}</Label>
                <BodyShort>{item?.formKey}</BodyShort>
              </Accordion.Content>
            ))}
          </Accordion.Item>
        ))}
      </Accordion>
      <ConfirmationPanelWrapper
        label={getText('steps.veiledning.rettogplikt')}
        control={control}
        name="søknadBekreft"
        error={errors?.rettogplikt?.message}
      />
    </>
  );
};
export default Oppsummering;
