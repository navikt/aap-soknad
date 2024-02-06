import PageHeader from 'components/PageHeader';
import React, { useEffect, useState } from 'react';
import { KontaktInfoView, SokerOppslagState, SøkerView } from 'context/sokerOppslagContext';
import Kvittering from 'components/pageComponents/standard/Kvittering/Kvittering';
import * as classes from 'components/pageComponents/standard/standard.module.css';
import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from 'auth/accessToken';
import { getSøknader, SøknadApiType } from 'pages/api/oppslag/soeknader';
import { getSøker } from 'pages/api/oppslag/soeker';
import { logger } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { FormattedMessage } from 'react-intl';
import { SoknadContextProvider } from 'context/soknadcontext/soknadContext';
import { getKrr } from 'pages/api/oppslag/krr';

interface PageProps {
  søker: SokerOppslagState;
  søknader: SøknadApiType[];
  kontaktinformasjon: KontaktInfoView;
}

const KvitteringPage = ({ søker, søknader, kontaktinformasjon }: PageProps) => {
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
    <SoknadContextProvider>
      <PageHeader align="center" className={classes?.pageHeader}>
        <FormattedMessage id={'søknad.pagetitle'} values={{ wbr: () => <>&shy;</> }} />
      </PageHeader>
      <Kvittering søker={soker} kontaktinformasjon={kontaktinformasjon} søknad={søknader[0]} />
    </SoknadContextProvider>
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({
      path: '/kvittering',
    });
    const bearerToken = getAccessToken(ctx);
    const søknader = await getSøknader(bearerToken);
    const søker = await getSøker(bearerToken);
    const kontaktinformasjon = await getKrr(bearerToken);

    logger.info(`søkeroppslag fra API: ${JSON.stringify(søknader)}`);

    stopTimer();
    return {
      props: { søknader, søker, kontaktinformasjon },
    };
  },
);

export default KvitteringPage;
