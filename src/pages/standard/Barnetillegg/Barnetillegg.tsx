import { BodyShort, Button, Cell, Grid, Heading, Label, Radio, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { GetText } from '../../../hooks/useTexts';
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
import { AddBarnModal, Relasjon } from './AddBarnModal';
import { formatNavn } from '../../../utils/StringFormatters';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const BARNETILLEGG = 'barnetillegg';
const MANUELLE_BARN = 'manuelleBarn';

export const Barnetillegg = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({});
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
  const { fields, append, remove, update } = useFieldArray({
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
        onCancel={() => onCancelClick()}
        nextButtonText={'Neste steg'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <Heading size="large" level="2">
          {getText('steps.barnetillegg.title')}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>{getText('steps.barnetillegg.guide')}</BodyShort>
          <BodyShort>{getText('steps.barnetillegg.guide2')}</BodyShort>
        </LucaGuidePanel>
        {fields.length > 0 && (
          <Heading size="xsmall" level="2">
            Barn vi har funnet som er registrert på deg:
          </Heading>
        )}
        {fields.map((barn, index) => {
          return (
            <article key={barn?.fnr} className={classes.barneKort}>
              <Label>{`${formatNavn(barn?.navn)}`}</Label>
              <BodyShort>{`Fødselsnummer / D-nummer: ${barn?.fnr}`}</BodyShort>

              <RadioGroupWrapper
                legend={'Mottar barnet barnepensjon?'}
                name={`${BARNETILLEGG}.${index}.barnepensjon`}
                control={control}
                error={errors?.[BARNETILLEGG]?.[index]?.barnepensjon?.message}
              >
                <ReadMore header="Hvorfor spør vi om dette?">
                  Hvis barnet mottar barnepensjon, får du ikke barnetillegg for barnet.
                </ReadMore>
                <Radio value={JaEllerNei.JA}>
                  <BodyShort>{JaEllerNei.JA}</BodyShort>
                </Radio>
                <Radio value={JaEllerNei.NEI}>
                  <BodyShort>{JaEllerNei.NEI}</BodyShort>
                </Radio>
              </RadioGroupWrapper>
              {controlledFields[index]?.barnepensjon === JaEllerNei.NEI && (
                <RadioGroupWrapper
                  legend={getText('form.barnetillegg.legend')}
                  name={`${BARNETILLEGG}.${index}.harInntekt`}
                  control={control}
                  error={errors?.[BARNETILLEGG]?.[index]?.harInntekt?.message}
                >
                  <ReadMore header="Hvorfor spør vi om dette?">
                    Hvis barnet har en årlig inntekt over 1G (1G = 111 477kr), får du vanligvis ikke
                    barnetillegg for barnet.
                  </ReadMore>
                  <Radio value={JaEllerNei.JA}>
                    <BodyShort>{JaEllerNei.JA}</BodyShort>
                  </Radio>
                  <Radio value={JaEllerNei.NEI}>
                    <BodyShort>{JaEllerNei.NEI}</BodyShort>
                  </Radio>
                </RadioGroupWrapper>
              )}
            </article>
          );
        })}
        {manuelleBarnFields.length > 0 && (
          <Heading size="xsmall" level="2">
            Barn som du har lagt til:
          </Heading>
        )}
        {manuelleBarnFields.map((barn, index) => {
          return (
            <article key={barn?.fnr} className={classes.barneKort}>
              <Label>{`${formatNavn(barn?.navn)}`}</Label>
              <BodyShort>{`Fødselsnummer / D-nummer: ${barn?.fnr}`}</BodyShort>
              {barn?.relasjon === Relasjon.FORELDER && (
                <BodyShort>Du er forelder til barnet</BodyShort>
              )}
              {barn?.relasjon === Relasjon.FOSTERFORELDER && (
                <BodyShort>Du er fosterforelder til barnet</BodyShort>
              )}
              {barn?.barnepensjon === JaEllerNei.JA && (
                <BodyShort>Barnet mottar barnepensjon</BodyShort>
              )}
              {barn?.barnepensjon === JaEllerNei.NEI && (
                <BodyShort>Barnet mottar ikke barnepensjon</BodyShort>
              )}
              {barn?.harInntekt === JaEllerNei.JA && (
                <BodyShort>Barnet har årlig inntekt over 1G</BodyShort>
              )}
              {barn?.harInntekt === JaEllerNei.NEI && (
                <BodyShort>Barnet har ikke årlig inntekt over 1G</BodyShort>
              )}
              <Grid>
                <Cell xs={4}>
                  <Button variant="tertiary" type="button" onClick={() => editNyttBarn(index)}>
                    Endre informasjon om barnet
                  </Button>
                </Cell>
              </Grid>
            </article>
          );
        })}
        <BodyShort>{getText('steps.barnetillegg.leggTil.description')}</BodyShort>
        <Grid>
          <Cell xs={6}>
            <Button
              variant="tertiary"
              type="button"
              onClick={() => {
                setSelectedBarnIndex(undefined);
                setShowModal(true);
              }}
            >
              <Add title={'Legg til'} />
              Legg til barn
            </Button>
          </Cell>
        </Grid>
      </SoknadFormWrapper>
      <AddBarnModal
        getText={getText}
        onCloseClick={() => setShowModal(false)}
        onSaveClick={saveNyttBarn}
        onDeleteClick={() => {
          if (selectedBarnIndex) {
            const barn = manuelleBarnFields[selectedBarnIndex];
            removeRequiredVedlegg(`barn-${barn?.fnr}`, vedleggDispatch);
            manuelleBarnRemove(selectedBarnIndex);
          }
          setShowModal(false);
        }}
        showModal={showModal}
        barn={selectedBarn}
      />
    </>
  );
};
