import PageHeader from 'components/PageHeader';
import React, { useEffect, useState } from 'react';
import Kvittering from 'components/pageComponents/standard/Kvittering/Kvittering';
import * as classes from 'components/pageComponents/standard/standard.module.css';
import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from 'auth/accessToken';
import metrics from 'utils/metrics';
import { FormattedMessage } from 'react-intl';
import { SoknadContextProvider } from 'context/soknadcontext/soknadContext';
import { getKrr, KrrKontaktInfo } from 'pages/api/oppslag/krr';
import { getPerson, Person } from 'pages/api/oppslagapi/person';

interface PageProps {
  person: Person;
  kontaktinformasjon: KrrKontaktInfo;
}

const KvitteringPage = ({ person, kontaktinformasjon }: PageProps) => {
  const [soker, setSoker] = useState({});

  return (
    <SoknadContextProvider>
      <PageHeader align="center" className={classes?.pageHeader}>
        <FormattedMessage id={'søknad.pagetitle'} values={{ wbr: () => <>&shy;</> }} />
      </PageHeader>
      <Kvittering person={person} kontaktinformasjon={kontaktinformasjon} />
    </SoknadContextProvider>
  );
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({
      path: '/kvittering',
    });
    const bearerToken = getAccessToken(ctx);
    const person = await getPerson(ctx.req);
    const kontaktinformasjon = await getKrr(bearerToken);

    stopTimer();
    return {
      props: { person, kontaktinformasjon },
    };
  },
);

export default KvitteringPage;
