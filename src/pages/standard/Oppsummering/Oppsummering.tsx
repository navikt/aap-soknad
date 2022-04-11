import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../../types/SoknadStandard';
import { GetText } from '../../../hooks/useTexts';
import { Accordion, BodyShort, Heading, Label } from '@navikt/ds-react';
import React from 'react';
import ConfirmationPanelWrapper from '../../../components/input/ConfirmationPanelWrapper';
import { useSoknadContext } from '../../../context/soknadContext';
import AccordianItemOppsummering from './AccordianItemOppsummering/AccordianItemOppsummering';
import OppsummeringBarn from './OppsummeringBarn/OppsummeringBarn';
import { isNonEmptyPeriode } from '../../../utils/periode';
import OppsummeringPeriode from './OppsummeringPeriode/OppsummeringPeriode';
import OppsummeringKontaktinfo from './OppsummeringKontaktinfo/OppsummeringKontaktinfo';
import { useSokerOppslag } from '../../../context/sokerOppslagContext';
import OppsummeringUtenlandsopphold from './OppsummeringUtenlandsopphold/OppsummeringUtenlandsopphold';
import OppsummeringBehandler from './OppsummeringBehandler/OppsummeringBehandler';

interface OppsummeringProps {
  control: Control<SoknadStandard>;
  getText: GetText;
  errors: FieldErrors;
}

const Oppsummering = ({ getText, errors, control }: OppsummeringProps) => {
  const { søknadState } = useSoknadContext();
  const { søker, fastlege } = useSokerOppslag();
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.oppsummering.title')}
      </Heading>
      <Accordion>
        <AccordianItemOppsummering data={{}} title={'Om deg'}>
          <OppsummeringKontaktinfo getText={getText} søker={søker} />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{
            startDato: søknadState?.søknad?.startDato,
            ...søknadState?.søknad?.ferie,
          }}
          title={'Startdato og ferie'}
        >
          {isNonEmptyPeriode(søknadState?.søknad?.ferie?.periode) ? (
            <div>
              <Label>{'Planlagt ferie'}</Label>
              <OppsummeringPeriode periode={søknadState?.søknad?.ferie?.periode} />
            </div>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={søknadState?.søknad?.medlemskap}
          title={getText('steps.medlemskap.title')}
        >
          {søknadState?.søknad?.medlemskap?.utenlandsOpphold ? (
            <OppsummeringUtenlandsopphold
              getText={getText}
              opphold={søknadState?.søknad?.medlemskap?.utenlandsOpphold}
            />
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{ yrkesskade: søknadState?.søknad?.yrkesskade }}
          title={getText('steps.yrkesskade.title')}
        />
        <AccordianItemOppsummering data={{}} title={getText('steps.fastlege.title')}>
          <>
            <article>
              <Heading size={'small'} level={'3'}>
                {getText('steps.oppsummering.helseopplysninger.fastlege')}
              </Heading>
              <BodyShort>{fastlege?.fulltNavn}</BodyShort>
              <BodyShort>{fastlege?.legekontor}</BodyShort>
              <BodyShort>{fastlege?.adresse}</BodyShort>
              <BodyShort>{`Telefon: ${fastlege?.telefon}`}</BodyShort>
            </article>
            {søknadState?.søknad?.behandlere?.map((behandler) => (
              <OppsummeringBehandler getText={getText} behandler={behandler} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering data={{}} title={getText('steps.barnetillegg.title')}>
          {søknadState?.søknad?.barnetillegg?.map((barn) => (
            <OppsummeringBarn barn={barn} />
          ))}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={søknadState?.søknad?.student}
          title={getText('steps.student.title')}
        />
        <AccordianItemOppsummering data={{}} title={getText('steps.vedlegg.title')}>
          <>
            {søknadState?.søknad?.vedlegg?.map((vedlegg) => (
              <BodyShort>{vedlegg?.name}</BodyShort>
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{ tilleggsopplysninger: søknadState?.søknad?.tilleggsopplysninger }}
          title={getText('steps.tilleggsopplysninger.title')}
        />
      </Accordion>
      <ConfirmationPanelWrapper
        label={getText('steps.oppsummering.confirmation')}
        control={control}
        name="søknadBekreft"
        error={errors?.søknadBekreft?.message}
      />
    </>
  );
};
export default Oppsummering;
