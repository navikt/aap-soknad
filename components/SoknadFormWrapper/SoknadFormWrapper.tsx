import { FieldErrors } from 'react-hook-form';
import React, { useState } from 'react';
import { Button, Detail } from '@navikt/ds-react';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import * as classes from './SoknadFormWrapper.module.css';
import { useAppStateContext } from 'context/appStateContext';
import { useIntl } from 'react-intl';
import SlettModal from './SlettModal';
import LagreModal from './LagreModal';

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

const SøknadFormWrapper = ({
  children,
  nextButtonText,
  backButtonText,
  onNext,
  onBack,
  errors,
  nextIsLoading = false,
  className = '',
}: Props) => {
  const { formatMessage } = useIntl();
  const { appState } = useAppStateContext();
  const [showLagreModal, setShowLagreModal] = useState<boolean>(false);
  const [showAvbrytModal, setShowAvbrytModal] = useState<boolean>(false);

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
      <SlettModal isOpen={showAvbrytModal} onClose={(value) => setShowAvbrytModal(value)} />
    </>
  );
};
export default SøknadFormWrapper;
