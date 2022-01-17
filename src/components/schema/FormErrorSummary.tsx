import { FieldErrors } from "react-hook-form";
import { ErrorSummary } from "@navikt/ds-react";
import React from "react";
import useTexts from "../../hooks/useTexts";

const FormErrorSummary = ({ errors }: FieldErrors) => {
  const keyList = Object.keys(errors).filter((e) => e);
  const {getText} = useTexts('felles');
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

export { FormErrorSummary }
