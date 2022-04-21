import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../../types/SoknadStandard';
import { GetText } from '../../../hooks/useTexts';
import { Accordion, BodyShort, Cell, Grid, Heading, Label } from '@navikt/ds-react';
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
import { StepNames } from '../index';
import { goToNamedStep, useStepWizard } from '../../../context/stepWizardContextV2';

interface OppsummeringProps {
  control: Control<SoknadStandard>;
  getText: GetText;
  errors: FieldErrors;
}

const Oppsummering = ({ getText, errors, control }: OppsummeringProps) => {
  const { søknadState } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const { søker, fastlege } = useSokerOppslag();
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.oppsummering.title')}
      </Heading>
      <Accordion>
        <AccordianItemOppsummering data={{}} title={'Om deg'} showEdit={false}>
          <OppsummeringKontaktinfo getText={getText} søker={søker} />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{
            startDato: søknadState?.søknad?.startDato,
            ...søknadState?.søknad?.ferie,
          }}
          title={'Startdato og ferie'}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.STARTDATO)}
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
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.MEDLEMSKAP)}
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
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.YRKESSKADE)}
        />
        <AccordianItemOppsummering
          data={søknadState?.søknad?.andreUtbetalinger}
          title={getText('steps.andre_utbetalinger.title')}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.ANDRE_UTBETALINGER)}
        >
          <>
            {[søknadState?.søknad?.andreUtbetalinger?.annet]?.map((e) => (
              <div>
                <Label>{'Annet:'}</Label>
                <Grid>
                  <Cell xs={4}>
                    <Label>{e?.utbetalerNavn?.label}</Label>
                    <BodyShort>{e?.utbetalerNavn?.value}</BodyShort>
                  </Cell>
                  <Cell xs={4}>
                    <Label>{e?.utbetalingsNavn?.label}</Label>
                    <BodyShort>{e?.utbetalingsNavn?.value}</BodyShort>
                  </Cell>
                </Grid>
              </div>
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{}}
          title={getText('steps.fastlege.title')}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.FASTLEGE)}
        >
          <>
            <article>
              <Heading size={'small'} level={'3'}>
                {getText('steps.oppsummering.helseopplysninger.fastlege')}
              </Heading>
              {!fastlege ? (
                <BodyShort>Ingen fastlege registrert</BodyShort>
              ) : (
                <>
                  <BodyShort>{fastlege?.fulltNavn}</BodyShort>
                  <BodyShort>{fastlege?.legekontor}</BodyShort>
                  <BodyShort>{fastlege?.adresse}</BodyShort>
                  <BodyShort>{`Telefon: ${fastlege?.telefon}`}</BodyShort>
                </>
              )}
            </article>
            {søknadState?.søknad?.behandlere?.map((behandler) => (
              <OppsummeringBehandler getText={getText} behandler={behandler} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={{}}
          title={getText('steps.barnetillegg.title')}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.BARNETILLEGG)}
        >
          {søknadState?.søknad?.barnetillegg?.map((barn) => (
            <OppsummeringBarn barn={barn} />
          ))}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          data={søknadState?.søknad?.student}
          title={getText('steps.student.title')}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.STUDENT)}
        />
        <AccordianItemOppsummering
          data={{ tilleggsopplysninger: søknadState?.søknad?.tilleggsopplysninger }}
          title={getText('steps.tilleggsopplysninger.title')}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.TILLEGGSOPPLYSNINGER)}
        />
        <AccordianItemOppsummering
          data={{}}
          title={getText('steps.vedlegg.title')}
          onEdit={() => goToNamedStep(stepWizardDispatch, StepNames.VEDLEGG)}
        >
          <>
            {søknadState?.søknad?.vedlegg?.map((vedlegg) => (
              <BodyShort>{vedlegg?.name}</BodyShort>
            ))}
          </>
        </AccordianItemOppsummering>
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
