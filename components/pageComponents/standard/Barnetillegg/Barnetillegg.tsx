import { Alert, BodyShort, Button, Cell, Grid, Heading, Radio, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from 'types/Generic';
import { Soknad, Barn, ManuelleBarn } from 'types/Soknad';
import * as classes from './Barnetillegg.module.css';
import { Add } from '@navikt/ds-icons';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { AddBarnModal, Relasjon } from './AddBarnModal';
import { formatNavn } from 'utils/StringFormatters';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import {
  slettLagretSoknadState,
  updateSøknadData,
  addRequiredVedlegg,
  removeRequiredVedlegg,
} from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { formatDate } from 'utils/date';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
export const BARN = 'barn';
export const MANUELLE_BARN = 'manuelleBarn';

export const GRUNNBELØP = '111 477';

export const getUniqueIshIdForBarn = (barn: ManuelleBarn) => {
  return `${formatDate(barn.fødseldato, 'yyyy-MM-dd') ?? ''}_${barn.navn.fornavn}_${
    barn.navn.etternavn
  }`;
};

export const Barnetillegg = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    [BARN]: yup.array().of(
      yup.object().shape({
        harInntekt: yup
          .string()
          .nullable()
          .required(
            formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.validation.required', {
              grunnbeløp: GRUNNBELØP,
            })
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
      })
    ),
  });
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    [BARN]: Array<Barn>;
    [MANUELLE_BARN]: Array<ManuelleBarn>;
  }>({
    resolver: yupResolver(schema),
    defaultValues: {
      [BARN]: defaultValues?.søknad?.barnetillegg,
      [MANUELLE_BARN]: defaultValues?.søknad?.manuelleBarn,
    },
  });
  const [selectedBarnIndex, setSelectedBarnIndex] = useState<number | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { fields } = useFieldArray({
    name: BARN,
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

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);

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
  const saveNyttBarn = (barn: ManuelleBarn) => {
    if (selectedBarn === undefined) {
      barn.internId = crypto.randomUUID();
      manuelleBarnAppend({
        ...barn,
      });
      addRequiredVedlegg(
        [
          {
            filterType: barn.relasjon,
            type: `barn-${barn.internId}`,
            description:
              barn.relasjon === Relasjon.FORELDER
                ? `Fødselsattest eller adopsjonsbevis for: ${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`
                : `Bostedbevis for: ${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
          },
        ],
        søknadDispatch
      );
    } else if (selectedBarnIndex !== undefined) {
      manuelleBarnUpdate(selectedBarnIndex, {
        ...barn,
      });
    }
    setShowModal(false);
  };

  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          onNext(data);
        })}
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
                      'søknad.barnetillegg.registrerteBarn.fødselsdato'
                    )}: ${formatDate(barn?.fødseldato)}`}</BodyShort>

                    <RadioGroupWrapper
                      legend={formatMessage(
                        'søknad.barnetillegg.registrerteBarn.harInntekt.label',
                        {
                          grunnbeløp: GRUNNBELØP,
                        }
                      )}
                      name={`${BARN}.${index}.harInntekt`}
                      control={control}
                      error={errors?.[BARN]?.[index]?.harInntekt?.message}
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
                    {/*)}*/}
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
                    <BodyShort>
                      {formatMessage('søknad.barnetillegg.manuelleBarn.fødselsdato')}:{' '}
                      {formatDate(barn?.fødseldato)}
                    </BodyShort>
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
                    {barn?.harInntekt === JaEllerNei.JA && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.inntektOver1G', {
                          grunnbeløp: GRUNNBELØP,
                        })}
                      </BodyShort>
                    )}
                    {barn?.harInntekt === JaEllerNei.NEI && (
                      <BodyShort>
                        {formatMessage('søknad.barnetillegg.manuelleBarn.inntektIkkeOver1G', {
                          grunnbeløp: GRUNNBELØP,
                        })}
                      </BodyShort>
                    )}
                    <Grid>
                      <Cell xs={4} md={12}>
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
          <Cell xs={12} md={6}>
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
          if (selectedBarnIndex != undefined) {
            const barn = manuelleBarnFields[selectedBarnIndex];
            removeRequiredVedlegg(`barn-${barn.id}`, søknadDispatch);
            manuelleBarnRemove(selectedBarnIndex);

            setShowModal(false);
          }
        }}
        showModal={showModal}
        barn={selectedBarn}
      />
    </>
  );
};
