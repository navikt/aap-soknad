import React, { Ref, useEffect, useMemo, useRef } from 'react';
import { ErrorSummary } from '@navikt/ds-react';
import * as classes from './FormErrorSummary.module.css';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { setFocusHtmlRef } from '../../utils/dom';

export interface SøknadValidationError {
  path: string;
  message: string;
}

interface Props {
  errors?: SøknadValidationError[];
}

const FormErrorSummaryNew = (props: Props) => {
  const { errors } = props;
  const { formatMessage } = useFeatureToggleIntl();

  const errorSummaryRef: Ref<HTMLDivElement> = useRef(null);

  const scrollToErrorSummary = useMemo(() => {
    return errors != undefined;
  }, [errors]);

  useEffect(() => {
    if (scrollToErrorSummary) {
      setFocusHtmlRef(errorSummaryRef);
    }
  }, [scrollToErrorSummary]);

  // Må rendre ErrorSummary selv om det ikke er feil pga UU
  if (!errors) {
    return (
      <ErrorSummary
        ref={errorSummaryRef}
        heading={formatMessage('errorSummary.title')}
        role={'alert'}
        aria-hidden={!errors}
        tabIndex={-1}
        className={!errors ? classes?.visuallyHidden : ''}
        {...props}
      >
        {'hidden'}
      </ErrorSummary>
    );
  }

  return (
    <ErrorSummary
      id="aap-error-summary"
      ref={errorSummaryRef}
      heading={formatMessage('errorSummary.title')}
      role={'alert'}
      aria-hidden={!errors}
      className={!errors ? classes?.visuallyHidden : ''}
      {...props}
    >
      {errors.map((error) => (
        <ErrorSummary.Item key={error.path} href={`#${error.path}`}>
          {error.message}
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  );
};

export { FormErrorSummaryNew };
