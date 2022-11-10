import { FieldValues, useForm } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import { Accordion, Alert, BodyShort, Heading, Label, Switch } from '@navikt/ds-react';
import React, { useState } from 'react';
import ConfirmationPanelWrapper from 'components/input/ConfirmationPanelWrapper';
import AccordianItemOppsummering from './AccordianItemOppsummering/AccordianItemOppsummering';
import OppsummeringBarn from './OppsummeringBarn/OppsummeringBarn';
import OppsummeringKontaktinfo from './OppsummeringKontaktinfo/OppsummeringKontaktinfo';
import OppsummeringUtenlandsopphold from './OppsummeringUtenlandsopphold/OppsummeringUtenlandsopphold';
import OppsummeringBehandler from './OppsummeringBehandler/OppsummeringBehandler';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { goToNamedStep, useStepWizard } from 'context/stepWizardContextV2';
import { StepNames } from 'pages';
import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { slettLagretSoknadState } from 'context/soknadContextCommon';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { OppsummeringVedlegg } from './OppsummeringVedlegg/OppsummeringVedlegg';
import { KOMME_TILBAKE, STUDENT } from 'components/pageComponents/standard/Student/Student';
import {
  StønadType,
  stønadTypeToAlternativNøkkel,
} from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { formatNavn, formatFullAdresse, formatTelefonnummer } from 'utils/StringFormatters';
import OppsummeringPeriode from './OppsummeringPeriode/OppsummeringPeriode';
import { isNonEmptyPeriode } from 'utils/periode';
import { BARN } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import { FerieTypeToMessageKey } from 'components/pageComponents/standard/StartDato/StartDato';
const SØKNAD_BEKREFT = 'søknadBekreft';

interface OppsummeringProps {
  onBackClick: () => void;
  onSubmitSoknad: (data: Soknad) => void;
  submitErrorMessageRef: React.MutableRefObject<string | null>;
  hasSubmitError: boolean;
}

