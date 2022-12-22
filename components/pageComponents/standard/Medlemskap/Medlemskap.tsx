import { BodyShort, Button, Cell, Grid, Heading, Radio, ReadMore, Table } from '@navikt/ds-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { JaEllerNei, JaNeiVetIkke } from 'types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger, {
  ArbeidEllerBodd,
} from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from 'utils/date';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { Medlemskap as MedlemskapType, Soknad } from 'types/Soknad';
import { useStepWizard } from 'context/stepWizardContextV2';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import * as styles from './Medlemskap.module.css';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { shouldShowPeriodevelger } from './medlemskapUtils';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const UTENLANDSOPPHOLD = 'utenlandsOpphold';
export const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_UTENFOR_NORGE_FØR_SYKDOM = 'arbeidetUtenforNorgeFørSykdom';
const OGSÅ_ARBEID_UTENFOR_NORGE = 'iTilleggArbeidUtenforNorge';
export const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';
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

export const getMedlemskapSchema = (formatMessage: (id: string) => string) => {
  return yup.object().shape({
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
};
export const utenlandsPeriodeArbeidEllerBodd = (
  arbeidINorge?: JaEllerNei,
  boddINorge?: JaEllerNei
) => {
  if (boddINorge === JaEllerNei.NEI && arbeidINorge === JaEllerNei.NEI) {
    return ArbeidEllerBodd.BODD;
  }
  return ArbeidEllerBodd.ARBEID;
};
export const Medlemskap = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<{
    [MEDLEMSKAP]: MedlemskapType;
  }>({
    resolver: yupResolver(getMedlemskapSchema(formatMessage)),
    defaultValues: {
      [MEDLEMSKAP]: defaultValues?.søknad?.medlemskap,
    },
    shouldUnregister: true,
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

  const { stepList } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const boddINorge = useWatch({ control, name: `${MEDLEMSKAP}.${BODD_I_NORGE}` });
  const arbeidINorge = useWatch({ control, name: `${MEDLEMSKAP}.${ARBEID_I_NORGE}` });
  const arbeidUtenforNorge = useWatch({
    control,
    name: `${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`,
  });
  const iTilleggArbeidUtenforNorge = useWatch({
    control,
    name: `${MEDLEMSKAP}.${OGSÅ_ARBEID_UTENFOR_NORGE}`,
  });
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

  const arbeidEllerBodd = useMemo(
    () => utenlandsPeriodeArbeidEllerBodd(arbeidINorge, boddINorge),
    [boddINorge, arbeidINorge]
  );

  useEffect(() => {
    if (!shouldShowPeriodevelger(arbeidUtenforNorge, arbeidINorge, iTilleggArbeidUtenforNorge)) {
      remove();
    }
  }, [arbeidINorge, arbeidUtenforNorge, iTilleggArbeidUtenforNorge]);

  const previousArbeidINorgeValue = useRef(defaultValues?.søknad?.medlemskap?.[ARBEID_I_NORGE]);

  // Håndterer spesialcase hvor periodevelger ikke resettes ved endring av arbeidINorge
  useEffect(() => {
    if (arbeidINorge === JaEllerNei.NEI && arbeidINorge !== previousArbeidINorgeValue.current) {
      remove();
    }
  }, [arbeidINorge, previousArbeidINorgeValue.current]);

  useEffect(() => {
    previousArbeidINorgeValue.current = arbeidINorge;
  }, [arbeidINorge]);

  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          onNext(data);
        }, setFocusOnErrorSummary)}
        onBack={() => {
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
        onDelete={async () => {
          await deleteOpplastedeVedlegg(søknadState.søknad);
          await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
        }}
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
          <ColorPanel color={'grey'}>
            <BodyShort spacing>
              {formatMessage(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`)}
            </BodyShort>
            {arbeidEllerBodd === 'BODD' && (
              <BodyShort spacing>
                {formatMessage(
                  `søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}_2`
                )}
              </BodyShort>
            )}
            {fields?.length > 0 ? (
              <Table size="medium">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell colSpan={2}>
                      <Heading size="xsmall" level="3">
                        {formatMessage(
                          `søknad.medlemskap.utenlandsperiode.perioder.title.${arbeidEllerBodd}`
                        )}
                      </Heading>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {fields?.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.DataCell className={styles.dataCell}>
                        <Button
                          variant="tertiary"
                          type="button"
                          onClick={() => {
                            setSelectedUtenlandsPeriodeIndex(index);
                            setShowUtenlandsPeriodeModal(true);
                          }}
                        >
                          <div className={styles.tableRowButtonContainer}>
                            <span>{`${field?.land?.split(':')?.[1]} `}</span>
                            <span>
                              {`${formatDate(field?.fraDato, 'MMMM yyyy')} - ${formatDate(
                                field?.tilDato,
                                'MMMM yyyy'
                              )}${field?.iArbeid === 'Ja' ? ' (Jobb)' : ''}`}
                            </span>
                          </div>
                        </Button>
                      </Table.DataCell>
                      <Table.DataCell>
                        <Button
                          type={'button'}
                          variant={'tertiary'}
                          onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                              remove(index);
                            }
                          }}
                          onClick={() => remove(index)}
                          icon={
                            <Delete
                              className={styles.deleteIcon}
                              title={'Slett utenlandsopphold'}
                              role={'button'}
                              tabIndex={0}
                            />
                          }
                          iconPosition={'left'}
                        >
                          Fjern
                        </Button>
                      </Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <></>
            )}
            <Grid>
              <Cell xs={12}>
                <Button
                  id="medlemskap.utenlandsOpphold"
                  variant="secondary"
                  type="button"
                  icon={<Add title={'Legg til'} />}
                  iconPosition={'left'}
                  onClick={() => {
                    setSelectedUtenlandsPeriodeIndex(undefined);
                    setShowUtenlandsPeriodeModal(true);
                  }}
                >
                  {arbeidINorge === JaEllerNei.NEI
                    ? 'Registrer utenlandsopphold'
                    : 'Registrer periode med jobb utenfor Norge'}
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
