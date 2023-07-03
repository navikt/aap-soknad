import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Alert, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import * as classes from './SoknadFormWrapper.module.css';
import { SuccessStroke } from '@navikt/ds-icons';
import { clientSideIsProd } from '../../utils/environments';
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  slettSøknadSuccess: boolean;
  isDeletingSøknad: boolean;
  slettSøknadOgAvbryt: () => void;
}
const SlettModal = ({
  isOpen,
  onClose,
  slettSøknadSuccess,
  isDeletingSøknad,
  slettSøknadOgAvbryt,
}: Props) => {
  const { formatMessage } = useIntl();
  const router = useRouter();
  return (
    <Modal
      open={isOpen}
      onClose={() => onClose(false)}
      closeButton={!slettSøknadSuccess}
      shouldCloseOnOverlayClick={!slettSøknadSuccess}
    >
      <Modal.Content className={classes?.modalContent}>
        {!slettSøknadSuccess && (
          <>
            <Heading className={classes?.modalHeading} size={'small'} level={'1'}>
              {formatMessage({ id: 'avbrytOgSlettModal.heading' })}
            </Heading>
            <div className={classes?.buttonWrapper}>
              <Button variant="primary" type="button" onClick={() => slettSøknadOgAvbryt()}>
                {isDeletingSøknad && <Loader />}
                {!isDeletingSøknad &&
                  formatMessage({ id: 'avbrytOgSlettModal.avbrytOgSlettButtonText' })}
              </Button>
              <Button
                variant="tertiary"
                type="button"
                onClick={() => !isDeletingSøknad && onClose(false)}
              >
                {formatMessage({ id: 'avbrytOgSlettModal.avbrytButtonText' })}
              </Button>
            </div>
          </>
        )}
        {slettSøknadSuccess && (
          <>
            <SuccessStroke className={classes?.successStroke} color={'var(--a-border-success)'} />
            <Alert variant={'success'}>Søknaden er slettet</Alert>
            <div className={classes?.buttonWrapper}>
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  if (window?.location) {
                    window.location.href = clientSideIsProd()
                      ? 'https://www.nav.no/person/dittnav'
                      : 'https://www.dev.nav.no/person/dittnav';
                  }
                }}
              >
                {formatMessage({ id: 'avbrytOgSlettModal.lukkButtonText' })}
              </Button>
              <Button
                variant="tertiary"
                type="button"
                onClick={() => {
                  if (window?.location) {
                    router.reload();
                  }
                }}
              >
                {formatMessage({ id: 'avbrytOgSlettModal.sendNyButtonText' })}
              </Button>
            </div>
          </>
        )}
      </Modal.Content>
    </Modal>
  );
};

export default SlettModal;
