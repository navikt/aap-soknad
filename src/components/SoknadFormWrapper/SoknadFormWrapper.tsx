import { FieldErrors } from 'react-hook-form';
import React, { useState } from 'react';
import { Alert, Loader, BodyShort, Heading, Modal, Button } from '@navikt/ds-react';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import * as classes from './SoknadFormWrapper.module.css';
import { SuccessStroke } from '@navikt/ds-icons';
import { useNavigate } from 'react-router-dom';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';

interface Props {
  children?: React.ReactNode;
  nextButtonText: string;
  backButtonText: string;
  cancelButtonText: string;
  onNext: (data: any) => void;
  onBack: () => void;
  onDelete: () => Promise<boolean>;
  nextIsLoading?: boolean;
  focusOnErrors?: boolean;
  onStartNySøknad?: () => void;
  errors: FieldErrors;
}

interface LagreModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}

export const LagreModal = ({ isOpen, onClose }: LagreModalProps) => {
  const { formatMessage } = useFeatureToggleIntl();
  return (
    <Modal open={isOpen} onClose={() => onClose(false)}>
      <Modal.Content className={classes?.modalContent}>
        <Heading size={'small'} level={'1'}>
          {formatMessage('lagreModal.heading')}
        </Heading>
        <BodyShort>{formatMessage('lagreModal.text')}</BodyShort>
        <div className={classes?.buttonWrapper}>
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              if (window?.location) {
                window.location.href = formatMessage('applinks.dineSaker');
              }
            }}
          >
            {formatMessage('lagreModal.lagreButtonText')}
          </Button>
          <Button variant="tertiary" type="button" onClick={() => onClose(false)}>
            {formatMessage('lagreModal.avbrytButtonText')}
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
  startNySøknad: () => void;
}
export const SlettModal = ({
  isOpen,
  onClose,
  slettSøknadSuccess,
  isDeletingSøknad,
  slettSøknadOgAvbryt,
  startNySøknad,
}: SlettModalProps) => {
  const { formatMessage } = useFeatureToggleIntl();
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
            <Heading size={'small'} level={'1'}>
              {formatMessage('avbrytOgSlettModal.heading')}
            </Heading>
            <div className={classes?.buttonWrapper}>
              <Button variant="primary" type="button" onClick={() => slettSøknadOgAvbryt()}>
                {isDeletingSøknad && <Loader />}
                {!isDeletingSøknad && formatMessage('avbrytOgSlettModal.avbrytOgSlettButtonText')}
              </Button>
              <Button
                variant="tertiary"
                type="button"
                onClick={() => !isDeletingSøknad && onClose(false)}
              >
                {formatMessage('avbrytOgSlettModal.avbrytButtonText')}
              </Button>
            </div>
          </>
        )}
        {slettSøknadSuccess && (
          <>
            <SuccessStroke
              className={classes?.successStroke}
              color={'var(--navds-semantic-color-feedback-success-border)'}
            />
            <Alert variant={'success'}>Søknaden er slettet</Alert>
            <div className={classes?.buttonWrapper}>
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  if (window?.location) {
                    window.location.href = formatMessage('applinks.dittNav', {
                      hostname: process.env.NAV_HOSTNAME_URL,
                    });
                  }
                }}
              >
                {formatMessage('avbrytOgSlettModal.lukkButtonText')}
              </Button>
              <Button variant="tertiary" type="button" onClick={() => startNySøknad()}>
                {formatMessage('avbrytOgSlettModal.sendNyButtonText')}
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
  onStartNySøknad,
}: Props) => {
  //const navigate = useNavigate();

  const { formatMessage } = useFeatureToggleIntl();
  const [showLagreModal, setShowLagreModal] = useState<boolean>(false);
  const [showAvbrytModal, setShowAvbrytModal] = useState<boolean>(false);
  const [isSlettingSøknad, setIsSlettingSøknad] = useState<boolean>(false);
  const [slettSøknadSuccess, setSlettSøknadSuccess] = useState<boolean>(false);
  const slettSøknadOgAvbryt = async () => {
    try {
      setIsSlettingSøknad(true);
      await onDelete();
      // await slettLagretSoknadState(søknadDispatch, søknadState);
      setIsSlettingSøknad(false);
      setSlettSøknadSuccess(true);
    } catch (err) {
      setIsSlettingSøknad(false);
      console.error(err);
    }
  };
  return (
    <>
      <form onSubmit={onNext} className={classes?.formContent}>
        <FormErrorSummary id="skjema-feil-liste" errors={errors} data-testid={'error-summary'} />
        {children}
        <div className={classes?.fourButtonWrapper}>
          <Button
            className={classes?.buttonBack}
            variant="secondary"
            type="button"
            onClick={onBack}
          >
            {backButtonText}
          </Button>
          <Button
            className={classes?.buttonNext}
            variant="primary"
            type="submit"
            disabled={nextIsLoading}
            loading={nextIsLoading}
          >
            {nextButtonText}
          </Button>
          <span className={classes?.separatorLine} />
          <Button
            className={classes?.buttonSave}
            variant="tertiary"
            type="button"
            onClick={() => setShowLagreModal(true)}
          >
            {formatMessage('navigation.save')}
          </Button>
          <Button
            className={classes?.buttonCancel}
            variant="tertiary"
            type="button"
            onClick={() => setShowAvbrytModal(true)}
          >
            {formatMessage('navigation.cancel')}
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
        startNySøknad={() =>
          onStartNySøknad ? onStartNySøknad() : console.log('navigate is not implemented')
        }
      />
    </>
  );
};
export default SøknadFormWrapper;