const Oppsummering = ({
  onBackClick,
  onSubmitSoknad,
  submitErrorMessageRef,
  hasSubmitError,
}: OppsummeringProps) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [nextIsLoading, setNextIsLoading] = useState<boolean>(false);

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepWizardDispatch } = useStepWizard();
  const schema = yup.object().shape({
    [SØKNAD_BEKREFT]: yup
      .boolean()
      .required()
      .oneOf([true], formatMessage('søknad.oppsummering.confirmation.required')),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const [toggleAll, setToggleAll] = useState<boolean | undefined>(undefined);

  const SummaryRowIfExists = ({ labelKey, value }: { labelKey: string; value?: any }) => {
    return value ? (
      <BodyShort>
        <Label>{formatMessage(labelKey)}</Label>
        <BodyShort>{value}</BodyShort>
      </BodyShort>
    ) : (
      <></>
    );
  };
  const editStep = (stepName: string) => goToNamedStep(stepWizardDispatch, stepName);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit(async (data) => {
        setNextIsLoading(true);
        await onSubmitSoknad(data);
      })}
      nextIsLoading={nextIsLoading}
      onBack={() => onBackClick()}
      onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
      nextButtonText={formatMessage('navigation.send')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.oppsummering.title')}
      </Heading>
      <div aria-live="polite" ref={submitErrorMessageRef}>
        {hasSubmitError && (
          <Alert variant="error">
            Det kan dessverre se ut til at vi har noen tekniske problemer akkurat nå. Prøv igjen
            senere.
          </Alert>
        )}
      </div>
      <LucaGuidePanel>
        <BodyShort>{formatMessage('søknad.oppsummering.guide.text')}</BodyShort>
      </LucaGuidePanel>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Switch position="right" size="medium" onChange={() => setToggleAll(!toggleAll)}>
          {!toggleAll
            ? formatMessage('søknad.oppsummering.toggle.open')
            : formatMessage('søknad.oppsummering.toggle.close')}
        </Switch>
      </div>
      <Accordion>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.contactInformation.title')}
          defaultOpen={true}
          showEdit={false}
          toggleAll={toggleAll}
        >
          <OppsummeringKontaktinfo />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.startDato.title')}
          editText={formatMessage('søknad.oppsummering.startDato.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STARTDATO)}
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
                ? formatMessage(FerieTypeToMessageKey(søknadState.søknad.ferie.ferieType))
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
              <Label>{formatMessage('søknad.oppsummering.startDato.planlagtFerie')}</Label>
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
          title={formatMessage('søknad.oppsummering.medlemskap.title')}
          editText={formatMessage('søknad.oppsummering.medlemskap.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.MEDLEMSKAP)}
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
                {formatMessage('søknad.oppsummering.medlemskap.utenlandsopphold.title')}
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
          title={formatMessage('søknad.oppsummering.yrkesskade.title')}
          editText={formatMessage('søknad.oppsummering.yrkesskade.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.YRKESSKADE)}
        >
          <SummaryRowIfExists
            labelKey={`søknad.yrkesskade.harDuYrkesskade.label`}
            value={søknadState?.søknad?.yrkesskade}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.helseopplysninger.title')}
          editText={formatMessage('søknad.oppsummering.helseopplysninger.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.FASTLEGE)}
        >
          <>
            {søknadState?.søknad?.registrerteBehandlere?.map((behandler, index) => (
              <article key={'behandler-' + index}>
                <Heading size={'small'} level={'3'}>
                  {formatMessage('søknad.oppsummering.helseopplysninger.fastlege')}
                </Heading>
                <BodyShort>{formatNavn(behandler.navn)}</BodyShort>
                <BodyShort>{behandler.kontaktinformasjon.kontor}</BodyShort>
                <BodyShort>{formatFullAdresse(behandler.kontaktinformasjon.adresse)}</BodyShort>
                <BodyShort>{`Telefon: ${formatTelefonnummer(
                  behandler.kontaktinformasjon.telefon
                )}`}</BodyShort>
                <BodyShort>{`${formatMessage(
                  'søknad.oppsummering.helseopplysninger.informasjonOmFastlege'
                )} ${behandler.erRegistrertFastlegeRiktig}`}</BodyShort>
              </article>
            ))}

            {søknadState?.søknad?.andreBehandlere?.map((behandler) => (
              <OppsummeringBehandler key={behandler.id} behandler={behandler} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.barnetillegg.title')}
          editText={formatMessage('søknad.oppsummering.barnetillegg.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.BARNETILLEGG)}
        >
          <>
            {søknadState?.søknad?.[BARN]?.map((barn, index) => (
              <OppsummeringBarn barn={barn} key={'barn-' + index} />
            ))}
            {søknadState?.søknad?.manuelleBarn?.map((barn) => (
              <OppsummeringBarn key={barn.internId} barn={barn} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.student.title')}
          editText={formatMessage('søknad.oppsummering.student.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STUDENT)}
        >
          <SummaryRowIfExists
            labelKey={`søknad.student.erStudent.legend`}
            value={søknadState?.søknad?.student?.erStudent}
          />
          <SummaryRowIfExists
            labelKey={`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`}
            value={søknadState?.søknad?.student?.kommeTilbake}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.utbetalinger.title')}
          editText={formatMessage('søknad.oppsummering.utbetalinger.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.ANDRE_UTBETALINGER)}
        >
          <SummaryRowIfExists
            labelKey={`søknad.andreUtbetalinger.lønn.label`}
            value={søknadState?.søknad?.andreUtbetalinger?.lønn}
          />
          {søknadState?.søknad?.andreUtbetalinger ? (
            <BodyShort>
              <Label>{formatMessage(`søknad.andreUtbetalinger.stønad.label`)}</Label>
              {søknadState?.søknad?.andreUtbetalinger?.stønad?.map(
                (stønadType: StønadType, index) => {
                  const stønadTekst = formatMessage(stønadTypeToAlternativNøkkel(stønadType));
                  return (
                    <BodyShort key={'stønad-' + index}>
                      {stønadType === StønadType.AFP
                        ? `${stønadTekst}, Utbetaler: ${søknadState?.søknad?.andreUtbetalinger?.afp?.hvemBetaler}`
                        : stønadTekst}
                    </BodyShort>
                  );
                }
              )}
            </BodyShort>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.tilleggsopplysninger.title')}
          editText={formatMessage('søknad.oppsummering.tilleggsopplysninger.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.TILLEGGSOPPLYSNINGER)}
        >
          <SummaryRowIfExists
            labelKey={`søknad.tilleggsopplysninger.tilleggsopplysninger.label`}
            value={søknadState?.søknad?.tilleggsopplysninger}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={formatMessage('søknad.oppsummering.vedlegg.title')}
          editText={formatMessage('søknad.oppsummering.vedlegg.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.VEDLEGG)}
        >
          <OppsummeringVedlegg søknadState={søknadState} />
        </AccordianItemOppsummering>
      </Accordion>
      <ConfirmationPanelWrapper
        label={formatMessage('søknad.oppsummering.confirmation.text')}
        control={control}
        name={SØKNAD_BEKREFT}
        error={errors?.[SØKNAD_BEKREFT]?.message}
      >
        <Label>{formatMessage('søknad.oppsummering.confirmation.title')}</Label>
      </ConfirmationPanelWrapper>
    </SoknadFormWrapper>
  );
};
export default Oppsummering;
