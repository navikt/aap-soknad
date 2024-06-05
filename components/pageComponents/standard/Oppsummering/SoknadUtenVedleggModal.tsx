import { BodyLong, Button, Heading, Modal } from '@navikt/ds-react';

export const SoknadUtenVedleggModal = ({
  showModal,
  onSendSoknad,
  onClose,
}: {
  showModal: boolean;
  onSendSoknad: () => void;
  onClose: () => void;
}) => {
  return (
    <Modal open={showModal} onClose={onClose} aria-label="Klarte ikke sende inn søknad med vedlegg">
      <Modal.Header>
        <Heading size={'medium'} level={'2'}>
          Klarte ikke sende inn søknad med vedlegg
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <BodyLong spacing>
          Vi klarte ikke sende inn søknaden din med vedlegg. Du kan prøve å sende inn søknaden uten
          vedlegg, eller prøve igjen senere.
        </BodyLong>
        <BodyLong spacing>Du kan alltid ettersende vedlegg til søknaden din senere.</BodyLong>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onSendSoknad}>
          Slett vedlegg og prøv på nytt
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
