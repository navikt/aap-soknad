import React, { useEffect, useRef } from 'react';
import { FieldErrors } from 'react-hook-form';
import { ErrorSummary } from '@navikt/ds-react';
import * as classes from './FormErrorSummary.module.css';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { scrollRefIntoView } from 'utils/dom';

const FormErrorSummary = (props: FieldErrors) => {
  const { formatMessage } = useFeatureToggleIntl();

  const flatErrors = flatObj(props?.errors);
  const keyList = Object.keys(flatErrors).filter((e) => e);
  const errorSummaryElement = useRef(null);

  useEffect(() => {
    if (keyList?.length > 0) {
      scrollRefIntoView(errorSummaryElement);
    }
  }, [keyList]);

  if (keyList?.length < 1) {
    return (
      <ErrorSummary
        ref={errorSummaryElement}
        heading={formatMessage('errorSummary.title')}
        role={'alert'}
        aria-hidden={keyList?.length === 0}
        className={keyList?.length === 0 ? classes?.visuallyHidden : ''}
        {...props}
      >
        {'hidden'}
      </ErrorSummary>
    );
  }
  return (
    <ErrorSummary
      ref={errorSummaryElement}
      heading={formatMessage('errorSummary.title')}
      role={'alert'}
      aria-hidden={keyList?.length === 0}
      className={keyList?.length === 0 ? classes?.visuallyHidden : ''}
      {...props}
    >
      {keyList.map((key) => (
        <ErrorSummary.Item key={key} href={`#${key}`}>
          {
            // @ts-ignore
            flatErrors[key]
          }
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  );
};

const flatObj: any = (obj: any, prevKey = '') => {
  return Object.entries(obj).reduce((flatted, [key, value]) => {
    if (typeof value == 'object') {
      // @ts-ignore
      if (value?.message) {
        // @ts-ignore
        return { ...flatted, [`${prevKey ? prevKey + '.' : ''}${key}`]: value?.message };
      } else {
        return { ...flatted, ...flatObj(value, key) };
      }
    }
    return flatted;
  }, {});
};
export { FormErrorSummary };
