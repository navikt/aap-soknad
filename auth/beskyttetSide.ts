import { NextPageContext, GetServerSidePropsResult } from 'next';
import { isMock } from '../utils/environments';
import { getAccessToken } from './accessToken';
import { verifyIdportenAccessToken } from './verifyIdPortenAccessToken';
import { logger } from '@navikt/aap-felles-utils';

type PageHandler = (context: NextPageContext) => void | Promise<GetServerSidePropsResult<{}>>;

const wonderwallRedirect = {
  redirect: {
    destination: '/oauth2/login?redirect=/aap/soknad',
    permanent: false,
  },
};

export function beskyttetSide(handler: PageHandler) {
  return async function withBearerTokenHandler(
    context: NextPageContext
  ): Promise<ReturnType<typeof handler>> {
    if (isMock()) {
      return handler(context);
    }

    const bearerToken = getAccessToken(context);

    if (!bearerToken) {
      return wonderwallRedirect;
    }

    try {
      await verifyIdportenAccessToken(bearerToken);
    } catch (e) {
      logger.error(e, 'kunne ikke validere idportentoken i beskyttetSide');
      return wonderwallRedirect;
    }
    return handler(context);
  };
}

export const beskyttetSideUtenProps = beskyttetSide(
  async (): Promise<GetServerSidePropsResult<{}>> => {
    return {
      props: {},
    };
  }
);
