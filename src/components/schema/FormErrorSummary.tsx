import React from 'react';
import { FieldErrors } from 'react-hook-form';

import { ErrorSummary } from '@navikt/ds-react';
import useTexts from '../../hooks/useTexts';

import * as tekster from './tekster';

const FormErrorSummary = ({ errors }: FieldErrors) => {
  const keyList = Object.keys(errors).filter((e) => e);
  const { getText } = useTexts(tekster);
  if (keyList.length < 1) return null;
  return (
    <ErrorSummary heading={getText('skjemafeil')}>
      {keyList.map((key) => (
        <ErrorSummary.Item key={key} href={`#${key}`}>
          {
            // @ts-ignore
            errors[key]?.message
          }
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  );
};

export { FormErrorSummary };
