import { FieldErrors } from 'react-hook-form';
import React, { useState } from 'react';
import { Alert, BodyShort, Button, Detail, Heading, Loader, Modal } from '@navikt/ds-react';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import * as classes from './SoknadFormWrapper.module.css';
import { SuccessStroke } from '@navikt/ds-icons';
import { useAppStateContext } from 'context/appStateContext';
import { clientSideIsProd } from 'utils/environments';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

interface Props {
  children?: React.ReactNode;
  nextButtonText: string;
  backButtonText?: string;
  cancelButtonText: string;
  onNext: (data: any) => void;
  onBack?: () => void;
  onDelete: () => Promise<any>;
  nextIsLoading?: boolean;
  focusOnErrors?: boolean;
  errors?: FieldErrors;
  className?: string;
}

interface LagreModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}

export const LagreModal = ({ isOpen, onClose }: LagreModalProps) => {
  const { formatMessage } = useIntl();
  return (
    <Modal open={isOpen} onClose={() => onClose(false)}>
      <Modal.Content className={classes?.modalContent}>
        <Heading size={'small'} level={'1'}>
          {formatMessage({ id: 'lagreModal.heading' })}
        </Heading>
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
      </Modal.Content>
    </Modal>
  );
};

interface SlettModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  slettSøknadSuccess: boolean;
  isDeletingSøknad: boolean;
  slettSøknadOgAvbryt: () => void;
}
export const SlettModal = ({
  isOpen,
  onClose,
  slettSøknadSuccess,
  isDeletingSøknad,
  slettSøknadOgAvbryt,
}: SlettModalProps) => {
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

const SøknadFormWrapper = ({
  children,
  nextButtonText,
  backButtonText,
  onNext,
  onBack,
  onDelete,
  errors,
  nextIsLoading = false,
  className = '',
}: Props) => {
  const { formatMessage } = useIntl();
  const { appState } = useAppStateContext();
  const [showLagreModal, setShowLagreModal] = useState<boolean>(false);
  const [showAvbrytModal, setShowAvbrytModal] = useState<boolean>(false);
  const [isSlettingSøknad, setIsSlettingSøknad] = useState<boolean>(false);
  const [slettSøknadSuccess, setSlettSøknadSuccess] = useState<boolean>(false);
  const slettSøknadOgAvbryt = async () => {
    try {
      setIsSlettingSøknad(true);
      await onDelete();
      setIsSlettingSøknad(false);
      setSlettSøknadSuccess(true);
    } catch (err) {
      setIsSlettingSøknad(false);
      console.error(err);
    }
  };
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onNext(event);
        }}
        className={`${classes?.formContent} ${className}`}
      >
        {errors && <FormErrorSummary errors={errors} data-testid={'error-summary'} />}
        {children}
        <div className={classes?.fourButtonWrapper}>
          {onBack && (
            <Button
              className={classes?.buttonBack}
              variant="secondary"
              type="button"
              onClick={onBack}
            >
              {backButtonText}
            </Button>
          )}
          <Button
            className={onBack ? classes?.buttonNext : classes?.buttonBack}
            variant="primary"
            type="submit"
            disabled={nextIsLoading}
            loading={nextIsLoading}
          >
            {nextButtonText}
          </Button>
          <span className={classes?.separatorLine} />
          {appState?.sistLagret && (
            <Detail
              className={classes?.sistLagret}
              spacing
            >{`Sist lagret: ${appState?.sistLagret}`}</Detail>
          )}
          <Button
            className={classes?.buttonSave}
            variant="tertiary"
            type="button"
            onClick={() => setShowLagreModal(true)}
          >
            {formatMessage({ id: 'navigation.save' })}
          </Button>
          <Button
            className={classes?.buttonCancel}
            variant="tertiary"
            type="button"
            onClick={() => setShowAvbrytModal(true)}
          >
            {formatMessage({ id: 'navigation.cancel' })}
          </Button>
        </div>
      </form>
      <LagreModal isOpen={showLagreModal} onClose={(value) => setShowLagreModal(value)} />
      <SlettModal
        isOpen={showAvbrytModal}
        onClose={(value: boolean) => setShowAvbrytModal(value)}
        slettSøknadSuccess={slettSøknadSuccess}
        isDeletingSøknad={isSlettingSøknad}
        slettSøknadOgAvbryt={() => slettSøknadOgAvbryt()}
      />
    </>
  );
};
export default SøknadFormWrapper;
