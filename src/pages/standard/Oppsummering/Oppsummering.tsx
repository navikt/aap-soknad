import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import { GetText } from '../../../hooks/useTexts';
import { Accordion, BodyShort, Heading, Label, Switch } from '@navikt/ds-react';
import React, { useState } from 'react';
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
import { formatDate } from '../../../utils/date';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { useVedleggContext } from '../../../context/vedleggContext';
import { goToNamedStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { StepNames } from '../index';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';

interface OppsummeringProps {
  getText: GetText;
  onBackClick: () => void;
  onCancelClick: () => void;
  onSubmitSoknad: (data: Soknad) => void;
}

const Oppsummering = ({
  getText,
  onBackClick,
  onCancelClick,
  onSubmitSoknad,
}: OppsummeringProps) => {
  const { søknadState } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const { vedleggState } = useVedleggContext();
  const { fastlege } = useSokerOppslag();
  const schema = yup.object().shape({});
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const [toggleAll, setToggleAll] = useState(undefined);

  const SummaryRowIfExists = ({ labelKey, value }: { labelKey: string; value?: any }) => {
    return value ? (
      <BodyShort>
        <Label>{getText(labelKey)}</Label>
        <span>{value}</span>
      </BodyShort>
    ) : (
      <></>
    );
  };
  const editStep = (stepName: string) => goToNamedStep(stepWizardDispatch, stepName);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onSubmitSoknad(data);
      })}
      onBack={() => onBackClick()}
      onCancel={() => onCancelClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {getText('steps.oppsummering.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort>
          Alt du har fylt inn er nå lagret. Her kan du se over at alt er riktig, og ved behov endre
          opplysninger, før du sender inn søknaden.
        </BodyShort>
      </LucaGuidePanel>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Switch position="right" size="medium" onChange={() => setToggleAll(!toggleAll)}>
          Åpne alle
        </Switch>
      </div>
      <Accordion>
        <AccordianItemOppsummering
          title={'Om deg'}
          defaultOpen={true}
          showEdit={false}
          toggleAll={toggleAll}
        >
          <OppsummeringKontaktinfo getText={getText} />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={'Ønsket startdato'}
          editText="Endre opplysninger om startdato"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STARTDATO)}
        >
          <SummaryRowIfExists
            labelKey={'form.startDato.label'}
            value={formatDate(søknadState?.søknad?.startDato)}
          />
          <SummaryRowIfExists
            labelKey={'form.ferie.skalHaFerie.legend'}
            value={søknadState?.søknad?.ferie?.skalHaFerie}
          />
          <div>
            <Label>{getText('form.ferie.skalHaFerie.legend')}</Label>
            <BodyShort>{søknadState?.søknad?.ferie?.skalHaFerie}</BodyShort>
          </div>
          <SummaryRowIfExists
            labelKey={'form.ferie.ferieType.legend'}
            value={søknadState?.søknad?.ferie?.type}
          />
          <SummaryRowIfExists
            labelKey={'form.ferie.antallDager.label'}
            value={søknadState?.søknad?.ferie?.antallDager}
          />
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
          title={getText('steps.medlemskap.title')}
          editText="Endre opplysninger om hvor du har bodd og jobbet"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.MEDLEMSKAP)}
        >
          <SummaryRowIfExists
            labelKey={'form.medlemskap.boddINorge.legend'}
            value={søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År}
          />
          <SummaryRowIfExists
            labelKey={'form.medlemskap.arbeidINorge.legend'}
            value={søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År}
          />
          <SummaryRowIfExists
            labelKey={'form.medlemskap.arbeidUtenforNorge.legend'}
            value={søknadState?.søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom}
          />
          {søknadState?.søknad?.medlemskap?.utenlandsOpphold ? (
            <>
              <Label>{'Utenlandsopphold'}</Label>
              <OppsummeringUtenlandsopphold
                getText={getText}
                opphold={søknadState?.søknad?.medlemskap?.utenlandsOpphold}
              />
            </>
          ) : (
            <></>
          )}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={getText('steps.yrkesskade.title')}
          editText="Endre opplysninger om yrkesskade"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.YRKESSKADE)}
        >
          <SummaryRowIfExists
            labelKey={`form.yrkesskade.legend`}
            value={søknadState?.søknad?.yrkesskade}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={getText('steps.fastlege.title')}
          editText="Endre informasjon om kontaktperson for helseopplysninger"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.FASTLEGE)}
        >
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
        <AccordianItemOppsummering
          title={getText('steps.barnetillegg.title')}
          editText="Endre opplysninger om barn"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.BARNETILLEGG)}
        >
          <>
            {søknadState?.søknad?.barnetillegg?.map((barn) => (
              <OppsummeringBarn barn={barn} />
            ))}
            {søknadState?.søknad?.manuelleBarn?.map((barn) => (
              <OppsummeringBarn barn={barn} />
            ))}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={getText('steps.student.title')}
          editText="Endre på om du er student"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.STUDENT)}
        >
          <SummaryRowIfExists
            labelKey={`form.student.legend`}
            value={søknadState?.søknad?.student?.erStudent}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={getText('steps.andre_utbetalinger.title')}
          editText="Endre opplysninger om utbetalinger"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.ANDRE_UTBETALINGER)}
        >
          <SummaryRowIfExists
            labelKey={`form.andreUtbetalinger.lønn.legend`}
            value={søknadState?.søknad?.andreUtbetalinger?.lønn}
          />
          <SummaryRowIfExists
            labelKey={`form.andreUtbetalinger.stønad.legend`}
            value={søknadState?.søknad?.andreUtbetalinger?.stønad?.join(', ')}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={getText('steps.tilleggsopplysninger.title')}
          editText="Endre tilleggsopplysninger"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.TILLEGGSOPPLYSNINGER)}
        >
          <SummaryRowIfExists
            labelKey={`form.tilleggsopplysninger.label`}
            value={søknadState?.søknad?.tilleggsopplysninger}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering
          title={getText('steps.vedlegg.title')}
          editText="Endre vedlegg"
          toggleAll={toggleAll}
          onEdit={() => editStep(StepNames.VEDLEGG)}
        >
          <>
            {vedleggState?.requiredVedlegg?.map((vedlegg) => {
              if (vedlegg?.type?.split('-')?.[0] === 'barn') return <></>;
              return (
                <>
                  <Label>{vedlegg?.description}</Label>
                  {søknadState?.søknad?.vedlegg?.[vedlegg.type]?.map((vedleggFile) => (
                    <BodyShort>{vedleggFile?.name}</BodyShort>
                  ))}
                </>
              );
            })}
            {vedleggState?.requiredVedlegg?.find(
              (vedlegg) => vedlegg?.type?.split('-')?.[0] === 'barn'
            ) && (
              <>
                <Label>{'Fødselsattest eller bostedbevis for barn:'}</Label>
                {søknadState?.søknad?.vedlegg?.barn?.map((vedleggFile) => (
                  <BodyShort>{vedleggFile?.name}</BodyShort>
                ))}
              </>
            )}
            {søknadState?.søknad?.vedlegg?.annet &&
              søknadState?.søknad?.vedlegg?.annet?.length > 0 && (
                <>
                  <Label>{'Annet:'}</Label>
                  {søknadState?.søknad?.vedlegg?.annet?.map((vedleggFile) => (
                    <BodyShort>{vedleggFile?.name}</BodyShort>
                  ))}
                </>
              )}
          </>
        </AccordianItemOppsummering>
      </Accordion>
      <ConfirmationPanelWrapper
        label={getText('steps.oppsummering.confirmation')}
        control={control}
        name="søknadBekreft"
        error={errors?.søknadBekreft?.message}
      >
        <Label>{getText('steps.veiledning.rettogpliktConfirmation.title')}</Label>
      </ConfirmationPanelWrapper>
    </SoknadFormWrapper>
  );
};
export default Oppsummering;
