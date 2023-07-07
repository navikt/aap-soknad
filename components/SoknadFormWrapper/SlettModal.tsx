import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Alert, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import * as classes from './SoknadFormWrapper.module.css';
import { SuccessStroke } from '@navikt/ds-icons';
import { clientSideIsProd } from '../../utils/environments';
import React, { useState } from 'react';
import {
  deleteOpplastedeVedlegg,
  useSoknadContextStandard,
} from '../../context/soknadContextStandard';
import { slettLagretSoknadState } from '../../context/soknadContextCommon';
import { Soknad } from '../../types/Soknad';

interface Props {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}
const SlettModal = ({ isOpen, onClose }: Props) => {
  const [isDeletingSøknad, setIsDeletingSøknad] = useState<boolean>(false);
  const [slettSøknadSuccess, setSlettSøknadSuccess] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { formatMessage } = useIntl();
  const router = useRouter();

  async function onDelete() {
    await deleteOpplastedeVedlegg(søknadState.søknad);
    await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
  }

  const slettSøknadOgAvbryt = async () => {
    try {
      setIsDeletingSøknad(true);
      await onDelete();
      setIsDeletingSøknad(false);
      setSlettSøknadSuccess(true);
    } catch (err) {
      setIsDeletingSøknad(false);
      console.error(err);
    }
  };
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
                    router.push('/');
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
