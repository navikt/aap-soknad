import { NextPageContext, GetServerSidePropsResult } from 'next';
import { isMock } from 'utils/environments';
import { getAccessToken } from './accessToken';
import { logError } from 'lib/utils/logger';
import { validateToken } from '@navikt/oasis';

type PageHandler = (context: NextPageContext) => void | Promise<GetServerSidePropsResult<{}>>;

const wonderwallRedirect = {
  redirect: {
    destination: '/oauth2/login?redirect=/aap/soknad',
    permanent: false,
  },
};

export function beskyttetSide(handler: PageHandler) {
  return async function withBearerTokenHandler(
    context: NextPageContext,
  ): Promise<ReturnType<typeof handler>> {
    if (isMock()) {
      return handler(context);
    }

    const bearerToken = getAccessToken(context);

    if (!bearerToken) {
      return wonderwallRedirect;
    }

    const validation = await validateToken(bearerToken);
    if (!validation.ok) {
      logError('kunne ikke validere idportentoken i beskyttetSide', validation.error);
      return wonderwallRedirect;
    }
    return handler(context);
  };
}
