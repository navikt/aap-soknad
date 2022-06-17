import {
  Alert,
  BodyShort,
  Button,
  Cell,
  Grid,
  Heading,
  Label,
  Radio,
  ReadMore,
} from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from '../../../types/Generic';
import Soknad from '../../../types/Soknad';
import * as classes from './Barnetillegg.module.css';
import { Add } from '@navikt/ds-icons';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  useVedleggContext,
} from '../../../context/vedleggContext';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { AddBarnModal, Relasjon, validateHarInntekt } from './AddBarnModal';
import { formatNavn } from '../../../utils/StringFormatters';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

interface Props {
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const BARNETILLEGG = 'barnetillegg';
const MANUELLE_BARN = 'manuelleBarn';

export const GRUNNBELØP = '111 477';

export const Barnetillegg = ({ onBackClick, søknad }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    [BARNETILLEGG]: yup.array().of(
      yup.object().shape({
        barnepensjon: yup
          .string()
          .required(
            formatMessage('søknad.barnetillegg.leggTilBarn.modal.barnepensjon.validation.required')
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
        harInntekt: yup.string().when('barnepensjon', {
          is: validateHarInntekt,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage(
                  'søknad.barnetillegg.leggTilBarn.modal.harInntekt.validation.required'
                )
              )
              .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
              .nullable(),
        }),
      })
    ),
  });
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [BARNETILLEGG]: søknad?.barnetillegg,
      [MANUELLE_BARN]: søknad?.manuelleBarn,
    },
  });
  const { vedleggDispatch } = useVedleggContext();
  const [selectedBarnIndex, setSelectedBarnIndex] = useState<number | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { fields, update } = useFieldArray({
    name: BARNETILLEGG,
    control,
  });

  const {
    fields: manuelleBarnFields,
    append: manuelleBarnAppend,
    remove: manuelleBarnRemove,
    update: manuelleBarnUpdate,
  } = useFieldArray({
    name: MANUELLE_BARN,
    control,
  });

  const watchFieldArray = watch(BARNETILLEGG);
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    };
  });

  useEffect(() => {
    controlledFields?.forEach((barn, index) => {
      if (barn.barnepensjon === JaEllerNei.JA && barn.harInntekt) {
        update(index, { ...barn, harInntekt: undefined });
      }
    });
  }, [controlledFields]);

  useEffect(() => {
    if (showModal === false) {
      setSelectedBarnIndex(undefined);
    }
  }, [showModal]);

  const selectedBarn = useMemo(() => {
    if (selectedBarnIndex === undefined) return undefined;
    return manuelleBarnFields[selectedBarnIndex];
  }, [selectedBarnIndex, manuelleBarnFields]);

  const erForelderTilManueltBarn = useMemo(() => {
    return manuelleBarnFields.filter((barn) => barn.relasjon === Relasjon.FORELDER).length > 0;
  }, [manuelleBarnFields]);

  const erFosterforelderTilManueltBarn = useMemo(() => {
    return (
      manuelleBarnFields.filter((barn) => barn.relasjon === Relasjon.FOSTERFORELDER).length > 0
    );
  }, [manuelleBarnFields]);

  const editNyttBarn = (index: number) => {
    setSelectedBarnIndex(index);
    setShowModal(true);
  };
  const saveNyttBarn = (barn) => {
    if (selectedBarn === undefined) {
      manuelleBarnAppend({
        ...barn,
        manueltOpprettet: true,
      });
      addRequiredVedlegg(
        [
          {
            type: `barn-${barn?.fnr}`,
            description: `Fødselsattest eller bostedsbevis for: ${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
          },
        ],
        vedleggDispatch
      );
    } else {
      const gammeltBarn = manuelleBarnFields[selectedBarnIndex];
      manuelleBarnUpdate(selectedBarnIndex, {
        ...barn,
        manueltOpprettet: gammeltBarn?.manueltOpprettet,
      });
    }
    setShowModal(false);
  };
  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        nextButtonText={formatMessage('navigation.next')}
        backButtonText={formatMessage('navigation.back')}
        cancelButtonText={formatMessage('navigation.cancel')}
        errors={errors}
      >
        <Heading size="large" level="2">
          {formatMessage('søknad.barnetillegg.title')}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>{formatMessage('søknad.barnetillegg.guide.text1')}</BodyShort>
          <BodyShort>{formatMessage('søknad.barnetillegg.guide.text2')}</BodyShort>
        </LucaGuidePanel>
        {fields.length > 0 && (
          <Heading size="xsmall" level="2">
            {formatMessage('søknad.barnetillegg.registrerteBarn.title')}
          </Heading>
        )}
        {fields.length > 0 && (
          <ul className={classes.barnList}>
            {fields.map((barn, index) => {
              return (
                <li key={barn?.id}>
                  <article className={classes.barneKort}>
                    <Heading size="xsmall" level="3">{`${formatNavn(barn?.navn)}`}</Heading>
                    <BodyShort>{`${formatMessage(
                      'søknad.barnetillegg.registrerteBarn.fødselsnummer'
                    )}: ${barn?.fnr}`}</BodyShort>

                    <RadioGroupWrapper
                      legend={formatMessage(
                        'søknad.barnetillegg.registrerteBarn.barnepensjon.label'
                      )}
                      name={`${BARNETILLEGG}.${index}.barnepensjon`}
                      control={control}
                      error={errors?.[BARNETILLEGG]?.[index]?.barnepensjon?.message}
                    >
                      <ReadMore
                        header={formatMessage(
                          'søknad.barnetillegg.registrerteBarn.barnepensjon.readMore.title'
                        )}
                      >
                        {formatMessage(
                          'søknad.barnetillegg.registrerteBarn.barnepensjon.readMore.text'
                        )}
                      </ReadMore>
                      <Radio value={JaEllerNei.JA}>
                        <BodyShort>
                          {formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.JA}`)}
                        </BodyShort>
                      </Radio>
                      <Radio value={JaEllerNei.NEI}>
                        <BodyShort>
                          {formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.NEI}`)}
                        </BodyShort>
                      </Radio>
                    </RadioGroupWrapper>
                    {controlledFields[index]?.barnepensjon === JaEllerNei.NEI && (
                      <RadioGroupWrapper
                        legend={formatMessage(
                          'søknad.barnetillegg.registrerteBarn.harInntekt.label'
                        )}
                        name={`${BARNETILLEGG}.${index}.harInntekt`}
                        control={control}
                        error={errors?.[BARNETILLEGG]?.[index]?.harInntekt?.message}
                      >
                        <ReadMore
                          header={formatMessage(
                            'søknad.barnetillegg.registrerteBarn.harInntekt.readMore.title'
                          )}
                        >
                          {formatMessage(
                            'søknad.barnetillegg.registrerteBarn.harInntekt.readMore.text',
                            {
                              grunnbeløp: GRUNNBELØP,
                            }
                          )}
                        </ReadMore>
                        <Radio value={JaEllerNei.JA}>
                          <BodyShort>
                            {formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.JA}`)}
                          </BodyShort>
                        </Radio>
                        <Radio value={JaEllerNei.NEI}>
                          <BodyShort>
                            {formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.NEI}`)}
                          </BodyShort>
                        </Radio>
                      </RadioGroupWrapper>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
        {manuelleBarnFields.length > 0 && (
          <Heading size="xsmall" level="2">
            {formatMessage('søknad.barnetillegg.manuelleBarn.title')}
          </Heading>
        )}
        {manuelleBarnFields.length > 0 && (
          <ul className={classes.barnList}>
            {manuelleBarnFields.map((barn, index) => {
              return (
                <li key={barn?.id}>
                  <article className={classes.barneKort}>
                    <Heading size="xsmall" level="3">{`${formatNavn(barn?.navn)}`}</Heading>
                    <BodyShort>{`${formatMessage(
                      'søknad.barnetillegg.manuelleBarn.fødselsnummer'
                    )}: ${barn?.fnr}`}</BodyShort>
                    {barn?.relasjon === Relasjon.FORELDER && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.erForelder')}
                      </BodyShort>
                    )}
                    {barn?.relasjon === Relasjon.FOSTERFORELDER && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.erFosterforelder')}
                      </BodyShort>
                    )}
                    {barn?.barnepensjon === JaEllerNei.JA && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.mottarBarnepensjon')}
                      </BodyShort>
                    )}
                    {barn?.barnepensjon === JaEllerNei.NEI && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.mottarIkkeBarnepensjon')}
                      </BodyShort>
                    )}
                    {barn?.harInntekt === JaEllerNei.JA && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.inntektOver1G')}
                      </BodyShort>
                    )}
                    {barn?.harInntekt === JaEllerNei.NEI && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.inntektIkkeOver1G')}
                      </BodyShort>
                    )}
                    <Grid>
                      <Cell xs={4}>
                        <Button
                          variant="tertiary"
                          type="button"
                          onClick={() => editNyttBarn(index)}
                        >
                          {formatMessage('søknad.barnetillegg.manuelleBarn.redigerBarn')}
                        </Button>
                      </Cell>
                    </Grid>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
        <BodyShort>{formatMessage('søknad.barnetillegg.leggTilBarn.description')}</BodyShort>
        <Grid>
          <Cell xs={12} md="6">
            <Button
              variant="tertiary"
              type="button"
              onClick={() => {
                setSelectedBarnIndex(undefined);
                setShowModal(true);
              }}
            >
              <Add title={'Legg til'} />
              {formatMessage('søknad.barnetillegg.leggTilBarn.buttonText')}
            </Button>
          </Cell>
        </Grid>
        {(erForelderTilManueltBarn || erFosterforelderTilManueltBarn) && (
          <Alert variant={'info'}>
            {formatMessage('søknad.barnetillegg.alert.leggeVedTekst')}
            <ul>
              {erForelderTilManueltBarn && (
                <li>{formatMessage('søknad.barnetillegg.alert.bulletPointVedleggForelder')}</li>
              )}
              {erFosterforelderTilManueltBarn && (
                <li>
                  {formatMessage('søknad.barnetillegg.alert.bulletPointVedleggFosterforelder')}
                </li>
              )}
            </ul>
            {formatMessage('søknad.barnetillegg.alert.lasteOppVedleggTekst')}
          </Alert>
        )}
      </SoknadFormWrapper>
      <AddBarnModal
        onCloseClick={() => setShowModal(false)}
        onSaveClick={saveNyttBarn}
        onDeleteClick={() => {
          const barn = manuelleBarnFields[selectedBarnIndex];
          removeRequiredVedlegg(`barn-${barn?.fnr}`, vedleggDispatch);
          manuelleBarnRemove(selectedBarnIndex);

          setShowModal(false);
        }}
        showModal={showModal}
        barn={selectedBarn}
      />
    </>
  );
};
