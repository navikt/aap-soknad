/**
 * NOTE: This requires `@sentry/nextjs` version 7.3.0 or higher.
 *
 * NOTE: If using this with `next` version 12.2.0 or lower, uncomment the
 * penultimate line in `CustomErrorComponent`.
 *
 * This page is loaded by Nextjs:
 *  - on the server, when data-fetching methods throw or reject
 *  - on the client, when `getInitialProps` throws or rejects
 *  - on the client, when a React lifecycle method throws or rejects, and it's
 *    caught by the built-in Nextjs error boundary
 *
 * See:
 *  - https://nextjs.org/docs/basic-features/data-fetching/overview
 *  - https://nextjs.org/docs/api-reference/data-fetching/get-initial-props
 *  - https://reactjs.org/docs/error-boundaries.html
 */

import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';

function Error({ statusCode }) {
  return (
    <div className="error-container">
      <Image src={'/assets/nav-logo-red.svg'} alt="Nav logo" width="350px" height="300px" />
      {statusCode && <h1>Error: {statusCode}</h1>}
      <p>
        Beklager, her har det skjedd noe galt. Vi har spart på svarene dine slik at du kan fortsette
        der du slapp senere.
      </p>
      <Link href="/" shallow={false}>
        Gå tilbake til søknad
      </Link>
    </div>
  );
}

Error.getInitialProps = async ({ res, err }) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
