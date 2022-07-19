import { Button } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import { LagreModal, SlettModal } from './SoknadFormWrapper';
import * as classes from './SoknadFormWrapper.module.css';

interface Props {
  nextButtonText: string;
  backButtonText: string;
  onNext: (data: any) => void;
  onBack: () => void;
  onDelete: () => Promise<boolean>;
  nextIsLoading?: boolean;
  errors: FieldErrors;
  children: React.ReactNode;
}

export const NextSoknadFormWrapper = ({
  nextButtonText,
  backButtonText,
  onNext,
  onBack,
  onDelete,
  nextIsLoading,
  errors,
  children,
}: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const router = useRouter();

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
        startNySøknad={() => router.push('/aap/soknad/utland')}
      />
    </>
  );
};
