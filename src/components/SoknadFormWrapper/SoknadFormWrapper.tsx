import { FieldErrors } from 'react-hook-form';
import React, { useState } from 'react';
import { BodyShort, Heading, Modal, Button } from '@navikt/ds-react';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import * as classes from './SoknadFormWrapper.module.css';
import * as tekster from './tekster';
import useTexts from '../../hooks/useTexts';

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
  const [showLagreModal, setShowLagreModal] = useState<boolean>(false);
  const [showAvbrytModal, setShowAvbrytModal] = useState<boolean>(false);
  const { getText } = useTexts(tekster);
  return (
    <>
      <form onSubmit={onNext} className={classes?.formContent}>
        <FormErrorSummary id="skjema-feil-liste" errors={errors} data-testid={'error-summary'} />
        {children}
        <div className={classes?.buttonWrapper}>
          <Button variant="secondary" type="button" onClick={onBack}>
            {backButtonText}
          </Button>
          <Button variant="primary" type="submit" disabled={nextIsLoading} loading={nextIsLoading}>
            {nextButtonText}
          </Button>
        </div>
        <div className={classes?.buttonWrapper}>
          <Button variant="tertiary" type="button" onClick={() => setShowLagreModal(true)}>
            {'Lagre og fortsett senere'}
          </Button>
          <Button variant="tertiary" type="button" onClick={() => setShowAvbrytModal(true)}>
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
            <Button variant="primary" type="button" onClick={() => console.log('avbryt og slett')}>
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
