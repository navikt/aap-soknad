import { StønadType } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { Adresse } from 'context/sokerOppslagContext';

export interface SøknadBackendState {
  startDato: {
    beskrivelse?: string;
  };
  ferie: {
    ferieType?: 'PERIODE' | 'DAGER' | 'NEI' | 'VET_IKKE';
    periode?: {
      fom?: string;
      tom?: string;
    };
    dager?: number | string;
  };
  medlemsskap: {
    boddINorgeSammenhengendeSiste5?: boolean;
    jobbetUtenforNorgeFørSyk?: boolean;
    jobbetSammenhengendeINorgeSiste5?: boolean;
    iTilleggArbeidUtenforNorge?: boolean;
    utenlandsopphold: {
      land?: string;
      periode: { fom?: string; tom?: string };
      arbeidet?: boolean;
      id?: string;
      landsNavn?: string;
    }[];
  };
  studier: {
    erStudent?: 'JA' | 'NEI' | 'AVBRUTT';
    kommeTilbake?: 'JA' | 'NEI' | 'VET_IKKE';
    vedlegg?: Array<string>;
  };
  andreBehandlere: Array<BehandlerBackendState>;
  yrkesskadeType?: 'JA' | 'NEI' | 'VET_IKKE';
  utbetalinger: {
    fraArbeidsgiver?: boolean;
    andreStønader: Array<{ type: StønadType; hvemUtbetalerAFP?: string; vedlegg?: Array<string> }>;
  };
  registrerteBarn: Array<{
    merEnnIG?: boolean;
    barnepensjon?: boolean;
  }>;
  andreBarn: Array<{
    barn: {
      fødseldato?: string;
      navn: {
        fornavn?: string;
        mellomnavn?: string;
        etternavn?: string;
      };
    };
    relasjon: 'FORELDER' | 'FOSTERFORELDER';
    merEnnIG?: boolean;
    barnepensjon?: boolean;
  }>;
  tilleggsopplysninger?: string;
}

export interface BehandlerBackendState {
  type: 'FASTLEGE' | 'SYKMELDER';
  navn: { fornavn?: string; mellomnavn?: string; etternavn?: string };
  kategori?: 'LEGE' | 'FYSIOTERAPEUT' | 'KIROPRAKTOR' | 'MANUELLTERAPEUT' | 'TANNLEGE';
  kontaktinformasjon: {
    behandlerRef?: string;
    kontor?: string;
    orgnummer?: string;
    adresse?: Adresse;
    telefon?: string;
  };
  erRegistrertFastlegeRiktig?: boolean;
}
