import PageHeader from 'components/PageHeader';
import React from 'react';
import { SokerOppslagState } from 'context/sokerOppslagContext';
import { SoknadContextProviderStandard } from 'context/soknadContextStandard';
import * as classes from 'components/pageComponents/standard/standard.module.css';
import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from 'auth/accessToken';
import { getSøker } from 'pages/api/oppslag/soeker';
import { Button } from '@navikt/ds-react';
import { fetchPOST } from 'api/fetch';
interface PageProps {
  søker: SokerOppslagState;
}

const KvitteringPage = ({ søker }: PageProps) => {
  const onButtonClick = async () => {
    const søknadData = await fetchPOST('/aap/soknad/api/innsending/soknad', {});
  };
  const onServerErrorButtonClick = async () =>
    await fetch('/aap/soknad/api/log/logerror', { method: 'GET' });
  return (
    <SoknadContextProviderStandard>
      <PageHeader align="center" className={classes?.pageHeader}>
        {'Testside'}
      </PageHeader>
      <Button onClick={onButtonClick} type={'button'} variant={'primary'}>
        Send tom søknad
      </Button>
      <Button onClick={onServerErrorButtonClick} type={'button'} variant={'primary'}>
        Log feil på nextjs server
      </Button>
      <Button onClick={onServerErrorButtonClick} type={'button'} variant={'primary'}>
        Log søknad sendt
      </Button>
    </SoknadContextProviderStandard>
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);

    return {
      props: { søker },
    };
  }
);

export default KvitteringPage;
