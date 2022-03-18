import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../../types/SoknadStandard';
import { GetText } from '../../../hooks/useTexts';
import { Accordion } from '@navikt/ds-react';
import React from 'react';
import ConfirmationPanelWrapper from '../../../components/input/ConfirmationPanelWrapper';
import { useSoknadContext } from '../../../context/soknadContext';
import AccordianItemOppsummering from './AccordianItemOppsummering/AccordianItemOppsummering';
import AccordianNestedItemOppsummering from './AccordianItemOppsummering/AccordianNestedItemOppsummering';
import OppsummeringBarn from './OppsummeringBarn';

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
        <AccordianItemOppsummering
          data={{ yrkesskade: søknadState?.søknad?.yrkesskade }}
          title={getText('steps.yrkesskade.title')}
        />
        <AccordianItemOppsummering
          data={søknadState?.søknad?.medlemskap}
          title={getText('steps.medlemskap.title')}
        >
          {søknadState?.søknad?.medlemskap?.utenlandsOpphold ? (
            <AccordianNestedItemOppsummering
              title={'Utenlandsopphold'}
              data={søknadState.søknad.medlemskap.utenlandsOpphold}
            />
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={søknadState?.søknad?.student}
          title={getText('steps.student.title')}
        />
        <AccordianItemOppsummering
          data={søknadState?.søknad?.andreUtbetalinger}
          title={getText('steps.andre_utbetalinger.title')}
        />
        <AccordianItemOppsummering
          data={{ barnetillegg: søknadState?.søknad?.barnetillegg }}
          title={getText('steps.barnetillegg.title')}
        >
          {søknadState?.søknad?.barnetillegg?.map((barn, index) => (
            <OppsummeringBarn key={index} barn={barn} />
          ))}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{ tilleggsopplysninger: søknadState?.søknad?.tilleggsopplysninger }}
          title={getText('steps.tilleggsopplysninger.title')}
        />
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
