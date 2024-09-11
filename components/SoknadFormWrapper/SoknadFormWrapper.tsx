import React, { useState } from 'react';
import { Button, Detail, Heading } from '@navikt/ds-react';
import * as classes from './SoknadFormWrapper.module.css';
import { useAppStateContext } from 'context/appStateContext';
import { FormErrorSummary, SøknadValidationError } from 'components/schema/FormErrorSummary';
import { useIntl } from 'react-intl';
import LagreModal from './LagreModal';
import SlettModal from './SlettModal';
import { useStepWizard } from 'hooks/StepWizardHook';

interface Props {
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  nextIsLoading?: boolean;
  errors?: SøknadValidationError[];
  className?: string;
}

const SøknadFormWrapper = (props: Props) => {
  const { formatMessage } = useIntl();
  const {
    children,
    onNext,
    onBack,
    errors,
    nextButtonText = formatMessage({ id: 'navigation.next' }),
    nextIsLoading = false,
    className,
  } = props;
  const { appState } = useAppStateContext();
  const [visLagreModal, setVisLagreModal] = useState<boolean>(false);
  const [visAvbrytModal, setVisAvbrytModal] = useState<boolean>(false);

  const { currentStep } = useStepWizard();

  const stegSomBrukesIKelvin: string[] = ['BARNETILLEGG', 'YRKESSKADE', 'STUDENT'];
  const isDev =
    window.location.href.includes('intern.dev') || window.location.href.includes('ansatt.dev');
  const stegBrukesIKelvin = isDev && stegSomBrukesIKelvin.includes(currentStep.name);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onNext();
        }}
        className={`${classes?.formContent} ${className}`}
      >
        {isDev && (
          <>
            {stegBrukesIKelvin ? (
              <div className={classes.bannergrønt}>
                <Heading size={'small'}>Dette steget er koblet til Kelvin</Heading>
              </div>
            ) : (
              <div className={classes.bannergult}>
                <Heading size={'small'}>Dette steget er ikke koblet til Kelvin</Heading>
              </div>
            )}
          </>
        )}
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
              {formatMessage({ id: 'navigation.back' })}
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
            onClick={() => setVisLagreModal(true)}
          >
            {formatMessage({ id: 'navigation.save' })}
          </Button>
          <Button
            className={classes?.buttonCancel}
            variant="tertiary"
            type="button"
            onClick={() => setVisAvbrytModal(true)}
          >
            {formatMessage({ id: 'navigation.cancel' })}
          </Button>
        </div>
      </form>
      <LagreModal isOpen={visLagreModal} onClose={(value) => setVisLagreModal(value)} />
      <SlettModal isOpen={visAvbrytModal} onClose={(value) => setVisAvbrytModal(value)} />
    </>
  );
};
export default SøknadFormWrapper;
