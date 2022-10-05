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
    const søknadData = await fetchPOST('/aap/soknad/api/innsending/soknad', {
      medlemsskap: {
        boddINorgeSammenhengendeSiste5: true,
        utenlandsopphold: [
          {
            land: 'DZ:blabla',
            periode: {
              fom: '1990-02-10',
              tom: '2008-02-10',
            },
          },
        ],
      },
      studier: {
        erStudent: 'NEI',
        vedlegg: [],
      },
      registrerteBehandlere: [
        {
          type: 'FASTLEGE',
          navn: {
            fornavn: 'Nina Unni',
            etternavn: 'Borge',
          },
          kategori: 'LEGE',
          kontaktinformasjon: {
            behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
            kontor: 'ASKØY KOMMUNE SAMFUNNSMEDISINSK AVD ALMENNLEGETJENESTEN',
            orgnummer: '976673867',
            adresse: {
              adressenavn: 'Kleppeveien',
              husnummer: '17',
              postnummer: {
                postnr: '5300',
                poststed: 'KLEPPESTØ',
              },
            },
            telefon: '56 15 83 10',
          },
        },
      ],
      andreBehandlere: [],
      yrkesskadeType: 'JA',
      utbetalinger: {
        ekstraFraArbeidsgiver: {
          fraArbeidsgiver: false,
          vedlegg: [],
        },
        andreStønader: [
          {
            type: 'NEI',
          },
        ],
      },
      registrerteBarn: [
        {
          merEnnIG: false,
        },
        {
          merEnnIG: false,
        },
      ],
      andreBarn: [],
      vedlegg: [],
    });
    console.log('søknadData', søknadData);
  };
  return (
    <SoknadContextProviderStandard>
      <PageHeader align="center" className={classes?.pageHeader}>
        {'Testside'}
      </PageHeader>
      <Button onClick={onButtonClick} type={'button'} variant={'primary'}>
        Test
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
