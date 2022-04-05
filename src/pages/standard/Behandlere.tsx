import {
  BodyLong,
  BodyShort,
  Button,
  GuidePanel,
  Heading,
  ReadMore,
  Table,
  TextField,
} from '@navikt/ds-react';
import React, { useState } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, useFieldArray } from 'react-hook-form';
import { FastlegeView } from '../../context/sokerOppslagContext';
import { Delete, AddCircle } from '@navikt/ds-icons';
import SoknadStandard from '../../types/SoknadStandard';
import FieldArrayWrapper from '../../components/input/FieldArrayWrapper/FieldArrayWrapper';

interface BehandlereProps {
  getText: GetText;
  fastlege: FastlegeView | undefined;
  control: Control<SoknadStandard>;
}
const FIELD_ARRAY_NAME = 'behandlere';

export const Behandlere = ({ getText, fastlege, control }: BehandlereProps) => {
  const [showNyBehandler, setShowNyBehandler] = useState<boolean>(false);
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
  const { fields, append, remove } = useFieldArray({
    name: FIELD_ARRAY_NAME,
    control,
  });
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.fastlege.title')}
      </Heading>
      <GuidePanel>
        <BodyLong>{getText('steps.fastlege.guide1')}</BodyLong>
        <BodyLong>{getText('steps.fastlege.guide2')}</BodyLong>
      </GuidePanel>
      <article>
        <Heading size={'small'} level={'3'}>{`Fastlege`}</Heading>
        <BodyShort>{fastlege?.fulltNavn}</BodyShort>
        <BodyShort>{fastlege?.legekontor}</BodyShort>
        <BodyShort>{fastlege?.adresse}</BodyShort>
        <BodyShort>{`Telefon: ${fastlege?.telefon}`}</BodyShort>
        <ReadMore header={getText('steps.fastlege.readMore.header')} type={'button'}>
          <BodyLong>{getText('steps.fastlege.readMore.text')}</BodyLong>
        </ReadMore>
      </article>
      <BodyLong>{getText('steps.fastlege.annenBehandler')}</BodyLong>
      {fields.length > 0 && (
        <Table size="medium">
          <Table.Body>
            {fields.map((field, index) => (
              <Table.Row key={field.id}>
                <Table.DataCell>{`${field?.name}, ${field?.legekontor}`}</Table.DataCell>
                <Table.DataCell>{<Delete onClick={() => remove(index)} />}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <Button variant="tertiary" type="button" onClick={() => setShowNyBehandler(true)}>
        <AddCircle />
        Legg til lege/behandler
      </Button>
      {showNyBehandler && (
        <FieldArrayWrapper>
          <TextField
            label={getText('form.fastlege.annenbehandler.name.label')}
            name={'name'}
            onChange={(e) => e?.target?.value && setName(e?.target?.value)}
          />
          <TextField
            label={getText('form.fastlege.annenbehandler.legekontor.label')}
            name={'legekontor'}
            onChange={(e) => e?.target?.value && setLegekontor(e?.target?.value)}
          />
          <TextField
            label={getText('form.fastlege.annenbehandler.gateadresse.label')}
            name={'gateadresse'}
            onChange={(e) => e?.target?.value && setGateadresse(e?.target?.value)}
          />
          <TextField
            label={getText('form.fastlege.annenbehandler.postnummer.label')}
            name={'postnummer'}
            onChange={(e) => e?.target?.value && setPostnummer(e?.target?.value)}
          />
          <TextField
            label={getText('form.fastlege.annenbehandler.poststed.label')}
            name={'poststed'}
            onChange={(e) => e?.target?.value && setPoststed(e?.target?.value)}
          />
          <TextField
            label={getText('form.fastlege.annenbehandler.telefon.label')}
            name={'telefon'}
            onChange={(e) => e?.target?.value && setTelefon(e?.target?.value)}
          />
          <Button
            type="button"
            onClick={() => {
              append({ name, legekontor, gateadresse, postnummer, poststed, telefon });
              resetNyBehandler();
              setShowNyBehandler(false);
            }}
          >
            Lagre
          </Button>
          <Button
            type="button"
            variant={'secondary'}
            onClick={() => {
              setShowNyBehandler(false);
            }}
          >
            Avbryt
          </Button>
        </FieldArrayWrapper>
      )}
    </>
  );
};
