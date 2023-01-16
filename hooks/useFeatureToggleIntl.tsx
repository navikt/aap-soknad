import { FormattedMessage, useIntl } from 'react-intl';
import React from 'react';

interface FormattedMessageProps {
  id: string;
  values: Record<string, any>;
}

export function useFeatureToggleIntl(): {
  formatMessage: (id: string, values?: Record<string, string>) => string;
  FormatElement: (props: FormattedMessageProps) => JSX.Element;
} {
  const intl = useIntl();

  const formatMessage = (id: string, values?: Record<string, string>) =>
    intl.formatMessage({ id: id }, values);

  const FormatElement = (props: FormattedMessageProps) => {
    return <FormattedMessage id={props.id} values={props.values} />;
  };

  return { formatMessage, FormatElement };
}
