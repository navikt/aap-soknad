import React, { useState } from 'react';
import { Button, Detail } from '@navikt/ds-react';
import * as classes from './SoknadFormWrapper.module.css';
import { useAppStateContext } from 'context/appStateContext';
import { FormErrorSummaryNew, SøknadValidationError } from '../schema/FormErrorSummaryNew';
import { useIntl } from 'react-intl';
import LagreModal from './LagreModal';
import SlettModal from './SlettModal';

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
  errors?: SøknadValidationError[];
  className?: string;
}

const SøknadFormWrapperNew = ({
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
        {errors && <FormErrorSummaryNew errors={errors} data-testid={'error-summary'} />}
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
export default SøknadFormWrapperNew;
