import {
  BodyLong,
  BodyShort,
  Button,
  Cell,
  Grid,
  GuidePanel,
  Heading,
  Link,
  ReadMore,
  TextField,
} from '@navikt/ds-react';
import React, { useState } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { FastlegeView } from '../../../context/sokerOppslagContext';
import { Delete, Add } from '@navikt/ds-icons';
import Soknad from '../../../types/Soknad';
import FieldArrayWrapper from '../../../components/input/FieldArrayWrapper/FieldArrayWrapper';
import ButtonPanel from '../../../components/ButtonPanel/ButtonPanel';
import TextWithLink from '../../../components/TextWithLink';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
  fastlege?: FastlegeView;
}
const BEHANDLERE = 'behandlere';

export const Behandlere = ({ getText, onBackClick, onCancelClick, søknad, fastlege }: Props) => {
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
      [BEHANDLERE]: søknad?.behandlere,
    },
  });
  const [showNyBehandler, setShowNyBehandler] = useState<boolean>(false);
  const [selectedBehandler, setSelectedBehandler] = useState<number | undefined>(undefined);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [legekontor, setLegekontor] = useState<string>('');
  const [gateadresse, setGateadresse] = useState<string>('');
  const [postnummer, setPostnummer] = useState<string>('');
  const [poststed, setPoststed] = useState<string>('');
  const [telefon, setTelefon] = useState<string>('');
  const resetNyBehandler = () => {
    setFirstname('');
    setLastname('');
    setLegekontor('');
    setGateadresse('');
    setPostnummer('');
    setPoststed('');
    setTelefon('');
  };
  const { fields, append, remove, update } = useFieldArray({
    name: BEHANDLERE,
    control,
  });
  const editNyBehandler = (index: number) => {
    setSelectedBehandler(index);
    const behandler = fields[index];
    setFirstname(behandler?.firstname);
    setLastname(behandler?.lastname);
    setLegekontor(behandler?.legekontor);
    setGateadresse(behandler?.gateadresse);
    setPostnummer(behandler?.postnummer);
    setPoststed(behandler?.poststed);
    setTelefon(behandler?.telefon);
    setShowNyBehandler(true);
  };
  const saveNyBehandler = () => {
    if (selectedBehandler === undefined) {
      append({ firstname, lastname, legekontor, gateadresse, postnummer, poststed, telefon });
    } else {
      update(selectedBehandler, {
        firstname,
        lastname,
        legekontor,
        gateadresse,
        postnummer,
        poststed,
        telefon,
      });
    }
    resetNyBehandler();
    setShowNyBehandler(false);
  };
  const slettSelectedBehandler = () => {
    remove(selectedBehandler);
    resetNyBehandler();
    setShowNyBehandler(false);
  };
  return (
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
        {getText('steps.fastlege.title')}
      </Heading>
      <GuidePanel>
        <BodyLong>{getText('steps.fastlege.guide1')}</BodyLong>
        <BodyLong>{getText('steps.fastlege.guide2')}</BodyLong>
      </GuidePanel>
      <Heading size={'small'} level={'3'}>
        {getText('steps.fastlege.fastlege.heading')}
      </Heading>
      {!fastlege ? (
        <BodyLong>{getText('steps.fastlege.ingenFastlege.text')}</BodyLong>
      ) : (
        <div>
          <BodyShort>{fastlege?.fulltNavn}</BodyShort>
          <BodyShort>{fastlege?.legekontor}</BodyShort>
          <BodyShort>{fastlege?.adresse}</BodyShort>
          <BodyShort>{`Telefon: ${fastlege?.telefon}`}</BodyShort>
          <ReadMore header={getText('steps.fastlege.readMore.header')} type={'button'}>
            {getText('steps.fastlege.readMore.text')}
          </ReadMore>
        </div>
      )}
      <Heading size={'small'} level={'3'}>
        {getText('steps.fastlege.annenBehandler.heading')}
      </Heading>
      <BodyLong>{getText('steps.fastlege.annenBehandler.info')}</BodyLong>
      {!showNyBehandler && fields.length > 0 && (
        <>
          <Heading size={'xsmall'} level={'4'}>
            {getText('steps.fastlege.andreBehandlere.heading')}
          </Heading>
          {fields.map((field, index) => (
            <ButtonPanel key={field.id} onClick={() => editNyBehandler(index)}>
              <Link>{`${field?.firstname} ${field?.lastname}, ${field?.legekontor}`}</Link>
            </ButtonPanel>
          ))}
        </>
      )}
      {!showNyBehandler && (
        <div>
          <Button
            variant="tertiary"
            type="button"
            onClick={() => {
              setSelectedBehandler(undefined);
              setShowNyBehandler(true);
            }}
          >
            <Add />
            {getText('steps.fastlege.buttonAddNyBehandler')}
          </Button>
        </div>
      )}
      {showNyBehandler && (
        <FieldArrayWrapper>
          <Heading size={'small'} level={'3'}>
            {'Legg til annen lege eller behandler'}
          </Heading>
          <TextField
            value={firstname}
            label={getText('form.fastlege.annenbehandler.firstname.label')}
            name={'firstname'}
            onChange={(e) => e?.target?.value && setFirstname(e?.target?.value)}
          />
          <TextField
            value={lastname}
            label={getText('form.fastlege.annenbehandler.lastname.label')}
            name={'lastname'}
            onChange={(e) => e?.target?.value && setLastname(e?.target?.value)}
          />
          <TextField
            value={legekontor}
            label={getText('form.fastlege.annenbehandler.legekontor.label')}
            name={'legekontor'}
            onChange={(e) => e?.target?.value && setLegekontor(e?.target?.value)}
          />
          <TextField
            value={gateadresse}
            label={getText('form.fastlege.annenbehandler.gateadresse.label')}
            name={'gateadresse'}
            onChange={(e) => e?.target?.value && setGateadresse(e?.target?.value)}
          />
          <Grid>
            <Cell xs={6}>
              <TextField
                value={postnummer}
                label={getText('form.fastlege.annenbehandler.postnummer.label')}
                name={'postnummer'}
                onChange={(e) => e?.target?.value && setPostnummer(e?.target?.value)}
              />
            </Cell>
            <Cell xs={6}>
              <TextField
                value={poststed}
                label={getText('form.fastlege.annenbehandler.poststed.label')}
                name={'poststed'}
                onChange={(e) => e?.target?.value && setPoststed(e?.target?.value)}
              />
            </Cell>
          </Grid>
          <TextField
            value={telefon}
            label={getText('form.fastlege.annenbehandler.telefon.label')}
            name={'telefon'}
            onChange={(e) => e?.target?.value && setTelefon(e?.target?.value)}
          />
          <Grid>
            <Cell xs={6}>
              <Button type="button" onClick={saveNyBehandler}>
                Lagre lege/behandler
              </Button>
            </Cell>
            <Cell xs={6}>
              {selectedBehandler !== undefined && (
                <Button variant={'danger'} type="button" onClick={slettSelectedBehandler}>
                  <BodyShort>Slett lege/behandler</BodyShort>
                  <Delete />
                </Button>
              )}
            </Cell>
          </Grid>
          <div>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                resetNyBehandler();
                setShowNyBehandler(false);
              }}
            >
              Avbryt
            </Button>
          </div>
        </FieldArrayWrapper>
      )}
    </SoknadFormWrapper>
  );
};
