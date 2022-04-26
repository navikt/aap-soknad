import { BodyShort, Button, Cell, Grid, GuidePanel, Heading, Label, Radio } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import { JaEllerNei } from '../../../types/Generic';
import Soknad from '../../../types/Soknad';
import * as classes from './Barnetillegg.module.css';
import { Add } from '@navikt/ds-icons';
import TextWithLink from '../../../components/TextWithLink';
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
import { AddBarnModal } from './AddBarnModal';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const BARNETILLEGG = 'barnetillegg';

interface GResponse {
  dato: string;
  grunnbeløp: number;
}

export const Barnetillegg = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({});
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [BARNETILLEGG]: søknad?.barnetillegg,
    },
  });
  const { vedleggDispatch } = useVedleggContext();
  const [selectedBarnIndex, setSelectedBarnIndex] = useState<number | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { fields, append, remove, update } = useFieldArray({
    name: BARNETILLEGG,
    control,
  });

  const [g, setG] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetch('https://g.nav.no/api/v1/grunnbeløp')
      .then((res) => {
        return res.json();
      })
      .then((json: GResponse) => {
        setG(json.grunnbeløp);
      });
  }, [setG]);

  const selectedBarn = useMemo(() => {
    if (selectedBarnIndex === undefined) return undefined;
    return fields[selectedBarnIndex];
  }, [selectedBarnIndex, fields]);

  const editNyttBarn = (index: number) => {
    setSelectedBarnIndex(index);
    setShowModal(true);
  };
  const saveNyttBarn = (barn) => {
    if (selectedBarn === undefined) {
      append({
        ...barn,
        manueltOpprettet: true,
      });
      addRequiredVedlegg(
        [
          {
            type: `barn${barn?.fnr}`,
            description: `Fødselsattest eller bostedsbevis for barn: ${barn?.fornavn} ${barn?.etternavn}`,
          },
        ],
        vedleggDispatch
      );
    } else {
      const gammeltBarn = fields[selectedBarnIndex];
      update(selectedBarnIndex, {
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
        <GuidePanel>
          <BodyShort>
            <TextWithLink
              text={getText('steps.barnetillegg.guide')}
              links={[getText('steps.barnetillegg.guideReadMoreLink')]}
            />
          </BodyShort>
          <BodyShort>
            <TextWithLink
              text={getText('steps.barnetillegg.grunnbeløp.title')}
              links={[getText('steps.barnetillegg.grunnbeløp.link')]}
            />
          </BodyShort>
        </GuidePanel>
        {fields.map((barn, index) => {
          return (
            <article key={barn?.fnr} className={classes.barneKort}>
              <Heading
                size={'xsmall'}
                level={'2'}
              >{`${barn?.navn?.fornavn} ${barn?.navn?.mellomnavn} ${barn?.navn?.etternavn}`}</Heading>
              <BodyShort>{`Fødselsnummer: ${barn?.fnr}`}</BodyShort>
              {barn?.manueltOpprettet && barn?.harInntekt ? (
                <Grid>
                  <Cell xs={4}>
                    <Label>{`Har inntekt over ${g}kr (1G):`}</Label>
                  </Cell>
                  <Cell xs={3}>
                    <BodyShort>{barn?.harInntekt}</BodyShort>
                  </Cell>
                </Grid>
              ) : (
                <RadioGroupWrapper
                  // TODO: Finne en bedre måte å injecte antall kroner for G i tekst
                  legend={getText('form.barnetillegg.legend').replace(
                    'ANTALL_KRONER',
                    g ? g.toString() : ''
                  )}
                  name={`${BARNETILLEGG}.${index}.harInntekt`}
                  control={control}
                  error={errors?.[BARNETILLEGG]?.[index]?.erForsørger?.message}
                >
                  <Radio value={JaEllerNei.JA}>
                    <BodyShort>{JaEllerNei.JA}</BodyShort>
                  </Radio>
                  <Radio value={JaEllerNei.NEI}>
                    <BodyShort>{JaEllerNei.NEI}</BodyShort>
                  </Radio>
                </RadioGroupWrapper>
              )}
              {barn?.manueltOpprettet && (
                <Grid>
                  <Cell xs={4}>
                    <Button variant="tertiary" type="button" onClick={() => editNyttBarn(index)}>
                      Endre
                    </Button>
                  </Cell>
                </Grid>
              )}
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
              <Add />
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
            const barn = fields[selectedBarnIndex];
            removeRequiredVedlegg(`barn${barn?.fnr}`, vedleggDispatch);
            remove(selectedBarnIndex);
          }
          setShowModal(false);
        }}
        showModal={showModal}
        barn={selectedBarn}
      />
    </>
  );
};
