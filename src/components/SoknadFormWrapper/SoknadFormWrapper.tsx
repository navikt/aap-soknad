import { FieldErrors } from 'react-hook-form';
import React from 'react';
import { Button } from '@navikt/ds-react';
import { FormErrorSummary } from '../schema/FormErrorSummary';
import * as classes from './SoknadFormWrapper.module.css';

interface Props {
  children?: React.ReactNode;
  nextButtonText: string;
  backButtonText: string;
  cancelButtonText: string;
  onNext: (data: any) => void;
  onBack: () => void;
  onCancel: () => void;
  nextIsLoading?: boolean;
  errors: FieldErrors;
}

const SøknadFormWrapper = ({
  children,
  nextButtonText,
  backButtonText,
  cancelButtonText,
  onNext,
  onBack,
  onCancel,
  errors,
  nextIsLoading = false,
}: Props) => {
  return (
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
        <Button variant="tertiary" type="button" onClick={onCancel}>
          {cancelButtonText}
        </Button>
      </div>
    </form>
  );
};
export default SøknadFormWrapper;
