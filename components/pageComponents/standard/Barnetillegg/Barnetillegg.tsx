import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Label,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { JaEllerNei } from 'types/Generic';
import { ManuelleBarn, Soknad } from 'types/Soknad';
import * as classes from './Barnetillegg.module.css';
import { Add, Delete } from '@navikt/ds-icons';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { AddBarnModal, Relasjon } from './AddBarnModal';
import { formatNavn } from 'utils/StringFormatters';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { updateSøknadData } from 'context/soknadContextCommon';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { formatDate } from 'utils/date';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { IntlFormatters, useIntl } from 'react-intl';
import { useFormErrors } from '../../../../hooks/useFormErrors';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { validate } from '../../../../lib/utils/validationUtils';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export const GRUNNBELØP = '118 620';

export const getUniqueIshIdForBarn = (barn: ManuelleBarn) => {
  return `${formatDate(barn.fødseldato, 'yyyy-MM-dd') ?? ''}_${barn.navn.fornavn}_${
    barn.navn.etternavn
  }`;
};

export const getBarnetillegSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    barn: yup.array().of(
      yup.object().shape({
        harInntekt: yup
          .string()
          .nullable()
          .required(
            formatMessage(
              { id: 'søknad.barnetillegg.leggTilBarn.modal.harInntekt.validation.required' },
              {
                grunnbeløp: GRUNNBELØP,
              }
            )
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
      })
    ),
  });

