'use client';
import { useTranslations } from 'next-intl';
import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import * as classes from './SoknadFormWrapper.module.css';
import { clientSideIsProd } from '../../utils/environments';
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}
const LagreModal = ({ isOpen, onClose }: Props) => {
  const t = useTranslations();
  return (
    <Modal
      open={isOpen}
      onClose={() => onClose(false)}
      aria-label={t('lagreModal.heading')}
    >
      <Modal.Header>
        <Heading size={'small'} level={'2'} spacing>
          {t('lagreModal.heading')}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes?.modalContent}>
        <BodyShort>{t('lagreModal.text')}</BodyShort>
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
            {t('lagreModal.lagreButtonText')}
          </Button>
          <Button variant="tertiary" type="button" onClick={() => onClose(false)}>
            {t('lagreModal.avbrytButtonText')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LagreModal;
