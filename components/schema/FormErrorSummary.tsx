import React, { Ref, useEffect, useMemo, useRef } from 'react';
import { FieldError, FieldErrors, FieldValues } from 'react-hook-form';
import { ErrorSummary } from '@navikt/ds-react';
import * as classes from './FormErrorSummary.module.css';
import { setFocusHtmlRef } from '../../utils/dom';
import { useIntl } from 'react-intl';

export const setFocusOnErrorSummary = () => {
  const errorSummary = document?.getElementById('aap-error-summary');
  errorSummary?.focus();
};

interface Props<FormFieldValues extends FieldValues> {
  errors: FieldErrors<FormFieldValues>;
}

const FormErrorSummary = <FormFieldValues extends FieldValues>(props: Props<FormFieldValues>) => {
  const { errors } = props;
  const { formatMessage } = useIntl();

  const errorSummaryRef: Ref<HTMLDivElement> = useRef(null);

  const flatErrors = flatObj(errors);
  const keyList = Object.keys(flatErrors).filter((e) => e);

  const scrollToErrorSummary = useMemo(() => {
    return keyList.length > 0;
  }, [keyList]);

  useEffect(() => {
    if (scrollToErrorSummary) {
      setFocusHtmlRef(errorSummaryRef);
    }
  }, [scrollToErrorSummary]);

  // Må rendre ErrorSummary selv om det ikke er feil pga UU
  if (keyList?.length < 1) {
    return (
      <ErrorSummary
        ref={errorSummaryRef}
        heading={formatMessage({ id: 'errorSummary.title' })}
        role={'alert'}
        aria-hidden={keyList?.length === 0}
        tabIndex={-1}
        className={keyList?.length === 0 ? classes?.visuallyHidden : ''}
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
      heading={formatMessage({ id: 'errorSummary.title' })}
      role={'alert'}
      aria-hidden={keyList?.length === 0}
      className={keyList?.length === 0 ? classes?.visuallyHidden : ''}
      {...props}
    >
      {keyList.map((key) => (
        <ErrorSummary.Item key={key} href={`#${key}`}>
          {flatErrors[key]}
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  );
};

function flatObj(errors: FieldErrors | FieldError, prevKey = ''): Record<string, string> {
  return Object.entries(errors).reduce((flatted, [key, value]) => {
    if (value?.message) {
      if (value?.ref?.name) {
        return { ...flatted, [value?.ref?.name]: value?.message };
      } else {
        const fullKey = prevKey ? `${prevKey}.${key}` : key;
        return { ...flatted, [fullKey]: value?.message };
      }
    } else {
      return { ...flatted, ...flatObj(value, key) };
    }
  }, {});
}

export { FormErrorSummary };
