'use client';
import {
  Accordion,
  Alert,
  BodyShort,
  ConfirmationPanel,
  Heading,
  Label,
  Switch,
} from '@navikt/ds-react';
import React, { useState } from 'react';
import AccordianItemOppsummering from './AccordianItemOppsummering/AccordianItemOppsummering';
import OppsummeringKontaktinfo from './OppsummeringKontaktinfo/OppsummeringKontaktinfo';
import OppsummeringUtenlandsopphold from './OppsummeringUtenlandsopphold/OppsummeringUtenlandsopphold';
import OppsummeringBehandler from './OppsummeringBehandler/OppsummeringBehandler';
import * as yup from 'yup';
import { goToNamedStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { StepNames } from 'lib/defaultStepList';
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
import { formatTelefonnummer } from 'utils/StringFormatters';
import OppsummeringPeriode from './OppsummeringPeriode/OppsummeringPeriode';
import { isNonEmptyPeriode } from 'utils/periode';
import {
  FerieTypeToMessageKey,
  getStartDatoSchema,
} from 'components/pageComponents/standard/StartDato/StartDato';
import { getYrkesskadeSchema } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';

import { getBehandlerSchema } from 'components/pageComponents/standard/Behandlere/Behandlere';
import { useTranslations } from 'next-intl';
import { getMedlemskapSchema } from '../Medlemskap/medlemskapSchema';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { validate } from 'lib/utils/validationUtils';
import { useFormErrors } from 'hooks/FormErrorHook';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';
import { OppsummeringBarn } from 'components/pageComponents/standard/Oppsummering/OppsummeringBarn/OppsummeringBarn';
// eslint-disable-next-line max-len
import { OppsummeringManuelleBarn } from 'components/pageComponents/standard/Oppsummering/OppsummeringBarn/OppsummeringManuelleBarn';
import { Person } from 'app/api/oppslagapi/person/route';
import { KrrKontaktInfo } from 'app/api/oppslag/krr/route';
import { LucaGuidePanel } from 'components/LucaGuidePanel';

interface OppsummeringProps {
  onBackClick: () => void;
  onSubmitSoknad: () => Promise<boolean>;
  submitErrorMessageRef: React.MutableRefObject<null>;
  hasSubmitError: boolean;
  kontaktinformasjon: KrrKontaktInfo | null;
  person: Person;
}

const Oppsummering = ({
  onBackClick,
  onSubmitSoknad,
  submitErrorMessageRef,
  hasSubmitError,
  kontaktinformasjon,
  person,
}: OppsummeringProps) => {
  const t = useTranslations();
  const [nextIsLoading, setNextIsLoading] = useState<boolean>(false);
  const { errors, setErrors, clearErrors, findError } = useFormErrors();

  const { søknadState, søknadDispatch } = useSoknad();
  const { stepWizardDispatch } = useStepWizard();

  const schema = yup.object().shape({
    søknadBekreft: yup
      .boolean()
      .required(t('søknad.oppsummering.confirmation.required'))
      .oneOf([true], t('søknad.oppsummering.confirmation.required')),
  });

  const [toggleAll, setToggleAll] = useState<boolean | undefined>(true);
  const [startDatoHasErrors] = useState<boolean>(
    !getStartDatoSchema(t).isValidSync({
      sykepenger: søknadState.søknad?.sykepenger,
      ferie: søknadState.søknad?.ferie,
    }),
  );
  const [medlemskapHasErrors] = useState<boolean>(
    !getMedlemskapSchema(t).isValidSync(søknadState.søknad),
  );
  const [yrkesskadeHasErrors] = useState<boolean>(
    !getYrkesskadeSchema(t).isValidSync(søknadState.søknad),
  );
  const [behandlereHasErrors] = useState<boolean>(
    !getBehandlerSchema(t).isValidSync(søknadState.søknad),
  );
  const [studentHasErrors] = useState<boolean>(
    !getStudentSchema(t).isValidSync(søknadState?.søknad?.student),
  );

  const [utbetalingerHasErrors] = useState<boolean>(
    !getAndreUtbetalingerSchema(t).isValidSync(søknadState?.søknad?.andreUtbetalinger),
  );

  const SummaryRowIfExists = ({ labelKey, value }: { labelKey: string; value?: any }) => {
    return value ? (
      <div>
        <Label>{t(labelKey)}</Label>
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
      nextButtonText={t('navigation.send')}
    >
      <Heading size="large" level="2">
        {t('søknad.oppsummering.title')}
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
      <LucaGuidePanel>{t('søknad.oppsummering.guide.text')}</LucaGuidePanel>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Switch position="right" size="medium" onChange={() => setToggleAll(!toggleAll)}>
          {!toggleAll
            ? t('søknad.oppsummering.toggle.open')
            : t('søknad.oppsummering.toggle.close')}
        </Switch>
      </div>
      <Accordion>
        <AccordianItemOppsummering
          title={t('søknad.oppsummering.contactInformation.title')}
          defaultOpen={true}
          showEdit={false}
          toggleAll={toggleAll}
        >
          <OppsummeringKontaktinfo kontaktinformasjon={kontaktinformasjon} person={person} />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={t('søknad.oppsummering.startDato.title')}
          editText={t('søknad.oppsummering.startDato.editText')}
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
                ? t(FerieTypeToMessageKey(søknadState.søknad.ferie.ferieType))
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
              <Label>{t('søknad.oppsummering.startDato.planlagtFerie')}</Label>
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
          title={t('søknad.oppsummering.medlemskap.title')}
          editText={t('søknad.oppsummering.medlemskap.editText')}
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
                {t('søknad.oppsummering.medlemskap.utenlandsopphold.title')}
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
          title={t('søknad.oppsummering.yrkesskade.title')}
          editText={t('søknad.oppsummering.yrkesskade.editText')}
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
          title={t('søknad.oppsummering.helseopplysninger.title')}
          editText={t('søknad.oppsummering.helseopplysninger.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.FASTLEGE)}
          hasError={behandlereHasErrors}
        >
          <>
            {søknadState?.søknad?.fastlege?.map((fastlege, index) => (
              <article key={'fastlege-' + index}>
                <Heading size={'small'} level={'3'}>
                  {t('søknad.oppsummering.helseopplysninger.fastlege')}
                </Heading>
                <BodyShort>{fastlege.navn}</BodyShort>
                <BodyShort>{fastlege.kontaktinformasjon.kontor}</BodyShort>
                <BodyShort>{fastlege.kontaktinformasjon.adresse}</BodyShort>
                <BodyShort>{`Telefon: ${formatTelefonnummer(
                  fastlege.kontaktinformasjon.telefon,
                )}`}</BodyShort>
                <BodyShort>{`${t('søknad.oppsummering.helseopplysninger.informasjonOmFastlege')} ${fastlege.erRegistrertFastlegeRiktig}`}</BodyShort>
              </article>
            ))}

            {søknadState?.søknad?.andreBehandlere?.map((behandler) => (
              <OppsummeringBehandler key={behandler.id} behandler={behandler} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={t('søknad.oppsummering.barnetillegg.title')}
          editText={t('søknad.oppsummering.barnetillegg.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.BARNETILLEGG)}
        >
          <>
            {søknadState?.søknad?.barn?.map((barn, index) => (
              <OppsummeringBarn barn={barn} key={'barn-' + index} />
            ))}
            {søknadState?.søknad?.manuelleBarn?.map((barn) => (
              <OppsummeringManuelleBarn key={barn.internId} barn={barn} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={t('søknad.oppsummering.student.title')}
          editText={t('søknad.oppsummering.student.editText')}
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STUDENT)}
          hasError={studentHasErrors}
        >
          <SummaryRowIfExists
            labelKey={`søknad.student.erStudent.legend`}
            value={
              søknadState?.søknad?.student?.erStudent &&
              t(jaNeiAvbruttToTekstnøkkel(søknadState?.søknad?.student?.erStudent))
            }
          />
          <SummaryRowIfExists
            labelKey={`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`}
            value={søknadState?.søknad?.student?.kommeTilbake}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={t('søknad.oppsummering.utbetalinger.title')}
          editText={t('søknad.oppsummering.utbetalinger.editText')}
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
              <Label>{t(`søknad.andreUtbetalinger.stønad.label`)}</Label>
              {søknadState?.søknad?.andreUtbetalinger?.stønad?.map(
                (stønadType: StønadType, index) => {
                  const stønadTekst = t(stønadTypeToAlternativNøkkel(stønadType));
                  return (
                    <BodyShort key={'stønad-' + index}>
                      {stønadType === StønadType.AFP
                        ? `${stønadTekst}, Utbetaler: ${søknadState?.søknad?.andreUtbetalinger?.afp?.hvemBetaler}`
                        : stønadTekst}
                    </BodyShort>
                  );
                },
              )}
            </div>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={t('søknad.oppsummering.vedlegg.title')}
          editText={t('søknad.oppsummering.vedlegg.editText')}
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
        label={t('søknad.oppsummering.confirmation.text')}
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
        <Label>{t('søknad.oppsummering.confirmation.title')}</Label>
      </ConfirmationPanel>
    </SoknadFormWrapperNew>
  );
};
export default Oppsummering;
