import {
  BodyShort,
  Radio,
  Button,
  Table,
  BodyLong,
  Heading,
  ReadMore,
  Cell,
  Grid,
} from '@navikt/ds-react';
import React, { useState, useEffect, useMemo } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { JaEllerNei, JaNeiVetIkke } from '../../../types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from '../../../utils/date';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import Soknad from '../../../types/Soknad';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import ColorPanel from '../../../components/panel/ColorPanel';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const UTENLANDSOPPHOLD = 'utenlandsOpphold';
const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_UTENFOR_NORGE_FØR_SYKDOM = 'arbeidUtenforNorge';
const OGSÅ_ARBEID_UTENFOR_NORGE = 'iTilleggArbeidUtenforNorge';
const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';
const MEDLEMSKAP = 'medlemskap';
const validateArbeidINorge = (boddINorge: JaEllerNei) => boddINorge === JaEllerNei.NEI;
const validateArbeidUtenforNorgeFørSykdom = (boddINorge: JaEllerNei) =>
  boddINorge === JaEllerNei.JA;
const valideOgsåArbeidetUtenforNorge = (boddINorge: JaEllerNei, JobbINorge: JaEllerNei) =>
  boddINorge === JaEllerNei.NEI && JobbINorge === JaEllerNei.JA;
const validateUtenlandsPeriode = (
  arbeidINorge: JaEllerNei,
  arbeidUtenforNorge: JaEllerNei,
  iTilleggArbeidUtenforNorge: JaEllerNei
) => {
  return (
    arbeidUtenforNorge === JaEllerNei.JA ||
    arbeidINorge === JaEllerNei.NEI ||
    iTilleggArbeidUtenforNorge === JaEllerNei.JA
  );
};

