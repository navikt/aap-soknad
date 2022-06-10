import { FieldErrors } from 'react-hook-form';
import React, { useState } from 'react';
import { BodyShort, Heading, Modal, Button } from '@navikt/ds-react';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import * as classes from './SoknadFormWrapper.module.css';
import * as tekster from './tekster';
import useTexts from '../../hooks/useTexts';
import { slettLagretSoknadState, useSoknadContext } from '../../context/soknadContext';
import { resetStepWizard, useStepWizard } from '../../context/stepWizardContextV2';

interface Props {
  children?: React.ReactNode;
  nextButtonText: string;
  backButtonText: string;
  cancelButtonText: string;
  onNext: (data: any) => void;
  onBack: () => void;
  onCancel: () => void;
  nextIsLoading?: boolean;
  focusOnErrors?: boolean;
  errors: FieldErrors;
}

const SøknadFormWrapper = ({
  children,
  nextButtonText,
  backButtonText,
  onNext,
  onBack,
  errors,
  nextIsLoading = false,
}: Props) => {
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const [showLagreModal, setShowLagreModal] = useState<boolean>(false);
  const [showAvbrytModal, setShowAvbrytModal] = useState<boolean>(false);
  const { getText } = useTexts(tekster);
  const slettSøknadOgAvbryt = async () => {
    try {
      await slettLagretSoknadState(søknadDispatch, søknadState);
      resetStepWizard(stepWizardDispatch);
      setShowAvbrytModal(false);
    } catch (err) {
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
            {'Lagre og fortsett senere'}
          </Button>
          <Button
            className={classes?.buttonCancel}
            variant="tertiary"
            type="button"
            onClick={() => setShowAvbrytModal(true)}
          >
            {'Avbryt og slett søknad'}
          </Button>
        </div>
      </form>
      <Modal open={showLagreModal} onClose={() => setShowLagreModal(false)}>
        <Modal.Content className={classes?.formContent}>
          <Heading size={'small'} level={'1'}>
            {getText('lagreModal.heading')}
          </Heading>
          <BodyShort>{getText('lagreModal.text')}</BodyShort>
          <div className={classes?.buttonWrapper}>
            <Button
              variant="primary"
              type="button"
              onClick={() => console.log('lagre og fortsett senere')}
            >
              {getText('lagreModal.lagreButton')}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setShowLagreModal(false)}>
              {getText('lagreModal.avbrytButton')}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
      <Modal open={showAvbrytModal} onClose={() => setShowAvbrytModal(false)}>
        <Modal.Content className={classes?.formContent}>
          <Heading size={'small'} level={'1'}>
            {getText('avbrytOgSlettModal.heading')}
          </Heading>
          <div className={classes?.buttonWrapper}>
            <Button variant="primary" type="button" onClick={() => slettSøknadOgAvbryt()}>
              {getText('avbrytOgSlettModal.avbrytOgSlettButtonText')}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setShowAvbrytModal(false)}>
              {getText('avbrytOgSlettModal.avbrytButtonText')}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};
export default SøknadFormWrapper;
