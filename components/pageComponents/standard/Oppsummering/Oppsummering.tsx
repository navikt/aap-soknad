import {
  Accordion,
  Alert,
  BodyShort,
  ConfirmationPanel,
  Heading,
  Label,
  Switch,
} from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import AccordianItemOppsummering from './AccordianItemOppsummering/AccordianItemOppsummering';
import OppsummeringBarn from './OppsummeringBarn/OppsummeringBarn';
import OppsummeringKontaktinfo from './OppsummeringKontaktinfo/OppsummeringKontaktinfo';
import OppsummeringUtenlandsopphold from './OppsummeringUtenlandsopphold/OppsummeringUtenlandsopphold';
import OppsummeringBehandler from './OppsummeringBehandler/OppsummeringBehandler';
import * as yup from 'yup';
import { goToNamedStep, useStepWizard } from 'context/stepWizardContextV2';
import { StepNames } from 'pages';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { updateSøknadData } from 'context/soknadContextCommon';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { OppsummeringVedlegg } from './OppsummeringVedlegg/OppsummeringVedlegg';
import {
  getStudentSchema,
  jaNeiAvbruttToTekstnøkkel,
  KOMME_TILBAKE,
  STUDENT,
} from 'components/pageComponents/standard/Student/Student';
import {
  getAndreUtbetalingerSchema,
  StønadType,
  stønadTypeToAlternativNøkkel,
} from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { formatFullAdresse, formatNavn, formatTelefonnummer } from 'utils/StringFormatters';
import OppsummeringPeriode from './OppsummeringPeriode/OppsummeringPeriode';
import { isNonEmptyPeriode } from 'utils/periode';
import { getBarnetillegSchema } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import {
  FerieTypeToMessageKey,
  getStartDatoSchema,
} from 'components/pageComponents/standard/StartDato/StartDato';
import { getYrkesskadeSchema } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';

import { getBehandlerSchema } from 'components/pageComponents/standard/Behandlere/Behandlere';
import { logSkjemaValideringFeiletEvent } from 'utils/amplitude';
import { useIntl } from 'react-intl';
import { getMedlemskapSchema } from '../Medlemskap/medlemskapSchema';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { validate } from 'lib/utils/validationUtils';
import { useFormErrors } from 'hooks/useFormErrors';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';

interface OppsummeringProps {
  onBackClick: () => void;
  onSubmitSoknad: () => Promise<boolean>;
  submitErrorMessageRef: React.MutableRefObject<null>;
  hasSubmitError: boolean;
}