export const Barnetillegg = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { errors, setErrors, clearErrors, findError } = useFormErrors();
  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { currentStepIndex, stepWizardDispatch } = useStepWizard();
  const { stepList } = useStepWizard();
  // const {
  //   control,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<{
  //   [BARN]: Array<Barn>;
  //   [MANUELLE_BARN]: Array<ManuelleBarn>;
  // }>({
  //   //@ts-ignore
  //   resolver: yupResolver(getBarnetillegSchema(formatMessage)),
  //   defaultValues: {
  //     [BARN]: defaultValues?.søknad?.[BARN],
  //     [MANUELLE_BARN]: defaultValues?.søknad?.[MANUELLE_BARN],
  //   },
  // });
  const [selectedBarn, setSelectedBarn] = useState<ManuelleBarn | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  // const { fields } = useFieldArray({
  //   name: BARN,
  //   control,
  // });

  // const {
  //   fields: manuelleBarnFields,
  //   append: manuelleBarnAppend,
  //   remove: manuelleBarnRemove,
  //   update: manuelleBarnUpdate,
  // } = useFieldArray({
  //   name: MANUELLE_BARN,
  //   control,
  // });

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  // const allFields = useWatch({ control });
  // useEffect(() => {
  //   debouncedLagre(søknadState, stepList, allFields);
  // }, [allFields]);

  useEffect(() => {
    if (!showModal) {
      setSelectedBarn(undefined);
    }
  }, [showModal]);

  // const selectedBarn = useMemo(() => {
  //   if (selectedBarnIndex === undefined) return undefined;
  //   return manuelleBarnFields[selectedBarnIndex];
  // }, [selectedBarnIndex, manuelleBarnFields]);

  const erForelderTilManueltBarn = useMemo(() => {
    return (
      defaultValues?.søknad?.manuelleBarn &&
      defaultValues?.søknad?.manuelleBarn.filter((barn) => barn.relasjon === Relasjon.FORELDER)
        .length > 0
    );
  }, [defaultValues?.søknad?.manuelleBarn]);

  const erFosterforelderTilManueltBarn = useMemo(() => {
    return (
      defaultValues?.søknad?.manuelleBarn &&
      defaultValues?.søknad?.manuelleBarn.filter(
        (barn) => barn.relasjon === Relasjon.FOSTERFORELDER
      ).length > 0
    );
  }, [defaultValues?.søknad?.manuelleBarn]);

  const harManuelleBarn = () =>
    defaultValues?.søknad?.manuelleBarn && defaultValues.søknad.manuelleBarn.length > 0;
  const harBarn = () => defaultValues?.søknad?.barn && defaultValues.søknad.barn.length > 0;

  // const editNyttBarn = (index: number) => {
  //   setSelectedBarnIndex(index);
  //   setShowModal(true);
  // };
  // const saveNyttBarn = (barn: ManuelleBarn) => {
  //   if (selectedBarn === undefined) {
  //     barn.internId = crypto.randomUUID();
  //     manuelleBarnAppend({
  //       ...barn,
  //     });
  //     addRequiredVedlegg(
  //       [
  //         {
  //           filterType: barn.relasjon,
  //           type: `barn-${barn.internId}`,
  //           description: formatMessage(
  //             { id: `søknad.vedlegg.andreBarn.description.${barn.relasjon}` },
  //             {
  //               navn: `${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
  //             }
  //           ),
  //         },
  //       ],
  //       søknadDispatch
  //     );
  //   } else if (selectedBarnIndex !== undefined) {
  //     manuelleBarnUpdate(selectedBarnIndex, {
  //       ...barn,
  //     });
  //   }
  //   setShowModal(false);
  // };
  // const slettBarn = (index: number) => {
  //   if (index != undefined) {
  //     const barn = manuelleBarnFields[index];
  //     removeRequiredVedlegg(`barn-${barn.internId}`, søknadDispatch);
  //     manuelleBarnRemove(index);
  //     setShowModal(false);
  //   }
  // };
  return (
    <>
      <SoknadFormWrapperNew
        onNext={async () => {
          const errors = await validate(getBarnetillegSchema(formatMessage), søknadState.søknad);
          if (errors) {
            setErrors(errors);
            setFocusOnErrorSummary();
          } else {
            logSkjemastegFullførtEvent(currentStepIndex ?? 0);
            completeAndGoToNextStep(stepWizardDispatch);
          }
        }}
        onBack={() => {
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
        // onDelete={async () => {
        //   await deleteOpplastedeVedlegg(søknadState.søknad);
        //   await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
        // }}
        errors={errors}
      >
        <Heading size="large" level="2">
          {formatMessage({ id: 'søknad.barnetillegg.title' })}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>{formatMessage({ id: 'søknad.barnetillegg.guide.text1' })}</BodyShort>
          <BodyShort>{formatMessage({ id: 'søknad.barnetillegg.guide.text2' })}</BodyShort>
        </LucaGuidePanel>
        <div>
          <Heading size="small" level="3" spacing>
            {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.title' })}
          </Heading>
          {defaultValues?.søknad?.barn?.length === 0 && (
            <BodyShort spacing>
              {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.notfound' })}
            </BodyShort>
          )}
          {defaultValues?.søknad?.barn && defaultValues?.søknad?.barn?.length > 0 && (
            <ul className={classes.barnList}>
              {defaultValues?.søknad?.barn.map((barn, index) => {
                return (
                  <li key={barn.fnr}>
                    <article className={classes.barneKort}>
                      <BodyShort>
                        <Label>
                          {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.navn' })}:{' '}
                        </Label>
                        {formatNavn(barn?.navn)}
                      </BodyShort>
                      <BodyShort>
                        <Label>
                          {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.fødselsdato' })}
                          :{' '}
                        </Label>
                        {formatDate(barn?.fødseldato)}
                      </BodyShort>
                      <RadioGroup
                        legend={formatMessage(
                          { id: 'søknad.barnetillegg.registrerteBarn.harInntekt.label' },
                          {
                            grunnbeløp: GRUNNBELØP,
                          }
                        )}
                        name={`barn[${index}].harInntekt`}
                        id={`barn[${index}].harInntekt`}
                        error={findError(`barn[${index}].harInntekt`)}
                        value={barn.harInntekt || ''}
                        onChange={(value) => {
                          clearErrors();
                          updateSøknadData(søknadDispatch, {
                            barn: søknadState.søknad?.barn?.map((barny) => {
                              if (barn.fnr === barny.fnr) {
                                return { ...barny, harInntekt: value };
                              } else {
                                return barny;
                              }
                            }),
                          });
                        }}
                      >
                        <ReadMore
                          header={formatMessage({
                            id: 'søknad.barnetillegg.registrerteBarn.harInntekt.readMore.title',
                          })}
                        >
                          {formatMessage(
                            { id: 'søknad.barnetillegg.registrerteBarn.harInntekt.readMore.text' },
                            {
                              grunnbeløp: GRUNNBELØP,
                            }
                          )}
                        </ReadMore>
                        <Radio value={JaEllerNei.JA}>
                          <BodyShort>
                            {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.JA}` })}
                          </BodyShort>
                        </Radio>
                        <Radio value={JaEllerNei.NEI}>
                          <BodyShort>
                            {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.NEI}` })}
                          </BodyShort>
                        </Radio>
                      </RadioGroup>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <Heading size="small" level="3" spacing>
            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.title' })}
          </Heading>
          {defaultValues?.søknad?.manuelleBarn &&
            defaultValues?.søknad?.manuelleBarn.length > 0 && (
              <ul className={classes.barnList}>
                {defaultValues.søknad.manuelleBarn.map((barn, index) => {
                  return (
                    // TODO greit å bruke internId her?
                    <li key={barn?.internId}>
                      <article className={classes.barneKort}>
                        <BodyShort>
                          <Label>
                            {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.navn' })}:{' '}
                          </Label>
                          {formatNavn(barn?.navn)}
                        </BodyShort>
                        <BodyShort>
                          <Label>
                            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.fødselsdato' })}:{' '}
                          </Label>

                          {formatDate(barn?.fødseldato)}
                        </BodyShort>
                        {barn?.relasjon === Relasjon.FORELDER && (
                          <BodyShort>
                            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.erForelder' })}
                          </BodyShort>
                        )}
                        {barn?.relasjon === Relasjon.FOSTERFORELDER && (
                          <BodyShort>
                            {formatMessage({
                              id: 'søknad.barnetillegg.manuelleBarn.erFosterforelder',
                            })}
                          </BodyShort>
                        )}
                        {barn?.harInntekt === JaEllerNei.JA && (
                          <BodyShort>
                            {formatMessage(
                              { id: 'søknad.barnetillegg.manuelleBarn.inntektOver1G' },
                              {
                                grunnbeløp: GRUNNBELØP,
                              }
                            )}
                          </BodyShort>
                        )}
                        {barn?.harInntekt === JaEllerNei.NEI && (
                          <BodyShort>
                            {formatMessage(
                              { id: 'søknad.barnetillegg.manuelleBarn.inntektIkkeOver1G' },
                              {
                                grunnbeløp: GRUNNBELØP,
                              }
                            )}
                          </BodyShort>
                        )}
                        <div className={classes?.cardButtonWrapper}>
                          <Button
                            variant="tertiary"
                            type="button"
                            // onClick={() => editNyttBarn(index)}
                          >
                            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.redigerBarn' })}
                          </Button>
                          <Button
                            variant="tertiary"
                            type="button"
                            icon={<Delete title={'Slett'} />}
                            iconPosition={'left'}
                            onClick={() => {
                              // slettBarn(index);
                            }}
                          >
                            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.slettBarn' })}
                          </Button>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.description' })}
          </BodyShort>
          <Button
            variant="tertiary"
            type="button"
            icon={<Add title={'Legg til'} />}
            iconPosition={'left'}
            onClick={() => {
              setSelectedBarn(undefined);
              setShowModal(true);
            }}
          >
            {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.buttonText' })}
          </Button>
        </div>
        {(erForelderTilManueltBarn || erFosterforelderTilManueltBarn) && (
          <Alert variant="info">
            {formatMessage({ id: 'søknad.barnetillegg.alert.leggeVedTekst' })}
            <ul>
              {erForelderTilManueltBarn && (
                <li>
                  {formatMessage({ id: 'søknad.barnetillegg.alert.bulletPointVedleggForelder' })}
                </li>
              )}
              {erFosterforelderTilManueltBarn && (
                <li>
                  {formatMessage({
                    id: 'søknad.barnetillegg.alert.bulletPointVedleggFosterforelder',
                  })}
                </li>
              )}
            </ul>
            {formatMessage({ id: 'søknad.barnetillegg.alert.lasteOppVedleggTekst' })}
          </Alert>
        )}
        {harBarn() ||
          (harManuelleBarn() && (
            <Alert variant="info">
              {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.title' })}
              <ul>
                <li>
                  {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.bulletpoint1' })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.bulletpoint2' })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.bulletpoint3' })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.bulletpoint4' })}
                </li>
              </ul>
            </Alert>
          ))}
      </SoknadFormWrapperNew>
      <AddBarnModal
        onCloseClick={() => setShowModal(false)}
        onSaveClick={() => {}}
        showModal={showModal}
        barn={selectedBarn}
      />
    </>
  );
};
