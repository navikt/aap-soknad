import { FieldErrors } from "react-hook-form";
import { ErrorSummary } from "@navikt/ds-react";
import React from "react";

const FormErrorSummary = ({ errors }: FieldErrors) => {
  const keyList = Object.keys(errors).filter((e) => e);
  if (keyList.length < 1) return null;
  return (
    <ErrorSummary>
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
