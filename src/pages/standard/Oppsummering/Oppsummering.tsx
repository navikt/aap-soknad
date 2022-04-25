import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
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
import { formatDate } from '../../../utils/date';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';

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
      <Accordion>
        <AccordianItemOppsummering title={'Om deg'}>
          <OppsummeringKontaktinfo getText={getText} />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering title={'Startdato og ferie'}>
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
        <AccordianItemOppsummering title={getText('steps.medlemskap.title')}>
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
        <AccordianItemOppsummering title={getText('steps.yrkesskade.title')}>
          <SummaryRowIfExists
            labelKey={`form.yrkesskade.legend`}
            value={søknadState?.søknad?.yrkesskade}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering title={getText('steps.andre_utbetalinger.title')}>
          <>
            <SummaryRowIfExists
              labelKey={`form.andreUtbetalinger.lønn.legend`}
              value={søknadState?.søknad?.andreUtbetalinger?.lønn}
            />
            <SummaryRowIfExists
              labelKey={`form.andreUtbetalinger.stønad.legend`}
              value={søknadState?.søknad?.andreUtbetalinger?.stønad?.join(', ')}
            />
            {søknadState?.søknad?.andreUtbetalinger?.annet ? (
              [søknadState?.søknad?.andreUtbetalinger?.annet]?.map((e, index) => (
                <div key={index}>
                  <Label>{'Annet:'}</Label>
                  <Grid>
                    <Cell xs={4}>
                      <Label>{getText('form.andreUtbetalinger.annet.utbetaling.label')}</Label>
                      <BodyShort>{e?.utbetalingsNavn}</BodyShort>
                    </Cell>
                    <Cell xs={4}>
                      <Label>{getText('form.andreUtbetalinger.annet.utbetaler.label')}</Label>
                      <BodyShort>{e?.utbetalerNavn}</BodyShort>
                    </Cell>
                  </Grid>
                </div>
              ))
            ) : (
              <></>
            )}
          </>
        </AccordianItemOppsummering>
        <AccordianItemOppsummering title={getText('steps.fastlege.title')}>
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
        <AccordianItemOppsummering title={getText('steps.barnetillegg.title')}>
          {søknadState?.søknad?.barnetillegg?.map((barn) => (
            <OppsummeringBarn barn={barn} />
          ))}
        </AccordianItemOppsummering>
        <AccordianItemOppsummering title={getText('steps.student.title')}>
          <SummaryRowIfExists
            labelKey={`form.student.legend`}
            value={søknadState?.søknad?.student?.erStudent}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering title={getText('steps.tilleggsopplysninger.title')}>
          <SummaryRowIfExists
            labelKey={`form.tilleggsopplysninger.label`}
            value={søknadState?.søknad?.tilleggsopplysninger}
          />
        </AccordianItemOppsummering>
        <AccordianItemOppsummering title={getText('steps.vedlegg.title')}>
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
    </SoknadFormWrapper>
  );
};
export default Oppsummering;
