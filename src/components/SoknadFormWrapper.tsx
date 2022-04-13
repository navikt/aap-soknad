import { GetText } from '../hooks/useTexts';
import Soknad, { Ferie } from '../types/Soknad';
import * as yup from 'yup';
import { FieldError, FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Cell,
  Grid,
  GuidePanel,
  Heading,
  Radio,
  ReadMore,
} from '@navikt/ds-react';
import DatoVelgerWrapper from './input/DatoVelgerWrapper';
import RadioGroupWrapper from './input/RadioGroupWrapper';
import { JaNeiVetIkke } from '../types/Generic';
import ColorPanel from './panel/ColorPanel';
import TextFieldWrapper from './input/TextFieldWrapper';
import { FormErrorSummary } from './schema/FormErrorSummary';

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
    <form onSubmit={onNext}>
      <FormErrorSummary errors={errors} />
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
