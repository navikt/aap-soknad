import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import { Accordion } from '@navikt/ds-react';
import React from 'react';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import { useSoknadContext } from '../../context/soknadContext';
import SummaryAccordianItem from './SummaryAccordianItem/SummaryAccordianItem';
import SummaryAccordianNestedItem from './SummaryAccordianItem/SummaryAccordianNestedItem';

interface OppsummeringProps {
  control: Control<SoknadStandard>;
  getText: GetText;
  errors: FieldErrors;
}

const Oppsummering = ({ getText, errors, control }: OppsummeringProps) => {
  const { søknadState } = useSoknadContext();
  return (
    <>
      <Accordion>
        <SummaryAccordianItem
          data={{ yrkesskade: søknadState?.søknad?.yrkesskade }}
          title={getText('steps.yrkesskade.title')}
        />
        <SummaryAccordianItem
          data={søknadState?.søknad?.medlemskap}
          title={getText('steps.medlemskap.title')}
        >
          {søknadState?.søknad?.medlemskap?.utenlandsOpphold ? (
            <SummaryAccordianNestedItem
              title={'Utenlandsopphold'}
              data={søknadState.søknad.medlemskap.utenlandsOpphold}
            />
          ) : (
            <></>
          )}
        </SummaryAccordianItem>
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
