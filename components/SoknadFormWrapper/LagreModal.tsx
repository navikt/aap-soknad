import { useIntl } from 'react-intl';
import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import * as classes from './SoknadFormWrapper.module.css';
import { clientSideIsProd } from '../../utils/environments';
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}
const LagreModal = ({ isOpen, onClose }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Modal open={isOpen} onClose={() => onClose(false)}>
      <Modal.Header>
        <Heading size={'small'} level={'2'} spacing>
          {formatMessage({ id: 'lagreModal.heading' })}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes?.modalContent}>
        <BodyShort>{formatMessage({ id: 'lagreModal.text' })}</BodyShort>
        <div className={classes?.buttonWrapper}>
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              if (window?.location) {
                window.location.href = clientSideIsProd()
                  ? 'https://www.nav.no/minside/'
                  : 'https://www.dev.nav.no/minside/';
              }
            }}
          >
            {formatMessage({ id: 'lagreModal.lagreButtonText' })}
          </Button>
          <Button variant="tertiary" type="button" onClick={() => onClose(false)}>
            {formatMessage({ id: 'lagreModal.avbrytButtonText' })}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LagreModal;
