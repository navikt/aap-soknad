import { useIntl } from 'react-intl';
import React from 'react';

export const useFeatureToggleIntl = () => {
  const intl = useIntl();

  const formatMessage = (id: string, values?: Record<string, string | undefined>) =>
    intl.formatMessage({ id: id }, values);
  const formatElement = (
    id: string,
    values?:
      | Record<
          string,
          string | number | boolean | {} | Date | React.ReactElement<any, any> | undefined
        >
      | undefined
  ) => intl.formatMessage({ id: id }, values);
  return { formatMessage, formatElement };
};
