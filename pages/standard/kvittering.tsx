import PageHeader from 'components/PageHeader';
import React, { useEffect, useState } from 'react';
import { SokerOppslagState, SøkerView } from 'context/sokerOppslagContext';
import { SoknadContextProviderStandard } from 'context/soknadContextStandard';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import Kvittering from 'components/pageComponents/standard/Kvittering/Kvittering';
import * as classes from 'components/pageComponents/standard/standard.module.css';
import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from 'auth/accessToken';
import { getSøknader, SøknadApiType } from 'pages/api/oppslag/soeknader';
import { getSøker } from 'pages/api/oppslag/soeker';
import logger from 'utils/logger';
interface PageProps {
  søker: SokerOppslagState;
  søknader: SøknadApiType[];
}

const KvitteringPage = ({ søker, søknader }: PageProps) => {
  const { formatMessage } = useFeatureToggleIntl();

  const [soker, setSoker] = useState({});

  useEffect(() => {
    if (søker?.søker) {
      const _søker: SøkerView = {
        fulltNavn: `${søker.søker.navn.fornavn ?? ''} ${søker.søker.navn.mellomnavn ?? ''} ${
          søker.søker.navn.etternavn ?? ''
        }`,
      };
      setSoker(_søker);
    }
  }, [søker, setSoker]);

  return (
    <SoknadContextProviderStandard>
      <PageHeader align="center" className={classes?.pageHeader}>
        {formatMessage('søknad.pagetitle')}
      </PageHeader>
      <Kvittering
        søker={soker}
        kontaktinformasjon={søker.kontaktinformasjon}
        søknad={søknader[0]}
      />
    </SoknadContextProviderStandard>
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const bearerToken = getAccessToken(ctx);
    const søknader = await getSøknader(bearerToken);
    const søker = await getSøker(bearerToken);
    logger.info(`søkeroppslag fra API: ${JSON.stringify(søknader)}`);

    return {
      props: { søknader, søker },
    };
  }
);

export default KvitteringPage;
