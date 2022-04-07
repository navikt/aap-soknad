import {
  BodyLong,
  BodyShort,
  Button,
  GuidePanel,
  Heading,
  Link,
  ReadMore,
  TextField,
} from '@navikt/ds-react';
import React, { useState } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, useFieldArray } from 'react-hook-form';
import { FastlegeView } from '../../context/sokerOppslagContext';
import { Delete, Add } from '@navikt/ds-icons';
import SoknadStandard from '../../types/SoknadStandard';
import FieldArrayWrapper from '../../components/input/FieldArrayWrapper/FieldArrayWrapper';
import ButtonPanel from '../../components/ButtonPanel/ButtonPanel';
import TextWithLink from '../../components/TextWithLink';

interface BehandlereProps {
  getText: GetText;
  fastlege: FastlegeView | undefined;
  control: Control<SoknadStandard>;
}
const FIELD_ARRAY_NAME = 'behandlere';

export const Behandlere = ({ getText, fastlege, control }: BehandlereProps) => {
  const [showNyBehandler, setShowNyBehandler] = useState<boolean>(false);
  const [selectedBehandler, setSelectedBehandler] = useState<number | undefined>(undefined);
  const [name, setName] = useState<string>('');
  const [legekontor, setLegekontor] = useState<string>('');
  const [gateadresse, setGateadresse] = useState<string>('');
  const [postnummer, setPostnummer] = useState<string>('');
  const [poststed, setPoststed] = useState<string>('');
  const [telefon, setTelefon] = useState<string>('');
  const resetNyBehandler = () => {
    setName('');
    setLegekontor('');
    setGateadresse('');
    setPostnummer('');
    setPoststed('');
    setTelefon('');
  };
  const { fields, append, remove, update } = useFieldArray({
    name: FIELD_ARRAY_NAME,
    control,
  });
  const editNyBehandler = (index: number) => {
    setSelectedBehandler(index);
    const behandler = fields[index];
    setName(behandler?.name);
    setLegekontor(behandler?.legekontor);
    setGateadresse(behandler?.gateadresse);
    setPostnummer(behandler?.postnummer);
    setPoststed(behandler?.poststed);
    setTelefon(behandler?.telefon);
    setShowNyBehandler(true);
  };
  const saveNyBehandler = () => {
    if (!selectedBehandler) {
      append({ name, legekontor, gateadresse, postnummer, poststed, telefon });
    } else {
      update(selectedBehandler, { name, legekontor, gateadresse, postnummer, poststed, telefon });
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
    <>
      <Heading size="large" level="2">
        {getText('steps.fastlege.title')}
      </Heading>
      <GuidePanel>
        <BodyLong>{getText('steps.fastlege.guide1')}</BodyLong>
        <BodyLong>{getText('steps.fastlege.guide2')}</BodyLong>
      </GuidePanel>
      <Heading size={'small'} level={'3'}>{`Fastlege`}</Heading>
      {!fastlege ? (
        <TextWithLink text={getText('steps.fastlege.ingenFastlege.text')}>
          <Link target={'_blank'} href={getText('steps.fastlege.ingenFastlege.link.href')}>
            {getText('steps.fastlege.ingenFastlege.link.name')}
          </Link>
        </TextWithLink>
      ) : (
        <div>
          <BodyShort>{fastlege?.fulltNavn}</BodyShort>
          <BodyShort>{fastlege?.legekontor}</BodyShort>
          <BodyShort>{fastlege?.adresse}</BodyShort>
          <BodyShort>{`Telefon: ${fastlege?.telefon}`}</BodyShort>
          <ReadMore header={getText('steps.fastlege.readMore.header')} type={'button'}>
            <BodyLong>{getText('steps.fastlege.readMore.text')}</BodyLong>
          </ReadMore>
        </div>
      )}
      <Heading size={'small'} level={'3'}>
        {getText('steps.fastlege.annenBehandler.heading')}
      </Heading>
      <BodyLong>{getText('steps.fastlege.annenBehandler.info')}</BodyLong>
      {fields.length > 0 && (
        <>
          <Heading size={'small'} level={'3'}>
            {getText('steps.fastlege.andreBehandlere.heading')}
          </Heading>
          {fields.map((field, index) => (
            <ButtonPanel key={field.id} onClick={() => editNyBehandler(index)}>
              <Link>{`${field?.name}, ${field?.legekontor}`}</Link>
            </ButtonPanel>
          ))}
        </>
      )}
      {!showNyBehandler && (
        <div>
          <Button variant="tertiary" type="button" onClick={() => setShowNyBehandler(true)}>
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
            value={name}
            label={getText('form.fastlege.annenbehandler.name.label')}
            name={'name'}
            onChange={(e) => e?.target?.value && setName(e?.target?.value)}
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
          <TextField
            value={postnummer}
            label={getText('form.fastlege.annenbehandler.postnummer.label')}
            name={'postnummer'}
            onChange={(e) => e?.target?.value && setPostnummer(e?.target?.value)}
          />
          <TextField
            value={poststed}
            label={getText('form.fastlege.annenbehandler.poststed.label')}
            name={'poststed'}
            onChange={(e) => e?.target?.value && setPoststed(e?.target?.value)}
          />
          <TextField
            value={telefon}
            label={getText('form.fastlege.annenbehandler.telefon.label')}
            name={'telefon'}
            onChange={(e) => e?.target?.value && setTelefon(e?.target?.value)}
          />
          <div>
            <Button type="button" onClick={saveNyBehandler}>
              Lagre lege/behandler
            </Button>
            {selectedBehandler !== undefined && (
              <Button variant={'danger'} type="button" onClick={slettSelectedBehandler}>
                <BodyShort>Slett lege/behandler</BodyShort>
                <Delete />
              </Button>
            )}
          </div>
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
    </>
  );
};