const Oppsummering = ({
  onBackClick,
  onSubmitSoknad,
  submitErrorMessageRef,
  hasSubmitError,
}: OppsummeringProps) => {
  const { formatMessage } = useIntl();
  const [nextIsLoading, setNextIsLoading] = useState<boolean>(false);
  const { errors, setErrors, clearErrors, findError } = useFormErrors();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepWizardDispatch } = useStepWizard();

  const schema = yup.object().shape({
    søknadBekreft: yup
      .boolean()
      .required(formatMessage({ id: 'søknad.oppsummering.confirmation.required' }))
      .oneOf([true], formatMessage({ id: 'søknad.oppsummering.confirmation.required' })),
  });

  const [toggleAll, setToggleAll] = useState<boolean | undefined>(undefined);
  const [startDatoHasErrors] = useState<boolean>(
    !getStartDatoSchema(formatMessage).isValidSync({
      sykepenger: søknadState.søknad?.sykepenger,
      ferie: søknadState.søknad?.ferie,
    })
  );
  const [medlemskapHasErrors] = useState<boolean>(
    !getMedlemskapSchema(formatMessage).isValidSync(søknadState.søknad)
  );
  const [yrkesskadeHasErrors] = useState<boolean>(
    !getYrkesskadeSchema(formatMessage).isValidSync(søknadState.søknad)
  );
  const [behandlereHasErrors] = useState<boolean>(
    !getBehandlerSchema(formatMessage).isValidSync(søknadState.søknad)
  );
  const [barnetilleggHasErrors] = useState<boolean>(
    !getBarnetillegSchema(formatMessage).isValidSync(søknadState?.søknad)
  );
  const [studentHasErrors] = useState<boolean>(
    !getStudentSchema(formatMessage).isValidSync(søknadState?.søknad?.student)
  );

  const [utbetalingerHasErrors] = useState<boolean>(
    !getAndreUtbetalingerSchema(formatMessage).isValidSync(søknadState?.søknad?.andreUtbetalinger)
  );

  useEffect(() => {
    const errorSteps = [
      ...(startDatoHasErrors ? ['STARTDATO'] : []),
      ...(medlemskapHasErrors ? ['MEDLEMSKAP'] : []),
      ...(yrkesskadeHasErrors ? ['YRKESSKADE'] : []),
      ...(behandlereHasErrors ? ['BEHANDLERE'] : []),
      ...(barnetilleggHasErrors ? ['BARNETILLEGG'] : []),
      ...(studentHasErrors ? ['STUDENT'] : []),
      ...(utbetalingerHasErrors ? ['UTBETALINGER'] : []),
    ];
    errorSteps.forEach((stegnavn) => {
      logSkjemaValideringFeiletEvent(stegnavn);
    });
  }, []);

  const SummaryRowIfExists = ({ labelKey, value }: { labelKey: string; value?: any }) => {
    return value ? (
      <div>
        <Label>{formatMessage({ id: labelKey })}</Label>
        <BodyShort>{value}</BodyShort>
      </div>
    ) : (
      <></>
    );
  };
  const editStep = (stepName: string) => goToNamedStep(stepWizardDispatch, stepName);
  return (
    <SoknadFormWrapperNew
      onNext={async () => {
        const errors = await validate(schema, søknadState.søknad);
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }
        if (søknadState.søknad) {
          setNextIsLoading(true);
          const submitSuccess = await onSubmitSoknad();
          if (!submitSuccess) {
            setNextIsLoading(false);
          }
        }
      }}
      onBack={() => onBackClick()}
      errors={errors}
      nextIsLoading={nextIsLoading}
      nextButtonText={formatMessage({ id: 'navigation.send' })}
    >
      <Heading size="large" level="2">
        {formatMessage({ id: 'søknad.oppsummering.title' })}
      </Heading>
      <div aria-live="polite" ref={submitErrorMessageRef}>
        {hasSubmitError && (
          <Alert variant="error">
            <BodyShort spacing>
              Det kan dessverre se ut til at vi har noen tekniske problemer akkurat nå. Prøv igjen
              senere.
            </BodyShort>
          </Alert>
        )}
      </div>
      <LucaGuidePanel>{formatMessage({ id: 'søknad.oppsummering.guide.text' })}</LucaGuidePanel>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Switch position="right" size="medium" onChange={() => setToggleAll(!toggleAll)}>
          {!toggleAll
            ? formatMessage({ id: 'søknad.oppsummering.toggle.open' })
            : formatMessage({ id: 'søknad.oppsummering.toggle.close' })}
        </Switch>
      </div>
      <Accordion>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.contactInformation.title' })}
          defaultOpen={true}
          showEdit={false}
          toggleAll={toggleAll}
        >
          <OppsummeringKontaktinfo />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.startDato.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.startDato.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STARTDATO)}
          hasError={startDatoHasErrors}
        >
          <SummaryRowIfExists
            labelKey="søknad.startDato.sykepenger.legend"
            value={søknadState.søknad?.sykepenger}
          />
          <SummaryRowIfExists
            labelKey={'søknad.startDato.skalHaFerie.label'}
            value={søknadState?.søknad?.ferie?.skalHaFerie}
          />
          <SummaryRowIfExists
            labelKey={'søknad.startDato.ferieType.label'}
            value={
              søknadState?.søknad?.ferie?.ferieType
                ? formatMessage({ id: FerieTypeToMessageKey(søknadState.søknad.ferie.ferieType) })
                : ''
            }
          />
          <SummaryRowIfExists
            labelKey={'søknad.startDato.antallDager.label'}
            value={søknadState?.søknad?.ferie?.antallDager}
          />
          {isNonEmptyPeriode({
            fraDato: søknadState?.søknad?.ferie?.fraDato,
            tilDato: søknadState?.søknad?.ferie?.tilDato,
          }) ? (
            <div>
              <Label>{formatMessage({ id: 'søknad.oppsummering.startDato.planlagtFerie' })}</Label>
              <OppsummeringPeriode
                periode={{
                  fraDato: søknadState?.søknad?.ferie?.fraDato,
                  tilDato: søknadState?.søknad?.ferie?.tilDato,
                }}
              />
            </div>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.medlemskap.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.medlemskap.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.MEDLEMSKAP)}
          hasError={medlemskapHasErrors}
        >
          <SummaryRowIfExists
            labelKey={'søknad.medlemskap.harBoddINorgeSiste5År.label'}
            value={søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År}
          />
          <SummaryRowIfExists
            labelKey={'søknad.medlemskap.harArbeidetINorgeSiste5År.label'}
            value={søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År}
          />
          <SummaryRowIfExists
            labelKey={'søknad.medlemskap.arbeidUtenforNorge.label'}
            value={søknadState?.søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom}
          />
          <SummaryRowIfExists
            labelKey="søknad.medlemskap.iTilleggArbeidUtenforNorge.label"
            value={søknadState?.søknad?.medlemskap?.iTilleggArbeidUtenforNorge}
          />
          {søknadState?.søknad?.medlemskap?.utenlandsOpphold ? (
            <>
              <Label>
                {formatMessage({ id: 'søknad.oppsummering.medlemskap.utenlandsopphold.title' })}
              </Label>
              <OppsummeringUtenlandsopphold
                opphold={søknadState?.søknad?.medlemskap?.utenlandsOpphold}
              />
            </>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>

        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.yrkesskade.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.yrkesskade.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.YRKESSKADE)}
          hasError={yrkesskadeHasErrors}
        >
          <SummaryRowIfExists
            labelKey={`søknad.yrkesskade.harDuYrkesskade.label`}
            value={søknadState?.søknad?.yrkesskade}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.helseopplysninger.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.helseopplysninger.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.FASTLEGE)}
          hasError={behandlereHasErrors}
        >
          <>
            {søknadState?.søknad?.registrerteBehandlere?.map((behandler, index) => (
              <article key={'behandler-' + index}>
                <Heading size={'small'} level={'3'}>
                  {formatMessage({ id: 'søknad.oppsummering.helseopplysninger.fastlege' })}
                </Heading>
                <BodyShort>{formatNavn(behandler.navn)}</BodyShort>
                <BodyShort>{behandler.kontaktinformasjon.kontor}</BodyShort>
                <BodyShort>{formatFullAdresse(behandler.kontaktinformasjon.adresse)}</BodyShort>
                <BodyShort>{`Telefon: ${formatTelefonnummer(
                  behandler.kontaktinformasjon.telefon
                )}`}</BodyShort>
                <BodyShort>{`${formatMessage({
                  id: 'søknad.oppsummering.helseopplysninger.informasjonOmFastlege',
                })} ${behandler.erRegistrertFastlegeRiktig}`}</BodyShort>
              </article>
            ))}

            {søknadState?.søknad?.andreBehandlere?.map((behandler) => (
              <OppsummeringBehandler key={behandler.id} behandler={behandler} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.barnetillegg.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.barnetillegg.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.BARNETILLEGG)}
          hasError={barnetilleggHasErrors}
        >
          <>
            {søknadState?.søknad?.barn?.map((barn, index) => (
              <OppsummeringBarn barn={barn} key={'barn-' + index} />
            ))}
            {søknadState?.søknad?.manuelleBarn?.map((barn) => (
              <OppsummeringBarn key={barn.internId} barn={barn} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.student.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.student.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STUDENT)}
          hasError={studentHasErrors}
        >
          <SummaryRowIfExists
            labelKey={`søknad.student.erStudent.legend`}
            value={
              søknadState?.søknad?.student?.erStudent &&
              formatMessage({
                id: jaNeiAvbruttToTekstnøkkel(søknadState?.søknad?.student?.erStudent),
              })
            }
          />
          <SummaryRowIfExists
            labelKey={`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`}
            value={søknadState?.søknad?.student?.kommeTilbake}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.utbetalinger.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.utbetalinger.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.ANDRE_UTBETALINGER)}
          hasError={utbetalingerHasErrors}
        >
          <SummaryRowIfExists
            labelKey={`søknad.andreUtbetalinger.lønn.label`}
            value={søknadState?.søknad?.andreUtbetalinger?.lønn}
          />
          {søknadState?.søknad?.andreUtbetalinger ? (
            <div>
              <Label>{formatMessage({ id: `søknad.andreUtbetalinger.stønad.label` })}</Label>
              {søknadState?.søknad?.andreUtbetalinger?.stønad?.map(
                (stønadType: StønadType, index) => {
                  const stønadTekst = formatMessage({
                    id: stønadTypeToAlternativNøkkel(stønadType),
                  });
                  return (
                    <BodyShort key={'stønad-' + index}>
                      {stønadType === StønadType.AFP
                        ? `${stønadTekst}, Utbetaler: ${søknadState?.søknad?.andreUtbetalinger?.afp?.hvemBetaler}`
                        : stønadTekst}
                    </BodyShort>
                  );
                }
              )}
            </div>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage({ id: 'søknad.oppsummering.vedlegg.title' })}
          editText={formatMessage({ id: 'søknad.oppsummering.vedlegg.editText' })}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.VEDLEGG)}
        >
          <OppsummeringVedlegg søknadState={søknadState} />
          <SummaryRowIfExists
            labelKey={`søknad.tilleggsopplysninger.tilleggsopplysninger.label`}
            value={søknadState?.søknad?.tilleggsopplysninger}
          />
        </AccordianItemOppsummering>
      </Accordion>
      <ConfirmationPanel
        label={formatMessage({ id: 'søknad.oppsummering.confirmation.text' })}
        name={'søknadBekreft'}
        id={'søknadBekreft'}
        checked={søknadState.søknad?.søknadBekreft || false}
        error={findError('søknadBekreft')}
        onChange={(event) => {
          clearErrors();
          updateSøknadData(søknadDispatch, {
            søknadBekreft: event.target.checked,
          });
        }}
      >
        <Label>{formatMessage({ id: 'søknad.oppsummering.confirmation.title' })}</Label>
      </ConfirmationPanel>
    </SoknadFormWrapperNew>
  );
};
export default Oppsummering;
