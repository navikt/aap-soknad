import React, { createContext, Dispatch, ReactNode, useReducer, useContext, useMemo } from 'react';

interface DispatchSokerOppslagAction {
  payload?: any;
  error?: any;
  type: 'SET_SOKER_OPPSLAG';
}
type Navn = {
  fornavn: string;
  mellomnavn: string;
  etternavn: string;
};
type Barn = {
  navn: Navn;
  fødselsdato: string;
};
export type Soker = {
  navn: Navn;
  fødseldato: string;
  barn: Array<Barn>;
};
type Fastlege = {
  navn: Navn;
};
export type FastlegeView = {
  fulltNavn: string;
  legekontor: string;
  adresse: string;
  telefon: string;
};
export type SokerOppslagState = {
  søker: Soker;
  fastlege: Fastlege;
};
const søkerOppslagInitialValue = {
  barn: [],
};
type SokerOppslagContextState = {
  oppslagState: SokerOppslagState;
  oppslagDispatch: Dispatch<DispatchSokerOppslagAction>;
  søkerFulltNavn: string;
  adresseFull: string;
  personident: string;
  fastlege: FastlegeView;
};
const SokerOppslagContext = createContext<SokerOppslagContextState | undefined>(undefined);

function stateReducer(state: SokerOppslagState, action: DispatchSokerOppslagAction) {
  console.log(action.type, action.payload);
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
  const getFulltNavn = (navn: Navn) =>
    `${navn?.fornavn}${navn?.mellomnavn ? ` ${navn?.mellomnavn}` : ''} ${navn?.etternavn}`;
  const getAddressDescription = (kontaktInfo: any) =>
    `${kontaktInfo?.adresse}, ${kontaktInfo?.postnr} ${kontaktInfo?.poststed}`;
  const [state, dispatch] = useReducer(stateReducer, søkerOppslagInitialValue);
  const søkerFulltNavn = useMemo(() => getFulltNavn(state?.søker?.navn), [state]);
  const adresseFull = useMemo(() => 'Veiveien 4, 0659 Huttiheita', [state]);
  const personident = useMemo(() => '10029045645', [state]);
  const fastlege: FastlegeView = useMemo(
    () => ({
      fulltNavn: getFulltNavn(state?.behandler?.navn),
      legekontor: state?.behandler?.kontaktinformasjon?.kontor,
      adresse: getAddressDescription(state?.behandler?.kontaktinformasjon),
      telefon: state?.behandler?.kontaktinformasjon?.telefon,
    }),
    [state]
  );
  const contextValue = useMemo(() => {
    return {
      oppslagState: state,
      oppslagDispatch: dispatch,
      søkerFulltNavn,
      adresseFull,
      personident,
      fastlege,
    };
  }, [state, dispatch]);
  return (
    <SokerOppslagContext.Provider value={contextValue}>{children}</SokerOppslagContext.Provider>
  );
}

export const hentSokerOppslag = async (dispatch: Dispatch<DispatchSokerOppslagAction>) => {
  const oppslag: SokerOppslagState = await fetch('/aap/soknad-api/oppslag/soeker').then((res) =>
    res.json()
  );
  oppslag && dispatch({ type: 'SET_SOKER_OPPSLAG', payload: oppslag });
};

function useSokerOppslag() {
  const context = useContext(SokerOppslagContext);
  if (context === undefined) {
    throw new Error('useRegisterOppslag must be used within a RegisterOppslagProvider');
  }
  return context;
}

export { SokerOppslagProvider, useSokerOppslag };
