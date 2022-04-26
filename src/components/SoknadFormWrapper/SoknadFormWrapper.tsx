import { FieldErrors } from 'react-hook-form';
import React from 'react';
import { Button, Cell, Grid } from '@navikt/ds-react';
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
      <FormErrorSummary errors={errors} data-testid={'error-summary'} />
      {children}
      <Grid>
        <Cell xs={3}>
          <Button variant="secondary" type="button" onClick={onBack}>
            {backButtonText}
          </Button>
        </Cell>
        <Cell xs={3}>
          <Button variant="primary" type="submit" disabled={nextIsLoading} loading={nextIsLoading}>
            {nextButtonText}
          </Button>
        </Cell>
      </Grid>
      <Grid>
        <Cell xs={3}>
          <Button variant="tertiary" type="button" onClick={onCancel}>
            {cancelButtonText}
          </Button>
        </Cell>
      </Grid>
    </form>
  );
};
export default SøknadFormWrapper;
