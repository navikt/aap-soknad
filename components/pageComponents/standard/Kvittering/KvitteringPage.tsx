'use client';

import PageHeader from 'components/PageHeader';
import Kvittering from 'components/pageComponents/standard/Kvittering/Kvittering';
import * as classes from 'components/pageComponents/standard/standard.module.css';
import { useTranslations } from 'next-intl';
import { SoknadContextProvider } from 'context/soknadcontext/soknadContext';
import { KrrKontaktInfo } from 'app/api/oppslag/krr/route';
import { Person } from 'app/api/oppslagapi/person/route';

interface Props {
  person: Person;
  kontaktinformasjon?: KrrKontaktInfo | null;
}

export function KvitteringPage({ person, kontaktinformasjon }: Props) {
  const t = useTranslations();
  return (
    <SoknadContextProvider>
      <PageHeader align="center" className={classes?.pageHeader}>
        {t.rich('søknad.pagetitle', { wbr: () => <>&shy;</> })}
      </PageHeader>
      <Kvittering person={person} kontaktinformasjon={kontaktinformasjon ?? undefined} />
    </SoknadContextProvider>
  );
}
