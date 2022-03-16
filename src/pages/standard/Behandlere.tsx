import { BodyLong, BodyShort, Button, Heading, Modal, Table, TextField } from '@navikt/ds-react';
import React, { useState } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, useFieldArray } from 'react-hook-form';
import { FastlegeView } from '../../context/sokerOppslagContext';
import { Delete, Add } from '@navikt/ds-icons';
import SoknadStandard from '../../types/SoknadStandard';

interface BehandlereProps {
  getText: GetText;
  fastlege: FastlegeView | undefined;
  control: Control<SoknadStandard>;
}
const FIELD_ARRAY_NAME = 'behandlere';

export const Behandlere = ({ getText, fastlege, control }: BehandlereProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [legekontor, setLegekontor] = useState<string>('');
  const [gateadresse, setGateadresse] = useState<string>('');
  const [postnummer, setPostnummer] = useState<string>('');
  const [poststed, setPoststed] = useState<string>('');
  const [telefon, setTelefon] = useState<string>('');
  const { fields, append, remove } = useFieldArray({
    name: FIELD_ARRAY_NAME,
    control,
  });
  return (
    <>
      <article>
        <Heading size={'small'} level={'2'}>{`Fastlege`}</Heading>
        <BodyShort>{fastlege?.fulltNavn}</BodyShort>
        <BodyShort>{fastlege?.legekontor}</BodyShort>
        <BodyShort>{fastlege?.adresse}</BodyShort>
        <BodyShort>{`Telefon: ${fastlege?.telefon}`}</BodyShort>
      </article>
      <article>
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
        <Button variant="secondary" type="button" onClick={() => setShowModal(true)}>
          <Add />
          Legg til lege/behandler
        </Button>
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <Modal.Content>
            <Heading size={'small'} level={'2'}>{`Legg til lege eller behandler`}</Heading>
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
                setShowModal(false);
              }}
            >
              Lagre
            </Button>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                setShowModal(false);
              }}
            >
              Avbryt
            </Button>
          </Modal.Content>
        </Modal>
      </article>
    </>
  );
};
