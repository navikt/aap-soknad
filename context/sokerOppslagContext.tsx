import React, { createContext, Dispatch, ReactNode, useReducer, useContext, useMemo } from 'react';
import { formatNavn, formatFullAdresse } from 'utils/StringFormatters';

interface DispatchSokerOppslagAction {
  payload?: any;
  error?: any;
  type: 'SET_SOKER_OPPSLAG';
}

/** @deprecated Backend sender fult navn som string */
export type Navn = {
  fornavn: string;
  mellomnavn: string;
  etternavn: string;
};

export type Adresse = {
  adressenavn?: string;
  husbokstav?: string;
  husnummer?: string;
  postnummer?: {
    postnr?: string;
    poststed?: string;
  };
};

export type OppslagBarn = {
  navn: Navn;
  fødselsdato: string;
  fnr: string;
};
export interface OppslagBehandler {
  type: 'FASTLEGE' | 'SYKMELDER';
  navn: Navn;
  kategori: 'LEGE' | 'FYSIOTERAPEUT' | 'KIROPRAKTOR' | 'MANUELLTERAPEUT' | 'TANNLEGE';
  kontaktinformasjon: {
    behandlerRef: string;
    kontor: string;
    orgnummer: string;
    telefon: string;
    adresse: Adresse;
  };
}
export type Soker = {
  navn: Navn;
  fødseldato: string;
  barn: Array<OppslagBarn>;
};

export type SøkerView = {
  fulltNavn?: string;
  fullAdresse?: string;
  fødselsnummer?: string;
};
export type KontaktInfoView = {
  epost?: string;
  mobil?: string;
};
export type SokerOppslagState = {
  søker: Soker;
  behandlere: Array<OppslagBehandler>;
  kontaktinformasjon?: KontaktInfoView;
};
const søkerOppslagInitialValue = {
  barn: [],
};
type SokerOppslagContextState = {
  oppslagDispatch: Dispatch<DispatchSokerOppslagAction>;
  søker: SøkerView;
  kontaktInfo?: KontaktInfoView;
};
const SokerOppslagContext = createContext<SokerOppslagContextState | undefined>(undefined);

function stateReducer(state: SokerOppslagState, action: DispatchSokerOppslagAction) {
  switch (action.type) {
    case 'SET_SOKER_OPPSLAG': {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
interface Props {
  children: ReactNode;
}
function SokerOppslagProvider({ children }: Props) {
  const [state, dispatch] = useReducer(stateReducer, søkerOppslagInitialValue);
  const søker: SøkerView | undefined = useMemo(
    () => ({
      fulltNavn: formatNavn(state?.søker?.navn),
      fullAdresse: state?.søker?.adresse ? formatFullAdresse(state?.søker?.adresse) : '',
      fødselsnummer: state?.søker?.fødselsnummer,
    }),
    [state],
  );
  const kontaktInfo: KontaktInfoView | undefined = useMemo(
    () => ({
      epost: state?.kontaktinformasjon?.epost,
      mobil: state?.kontaktinformasjon?.mobil,
    }),
    [state],
  );
  const contextValue = useMemo(() => {
    return {
      oppslagDispatch: dispatch,
      søker,
      kontaktInfo,
    };
  }, [state, dispatch]);
  return (
    <SokerOppslagContext.Provider value={contextValue}>{children}</SokerOppslagContext.Provider>
  );
}

export const setSokerOppslagFraProps = (
  oppslag: SokerOppslagState,
  dispatch: Dispatch<DispatchSokerOppslagAction>,
) => {
  dispatch({
    type: 'SET_SOKER_OPPSLAG',
    payload: oppslag,
  });
  return oppslag;
};

function useSokerOppslag() {
  const context = useContext(SokerOppslagContext);
  if (context === undefined) {
    throw new Error('useRegisterOppslag must be used within a RegisterOppslagProvider');
  }
  return context;
}

export { SokerOppslagProvider, useSokerOppslag };
