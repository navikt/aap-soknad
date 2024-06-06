import { BodyLong, Button, Heading, Modal } from '@navikt/ds-react';
import { useIntl } from 'react-intl';

export const SoknadUtenVedleggModal = ({
  showModal,
  onSendSoknad,
  onClose,
}: {
  showModal: boolean;
  onSendSoknad: () => void;
  onClose: () => void;
}) => {
  const { formatMessage } = useIntl();
  return (
    <Modal open={showModal} onClose={onClose} aria-label="Klarte ikke sende inn søknad med vedlegg">
      <Modal.Header>
        <Heading size={'medium'} level={'2'}>
          {formatMessage({ id: 'søknad.soknadUtenVedleggModal.heading' })}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <BodyLong spacing>
          {formatMessage({ id: 'søknad.soknadUtenVedleggModal.paragrafEn' })}
        </BodyLong>
        <BodyLong spacing>
          {formatMessage({ id: 'søknad.soknadUtenVedleggModal.paragrafTo' })}
        </BodyLong>
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
