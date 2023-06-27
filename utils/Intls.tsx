import type { ReactNode } from 'react';
import type { IntlFormatters } from 'react-intl';
import type { Props as ReactIntlFormattedMessageProps } from 'react-intl/src/components/message';
import { FormattedMessage as ReactIntlFormattedMessage, useIntl as useReactIntl } from 'react-intl';

import messagesNn from '../translations/nn.json';
import messagesNb from '../translations/nb.json';
import links from '../translations/links.json';

export type IntlMessageKeys =
  | keyof typeof messagesNn
  | keyof typeof messagesNb
  | keyof typeof links;

type FormatMessageArgs = Parameters<IntlFormatters<ReactNode>['formatMessage']>;

type FormattedMessageProps = ReactIntlFormattedMessageProps<Record<string, ReactNode>> & {
  id?: IntlMessageKeys;
};

export function FormattedMessage({ id, ...rest }: FormattedMessageProps) {
  return <ReactIntlFormattedMessage id={id} {...rest} />;
}

export interface TypedFormatMessageArgs {
  descriptor: FormatMessageArgs[0] & {
    id?: IntlMessageKeys;
  };
  values?: FormatMessageArgs[1];
  options?: FormatMessageArgs[2];
}

export function useIntl() {
  const { formatMessage, ...rest } = useReactIntl();

  const typedFormatMessage = (
    descriptor: TypedFormatMessageArgs['descriptor'],
    values?: TypedFormatMessageArgs['values'],
    options?: TypedFormatMessageArgs['options']
  ) => {
    return formatMessage(descriptor, values, options);
  };

  return {
    ...rest,
    formatMessage: typedFormatMessage,
  };
}