export const Medlemskap = ({ getText, onBackClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [MEDLEMSKAP]: yup.object().shape({
      [BODD_I_NORGE]: yup
        .string()
        .required(getText('form.medlemskap.boddINorge.required'))
        .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI], getText('form.medlemskap.boddINorge.required'))
        .typeError(getText('form.medlemskap.boddINorge.required')),
      [ARBEID_I_NORGE]: yup.string().when(BODD_I_NORGE, {
        is: validateArbeidINorge,
        then: (yupSchema) =>
          yupSchema
            .required(getText('form.medlemskap.arbeidINorge.required'))
            .oneOf(
              [JaNeiVetIkke.JA, JaNeiVetIkke.NEI],
              getText('form.medlemskap.arbeidINorge.required')
            )
            .typeError(getText('form.medlemskap.arbeidINorge.required')),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      [ARBEID_UTENFOR_NORGE_FØR_SYKDOM]: yup.string().when([BODD_I_NORGE, ARBEID_I_NORGE], {
        is: validateArbeidUtenforNorgeFørSykdom,
        then: (yupSchema) =>
          yupSchema
            .required(getText('form.medlemskap.arbeidUtenforNorge.required'))
            .oneOf(
              [JaNeiVetIkke.JA, JaNeiVetIkke.NEI],
              getText('form.medlemskap.arbeidUtenforNorge.required')
            )
            .typeError(getText('form.medlemskap.arbeidUtenforNorge.required')),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      [OGSÅ_ARBEID_UTENFOR_NORGE]: yup.string().when([BODD_I_NORGE, ARBEID_I_NORGE], {
        is: valideOgsåArbeidetUtenforNorge,
        then: (yupSchema) =>
          yupSchema
            .required(getText('form.medlemskap.iTilleggArbeidUtenforNorge.required'))
            .oneOf(
              [JaEllerNei.JA, JaEllerNei.NEI],
              getText('form.medlemskap.iTilleggArbeidUtenforNorge.required')
            )
            .typeError(getText('form.medlemskap.iTilleggArbeidUtenforNorge.required')),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      [UTENLANDSOPPHOLD]: yup
        .array()
        .when([BODD_I_NORGE, ARBEID_UTENFOR_NORGE_FØR_SYKDOM], {
          is: (boddINorge: JaEllerNei, arbeidUtenforNorge: JaEllerNei) =>
            boddINorge === JaEllerNei.JA && arbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema.min(
              1,
              getText('form.medlemskap.utenlandsOpphold.boddINorgeArbeidUtenforNorge')
            ),
        })
        .when([OGSÅ_ARBEID_UTENFOR_NORGE], {
          is: (ogsåArbeidUtenforNorge: JaEllerNei) => ogsåArbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema.min(1, getText('form.medlemskap.utenlandsOpphold.ogsåArbeidUtenforNorge')),
        })
        .when([ARBEID_I_NORGE], {
          is: (arbeidINorge: JaEllerNei) => arbeidINorge === JaEllerNei.NEI,
          then: (yupSchema) =>
            yupSchema.min(1, getText('form.medlemskap.utenlandsOpphold.arbeidINorge')),
        }),
    }),
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [`${MEDLEMSKAP}.${UTENLANDSOPPHOLD}`]: søknad?.medlemskap?.utenlandsOpphold || [],
    },
  });
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const { fields, append, remove } = useFieldArray({
    name: `${MEDLEMSKAP}.${UTENLANDSOPPHOLD}`,
    control,
  });
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const boddINorge = watch(`${MEDLEMSKAP}.${BODD_I_NORGE}`);
  const arbeidINorge = watch(`${MEDLEMSKAP}.${ARBEID_I_NORGE}`);
  const arbeidUtenforNorge = watch(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`);
  const iTilleggArbeidUtenforNorge = watch(`${MEDLEMSKAP}.${OGSÅ_ARBEID_UTENFOR_NORGE}`);
  const showArbeidINorge = useMemo(() => validateArbeidINorge(boddINorge), [boddINorge]);
  const showArbeidUtenforNorgeFørSykdom = useMemo(
    () => validateArbeidUtenforNorgeFørSykdom(boddINorge),
    [boddINorge]
  );
  const showOgsåArbeidetUtenforNorge = useMemo(
    () => valideOgsåArbeidetUtenforNorge(boddINorge, arbeidINorge),
    [boddINorge, arbeidINorge]
  );
  const showLeggTilUtenlandsPeriode = useMemo(
    () => validateUtenlandsPeriode(arbeidINorge, arbeidUtenforNorge, iTilleggArbeidUtenforNorge),
    [arbeidINorge, arbeidUtenforNorge, iTilleggArbeidUtenforNorge]
  );
  const hideArbeidInUtenlandsPeriode = useMemo(() => {
    if (boddINorge === JaEllerNei.NEI && arbeidINorge === JaEllerNei.NEI) {
      return false;
    }
    return true;
  }, [boddINorge, arbeidINorge]);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`, undefined);
    setValue(`${MEDLEMSKAP}.${ARBEID_I_NORGE}`, undefined);
    setValue(`${MEDLEMSKAP}.${OGSÅ_ARBEID_UTENFOR_NORGE}`, undefined);
    clearErrors();
    remove();
  }, [boddINorge]);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${OGSÅ_ARBEID_UTENFOR_NORGE}`, undefined);
    if (arbeidINorge === JaEllerNei.JA) remove();
    clearErrors();
  }, [arbeidINorge]);
  useEffect(() => {
    if (arbeidUtenforNorge === JaEllerNei.NEI) remove();
    clearErrors();
  }, [arbeidUtenforNorge]);
  useEffect(() => {
    if (iTilleggArbeidUtenforNorge === JaEllerNei.NEI) remove();
    clearErrors();
  }, [iTilleggArbeidUtenforNorge]);
  useEffect(() => {
    if (fields.length > 0) {
      clearErrors();
    }
  }, [fields]);

  const utenlandsPeriodeInfo = useMemo(
    () =>
      arbeidUtenforNorge === JaEllerNei.JA || iTilleggArbeidUtenforNorge === JaEllerNei.JA
        ? getText('steps.medlemskap.utenlandsPeriode.infoJaJa')
        : getText('steps.medlemskap.utenlandsPeriode.info'),
    [arbeidUtenforNorge, iTilleggArbeidUtenforNorge]
  );
  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        nextButtonText={'Neste steg'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <Heading size="large" level="2">
          {getText('steps.medlemskap.title')}
        </Heading>
        <LucaGuidePanel>{getText(`steps.medlemskap.guide`)}</LucaGuidePanel>
        <RadioGroupWrapper
          name={`${MEDLEMSKAP}.${BODD_I_NORGE}`}
          legend={getText('form.medlemskap.boddINorge.legend')}
          control={control}
          error={errors?.[MEDLEMSKAP]?.[BODD_I_NORGE]?.message}
        >
          <ReadMore header={getText('steps.medlemskap.boddINorgeReadMore.title')} type={'button'}>
            {getText('steps.medlemskap.boddINorgeReadMore.text')}
            <ul>
              <li>{getText('steps.medlemskap.boddINorgeReadMore.bullet1')}</li>
              <li>{getText('steps.medlemskap.boddINorgeReadMore.bullet2')}</li>
            </ul>
          </ReadMore>
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroupWrapper>
        {showArbeidINorge && (
          <>
            <RadioGroupWrapper
              name={`${MEDLEMSKAP}.${ARBEID_I_NORGE}`}
              legend={getText('form.medlemskap.arbeidINorge.legend')}
              control={control}
              error={errors?.[MEDLEMSKAP]?.[ARBEID_I_NORGE]?.message}
            >
              <ReadMore
                header={getText('steps.medlemskap.andreYtelserReadMore.title')}
                type={'button'}
              >
                <BodyLong>{getText('steps.medlemskap.andreYtelserReadMore.text')}</BodyLong>
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          </>
        )}
        {showArbeidUtenforNorgeFørSykdom && (
          // Gjelder §11-19 og beregning av utbetaling. Skal kun komme opp hvis §11-2 er oppfyltt
          <>
            <RadioGroupWrapper
              name={`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`}
              legend={getText('form.medlemskap.arbeidUtenforNorge.legend')}
              description={getText('form.medlemskap.arbeidUtenforNorge.helpText')}
              control={control}
              error={errors?.[MEDLEMSKAP]?.[ARBEID_UTENFOR_NORGE_FØR_SYKDOM]?.message}
            >
              <ReadMore
                header={getText('form.medlemskap.arbeidUtenforNorge.readMore.header')}
                type={'button'}
              >
                <BodyLong>{getText('form.medlemskap.arbeidUtenforNorge.readMore.text')}</BodyLong>
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          </>
        )}
        {showOgsåArbeidetUtenforNorge && (
          <>
            <RadioGroupWrapper
              name={`${MEDLEMSKAP}.${OGSÅ_ARBEID_UTENFOR_NORGE}`}
              legend={getText('form.medlemskap.iTilleggArbeidUtenforNorge.legend')}
              description={getText('form.medlemskap.iTilleggArbeidUtenforNorge.description')}
              control={control}
              error={errors?.[MEDLEMSKAP]?.[OGSÅ_ARBEID_UTENFOR_NORGE]?.message}
            >
              <ReadMore
                header={getText('form.medlemskap.iTilleggArbeidUtenforNorge.readMore.header')}
                type={'button'}
              >
                <BodyLong>
                  {getText('form.medlemskap.iTilleggArbeidUtenforNorge.readMore.text')}
                </BodyLong>
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          </>
        )}
        {showLeggTilUtenlandsPeriode && (
          <ColorPanel>
            <BodyLong>{utenlandsPeriodeInfo}</BodyLong>
            {fields?.length > 0 && (
              <Heading size="xsmall" level="3">
                {arbeidINorge === JaEllerNei.NEI
                  ? getText('steps.medlemskap.perioderOppholdHeading')
                  : getText('steps.medlemskap.perioderJobbHeading')}
              </Heading>
            )}
            {fields?.map((field, index) => (
              <Table.Row key={field.id}>
                <Table.DataCell>{`${field?.land?.split(':')?.[1]} ${formatDate(
                  field?.fraDato,
                  'dd.MM.yyyy'
                )} - ${formatDate(field?.tilDato, 'dd.MM.yyyy')}${
                  field?.iArbeid ? ' (Jobb)' : ''
                }`}</Table.DataCell>
                <Table.DataCell>
                  {
                    <Delete
                      onClick={() => remove(index)}
                      title={'Slett utenlandsopphold'}
                      role={'button'}
                      tabIndex={0}
                      onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                          remove(index);
                        }
                      }}
                    />
                  }
                </Table.DataCell>
              </Table.Row>
            ))}

            <Grid>
              <Cell xs={12}>
                <Button
                  variant="tertiary"
                  type="button"
                  onClick={() => setShowUtenlandsPeriodeModal(true)}
                >
                  <Add title={'Legg til'} />
                  {arbeidINorge === JaEllerNei.NEI
                    ? 'Legg til utenlandsopphold'
                    : 'Legg til periode med jobb utenfor Norge'}
                </Button>
              </Cell>
            </Grid>

            {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message && (
              <div className={'navds-error-message navds-error-message--medium navds-label'}>
                {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message}
              </div>
            )}
          </ColorPanel>
        )}
      </SoknadFormWrapper>
      <UtenlandsPeriodeVelger
        open={showUtenlandsPeriodeModal}
        onSave={(data) => {
          append({ ...data });
          setShowUtenlandsPeriodeModal(false);
        }}
        hideIArbeid={hideArbeidInUtenlandsPeriode}
        onCancel={() => setShowUtenlandsPeriodeModal(false)}
        onClose={() => setShowUtenlandsPeriodeModal(false)}
        getText={getText}
        heading={getText('steps.medlemskap.utenlandsPeriode.title')}
        ingress={utenlandsPeriodeInfo}
      />
    </>
  );
};
