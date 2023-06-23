import { DecoratorLocale } from '@navikt/nav-dekoratoren-moduler';
import messagesNn from '../translations/nn.json';
import messagesNb from '../translations/nb.json';

export type Messages = {
  [K in DecoratorLocale]?: { [name: string]: string };
};

export const messages: Messages = {
  nb: messagesNb,
  nn: messagesNn,
};
