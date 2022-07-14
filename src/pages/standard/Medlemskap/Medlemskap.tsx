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
import { useFieldArray, useForm } from 'react-hook-form';
import { JaEllerNei, JaNeiVetIkke } from '../../../types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger, {
  ArbeidEllerBodd,
} from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from '../../../utils/date';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import Soknad, { Medlemskap as MedlemskapType, UtenlandsPeriode } from '../../../types/Soknad';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ColorPanel from '../../../components/panel/ColorPanel';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useDebounceLagreSoknad } from '../../../hooks/useDebounceLagreSoknad';

interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}
const UTENLANDSOPPHOLD = 'utenlandsOpphold';
const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_UTENFOR_NORGE_FØR_SYKDOM = 'arbeidetUtenforNorgeFørSykdom';
const OGSÅ_ARBEID_UTENFOR_NORGE = 'iTilleggArbeidUtenforNorge';
const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';
const MEDLEMSKAP = 'medlemskap';
const validateArbeidINorge = (boddINorge?: JaEllerNei) => boddINorge === JaEllerNei.NEI;
const validateArbeidUtenforNorgeFørSykdom = (boddINorge?: JaEllerNei) =>
  boddINorge === JaEllerNei.JA;
const valideOgsåArbeidetUtenforNorge = (boddINorge?: JaEllerNei, JobbINorge?: JaEllerNei) =>
  boddINorge === JaEllerNei.NEI && JobbINorge === JaEllerNei.JA;
const validateUtenlandsPeriode = (
  arbeidINorge?: JaEllerNei,
  arbeidUtenforNorge?: JaEllerNei,
  iTilleggArbeidUtenforNorge?: JaEllerNei
) => {
  return (
    arbeidUtenforNorge === JaEllerNei.JA ||
    arbeidINorge === JaEllerNei.NEI ||
    iTilleggArbeidUtenforNorge === JaEllerNei.JA
  );
};

