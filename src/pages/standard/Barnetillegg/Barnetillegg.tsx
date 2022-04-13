import {
  Alert,
  BodyShort,
  Button,
  Cell,
  Grid,
  GuidePanel,
  Heading,
  Ingress,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { Control, FieldErrors, useFieldArray } from 'react-hook-form';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import { JaEllerNei } from '../../../types/Generic';
import SoknadStandard from '../../../types/SoknadStandard';
import * as classes from './Barnetillegg.module.css';
import { Add } from '@navikt/ds-icons';
import TextWithLink from '../../../components/TextWithLink';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  useVedleggContext,
} from '../../../context/vedleggContext';

interface BarnetilleggProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
}
const BARNETILLEGG = 'barnetillegg';

export const Barnetillegg = ({ getText, errors, control }: BarnetilleggProps) => {
  const { vedleggDispatch } = useVedleggContext();
  const [selectedBarn, setSelectedBarn] = useState<number | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [fornavn, setFornavn] = useState<string>('');
  const [mellomnavn] = useState<string>('');
  const [etternavn, setEtternavn] = useState<string>('');
  const [fnr, setFnr] = useState<string>('');
  const [harInntekt, setHarInntekt] = useState<string>('');
  const { fields, append, remove, update } = useFieldArray({
    name: BARNETILLEGG,
    control,
  });
  const clearModal = () => {
    setFornavn('');
    setEtternavn('');
    setFnr('');
    setHarInntekt('');
  };
  const editNyttBarn = (index: number) => {
    setSelectedBarn(index);
    const barn = fields[index];
    setFornavn(barn?.navn?.fornavn);
    setEtternavn(barn?.navn?.etternavn);
    setFnr(barn?.fnr);
    setHarInntekt(barn?.harInntekt?.value);
    setShowModal(true);
  };
  const saveNyttBarn = () => {
    if (selectedBarn === undefined) {
      append({
        navn: { fornavn, mellomnavn, etternavn },
        fnr,
        harInntekt: { value: harInntekt },
        manueltOpprettet: true,
      });
      addRequiredVedlegg(
        [
          {
            type: `barn${fnr}`,
            description: `Fødselsattest eller bostedsbevis for barn: ${fornavn} ${etternavn}`,
          },
        ],
        vedleggDispatch
      );
    } else {
      const barn = fields[selectedBarn];
      update(selectedBarn, {
        navn: { fornavn, mellomnavn, etternavn },
        fnr,
        harInntekt: { value: harInntekt },
        manueltOpprettet: barn?.manueltOpprettet,
      });
    }
    clearModal();
    setShowModal(false);
  };
  useEffect(() => {
    fields.forEach((field, index) => {
      if (!field?.harInntekt?.label)
        update(index, {
          ...field,
          harInntekt: { ...field?.harInntekt, label: getText('form.barnetillegg.legend') },
        });
    });
  }, [fields]);
  return (
    <>
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
                  <Label>{'Har inntekt over 1G:'}</Label>
                </Cell>
                <Cell xs={3}>
                  <BodyShort>{barn?.harInntekt?.value}</BodyShort>
                </Cell>
              </Grid>
            ) : (
              <RadioGroupWrapper
                legend={getText('form.barnetillegg.legend')}
                name={`${BARNETILLEGG}.${index}.harInntekt.value`}
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
              setSelectedBarn(undefined);
              setShowModal(true);
            }}
          >
            <Add />
            Legg til barn
          </Button>
        </Cell>
      </Grid>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content className={classes?.leggTilBarnModalContent}>
          <Heading size={'medium'} level={'2'}>
            {getText('form.barnetillegg.add.title')}
          </Heading>
          <Ingress>{getText('steps.barnetillegg.leggTil.description')}</Ingress>
          <TextField
            value={fornavn}
            label={getText('form.barnetillegg.add.fornavn.label')}
            name={'fornavn'}
            onChange={(e) => e?.target?.value && setFornavn(e?.target?.value)}
          />
          <TextField
            value={etternavn}
            label={getText('form.barnetillegg.add.etternavn.label')}
            name={'etternavn'}
            onChange={(e) => e?.target?.value && setEtternavn(e?.target?.value)}
          />
          <TextField
            value={fnr}
            label={getText('form.barnetillegg.add.fnr.label')}
            name={'fnr'}
            onChange={(e) => e?.target?.value && setFnr(e?.target?.value)}
          />
          <RadioGroup
            value={harInntekt}
            legend={getText('form.barnetillegg.legend')}
            name={'harInntekt'}
            onChange={(e) => e && setHarInntekt(e)}
          >
            <Radio value={JaEllerNei.JA}>
              <BodyShort>{JaEllerNei.JA}</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>{JaEllerNei.NEI}</BodyShort>
            </Radio>
          </RadioGroup>
          <Alert variant={'info'}>
            {getText('form.barnetillegg.add.alertTitle')}
            <ul>
              <li>{getText('form.barnetillegg.add.alertBullet')}</li>
            </ul>
            {getText('form.barnetillegg.add.alertInfo')}
          </Alert>
          <Grid>
            <Cell xs={3}>
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Avbryt
              </Button>
            </Cell>
            <Cell xs={3}>
              <Button type="button" onClick={() => saveNyttBarn()}>
                Lagre
              </Button>
            </Cell>
            {selectedBarn !== undefined && (
              <Cell xs={3}>
                <Button
                  type="button"
                  variant={'danger'}
                  onClick={() => {
                    const barn = fields[selectedBarn];
                    removeRequiredVedlegg(`barn${barn?.fnr}`, vedleggDispatch);
                    remove(selectedBarn);
                    clearModal();
                    setShowModal(false);
                  }}
                >
                  Slett
                </Button>
              </Cell>
            )}
          </Grid>
        </Modal.Content>
      </Modal>
    </>
  );
};