export const Medlemskap = ({ onBackClick }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    [MEDLEMSKAP]: yup.object().shape({
      [BODD_I_NORGE]: yup
        .string()
        .required(formatMessage('søknad.medlemskap.harBoddINorgeSiste5År.validation.required'))
        .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI])
        .nullable(),
      [ARBEID_I_NORGE]: yup.string().when(BODD_I_NORGE, {
        is: validateArbeidINorge,
        then: (yupSchema) =>
          yupSchema
            .required(
              formatMessage('søknad.medlemskap.harArbeidetINorgeSiste5År.validation.required')
            )
            .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI])
            .nullable(),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      [ARBEID_UTENFOR_NORGE_FØR_SYKDOM]: yup.string().when([BODD_I_NORGE, ARBEID_I_NORGE], {
        is: validateArbeidUtenforNorgeFørSykdom,
        then: (yupSchema) =>
          yupSchema
            .required(formatMessage('søknad.medlemskap.arbeidUtenforNorge.validation.required'))
            .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI])
            .nullable(),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      [OGSÅ_ARBEID_UTENFOR_NORGE]: yup.string().when([BODD_I_NORGE, ARBEID_I_NORGE], {
        is: valideOgsåArbeidetUtenforNorge,
        then: (yupSchema) =>
          yupSchema
            .required(
              formatMessage('søknad.medlemskap.iTilleggArbeidUtenforNorge.validation.required')
            )
            .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
            .nullable(),
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
              formatMessage(
                'søknad.medlemskap.utenlandsperiode.boddINorgeArbeidUtenforNorge.validation.required'
              )
            ),
        })
        .when([OGSÅ_ARBEID_UTENFOR_NORGE], {
          is: (ogsåArbeidUtenforNorge: JaEllerNei) => ogsåArbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema.min(
              1,
              formatMessage(
                'søknad.medlemskap.utenlandsperiode.ogsåArbeidUtenforNorge.validation.required'
              )
            ),
        })
        .when([ARBEID_I_NORGE], {
          is: (arbeidINorge: JaEllerNei) => arbeidINorge === JaEllerNei.NEI,
          then: (yupSchema) =>
            yupSchema.min(
              1,
              formatMessage('søknad.medlemskap.utenlandsperiode.arbeidINorge.validation.required')
            ),
        }),
    }),
  });
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<{
    [MEDLEMSKAP]: MedlemskapType;
  }>({
    resolver: yupResolver(schema),
    defaultValues: {
      [MEDLEMSKAP]: søknadState?.søknad?.medlemskap,
    },
  });
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const [selectedUtenlandsPeriodeIndex, setSelectedUtenlandsPeriodeIndex] = useState<
    number | undefined
  >(undefined);

  const { fields, append, update, remove } = useFieldArray({
    name: `${MEDLEMSKAP}.${UTENLANDSOPPHOLD}`,
    control,
  });

  const selectedUtenlandsPeriode = useMemo(() => {
    if (selectedUtenlandsPeriodeIndex === undefined) return undefined;
    return fields[selectedUtenlandsPeriodeIndex];
  }, [selectedUtenlandsPeriodeIndex, fields]);

  const { stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
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

  const arbeidEllerBodd = useMemo(() => {
    if (boddINorge === JaEllerNei.NEI && arbeidINorge === JaEllerNei.NEI) {
      return ArbeidEllerBodd.BODD;
    }
    return ArbeidEllerBodd.ARBEID;
  }, [boddINorge, arbeidINorge]);
  useEffect(() => {
    if (boddINorge !== søknadState.søknad?.medlemskap?.harBoddINorgeSiste5År) {
      setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`, undefined);
      setValue(`${MEDLEMSKAP}.${ARBEID_I_NORGE}`, undefined);
      setValue(`${MEDLEMSKAP}.${OGSÅ_ARBEID_UTENFOR_NORGE}`, undefined);
      clearErrors();
      remove();
    }
  }, [boddINorge, søknadState]);
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

  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData<Soknad>(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => {
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
        onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
        nextButtonText={formatMessage('navigation.next')}
        backButtonText={formatMessage('navigation.back')}
        cancelButtonText={formatMessage('navigation.cancel')}
        errors={errors}
      >
        <Heading size="large" level="2">
          {formatMessage('søknad.medlemskap.title')}
        </Heading>
        <LucaGuidePanel>{formatMessage('søknad.medlemskap.guide.text')}</LucaGuidePanel>
        <RadioGroupWrapper
          name={`${MEDLEMSKAP}.${BODD_I_NORGE}`}
          legend={formatMessage('søknad.medlemskap.harBoddINorgeSiste5År.label')}
          control={control}
          error={errors?.[MEDLEMSKAP]?.[BODD_I_NORGE]?.message}
        >
          <ReadMore
            header={formatMessage('søknad.medlemskap.harBoddINorgeSiste5År.readMore.title')}
            type={'button'}
          >
            {formatMessage('søknad.medlemskap.harBoddINorgeSiste5År.readMore.text')}
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
              legend={formatMessage('søknad.medlemskap.harArbeidetINorgeSiste5År.label')}
              control={control}
              error={errors?.[MEDLEMSKAP]?.[ARBEID_I_NORGE]?.message}
            >
              <ReadMore
                header={formatMessage('søknad.medlemskap.harArbeidetINorgeSiste5År.readMore.title')}
                type={'button'}
              >
                {formatMessage('søknad.medlemskap.harArbeidetINorgeSiste5År.readMore.text')}
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
              legend={formatMessage('søknad.medlemskap.arbeidUtenforNorge.label')}
              description={formatMessage('søknad.medlemskap.arbeidUtenforNorge.description')}
              control={control}
              error={errors?.[MEDLEMSKAP]?.[ARBEID_UTENFOR_NORGE_FØR_SYKDOM]?.message}
            >
              <ReadMore
                header={formatMessage('søknad.medlemskap.arbeidUtenforNorge.readMore.title')}
                type={'button'}
              >
                {formatMessage('søknad.medlemskap.arbeidUtenforNorge.readMore.text')}
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
              legend={formatMessage('søknad.medlemskap.iTilleggArbeidUtenforNorge.label')}
              description={formatMessage(
                'søknad.medlemskap.iTilleggArbeidUtenforNorge.description'
              )}
              control={control}
              error={errors?.[MEDLEMSKAP]?.[OGSÅ_ARBEID_UTENFOR_NORGE]?.message}
            >
              <ReadMore
                header={formatMessage(
                  'søknad.medlemskap.iTilleggArbeidUtenforNorge.readMore.title'
                )}
                type={'button'}
              >
                {formatMessage('søknad.medlemskap.iTilleggArbeidUtenforNorge.readMore.text')}
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
            <BodyLong>
              {formatMessage(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`)}
            </BodyLong>
            {fields?.length > 0 && (
              <Heading size="xsmall" level="3">
                {formatMessage(
                  `søknad.medlemskap.utenlandsperiode.perioder.title.${arbeidEllerBodd}`
                )}
              </Heading>
            )}
            {fields?.map((field, index) => (
              <Table.Row key={field.id}>
                <Table.DataCell>
                  <Button
                    variant="tertiary"
                    type="button"
                    onClick={() => {
                      setSelectedUtenlandsPeriodeIndex(index);
                      setShowUtenlandsPeriodeModal(true);
                    }}
                  >{`${field?.land?.split(':')?.[1]} ${formatDate(
                    field?.fraDato,
                    'dd.MM.yyyy'
                  )} - ${formatDate(field?.tilDato, 'dd.MM.yyyy')}${
                    field?.iArbeid ? ' (Jobb)' : ''
                  }`}</Button>
                </Table.DataCell>
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
                  onClick={() => {
                    setSelectedUtenlandsPeriodeIndex(undefined);
                    setShowUtenlandsPeriodeModal(true);
                  }}
                >
                  <Add title={'Legg til'} />
                  {arbeidINorge === JaEllerNei.NEI
                    ? 'Legg til utenlandsopphold'
                    : 'Legg til periode med jobb utenfor Norge'}
                </Button>
              </Cell>
            </Grid>

            {/* TODO: react-hook-form antar at vi kun har validering på hvert enkelt field i FieldArrays */}
            {/* @ts-ignore-line */}
            {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message && (
              <div className={'navds-error-message navds-error-message--medium navds-label'}>
                {/* @ts-ignore-line*/}
                {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message}
              </div>
            )}
          </ColorPanel>
        )}
      </SoknadFormWrapper>
      <UtenlandsPeriodeVelger
        utenlandsPeriode={selectedUtenlandsPeriode}
        open={showUtenlandsPeriodeModal}
        onSave={(data) => {
          if (selectedUtenlandsPeriode === undefined) {
            append({ ...data });
          } else if (selectedUtenlandsPeriodeIndex !== undefined) {
            update(selectedUtenlandsPeriodeIndex, { ...data });
          }

          setShowUtenlandsPeriodeModal(false);
        }}
        arbeidEllerBodd={arbeidEllerBodd}
        onCancel={() => setShowUtenlandsPeriodeModal(false)}
        onClose={() => setShowUtenlandsPeriodeModal(false)}
      />
    </>
  );
};
