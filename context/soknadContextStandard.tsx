import React, { createContext, Dispatch, useContext, useMemo, useReducer } from 'react';
import structuredClone from '@ungap/structured-clone';
import { GenericSoknadContextState, SøknadType } from 'types/SoknadContext';
import {
  ProviderProps,
  SoknadAction,
  SoknadActionKeys,
  SoknadContextData,
  soknadContextInititalState,
} from './soknadContextCommon';
import { RegistrertBehandler, Soknad } from 'types/Soknad';
import { OppslagBarn, OppslagBehandler } from './sokerOppslagContext';

export const soknadContextInititalStateStandard = {
  ...soknadContextInititalState,
  type: SøknadType.STANDARD,
};
export function soknadReducerStandard(
  state: GenericSoknadContextState<Soknad>,
  action: SoknadAction<Soknad>
): GenericSoknadContextState<Soknad> {
  switch (action.type) {
    case SoknadActionKeys.SET_STATE_FROM_CACHE:
      return {
        ...state,
        ...structuredClone(action.payload),
      };
    case SoknadActionKeys.SET_SOKNAD_TYPE:
      return {
        ...state,
        type: structuredClone(action.payload),
      };
    case SoknadActionKeys.SET_SOKNAD:
      return {
        ...state,
        søknad: structuredClone(action.payload),
      };
    case SoknadActionKeys.UPDATE_SOKNAD: {
      return {
        ...state,
        søknad: {
          ...state?.søknad,
          ...structuredClone(action.payload),
        },
      };
    }
    case SoknadActionKeys.ADD_BARN_IF_MISSING: {
      const barn = state?.søknad?.barn || [];
      const newBarn = structuredClone(action.payload)?.filter(
        (e: any) => !barn.find((a: any) => a?.fnr === e?.fnr)
      );
      return {
        ...state,
        søknad: {
          ...state.søknad,
          barn: [...barn, ...newBarn],
        },
      };
    }
    case SoknadActionKeys.ADD_BEHANDLER_IF_MISSING: {
      const oldRegistrerteBehandlere = state?.søknad?.registrerteBehandlere || [];
      const registrerteBehandlere: RegistrertBehandler[] = structuredClone(action.payload)
        .filter((behandler) => behandler.type === 'FASTLEGE')
        .map((behandler) => {
          const eksisterende = oldRegistrerteBehandlere.find(
            (e) =>
              e?.kontaktinformasjon?.behandlerRef === behandler?.kontaktinformasjon?.behandlerRef
          );
          return eksisterende?.erRegistrertFastlegeRiktig
            ? { ...behandler, erRegistrertFastlegeRiktig: eksisterende.erRegistrertFastlegeRiktig }
            : behandler;
        });
      return {
        ...state,
        søknad: {
          ...state.søknad,
          registrerteBehandlere: registrerteBehandlere,
        },
      };
    }
    case SoknadActionKeys.ADD_REQUIRED_VEDLEGG: {
      const vedleggList =
        structuredClone(action?.payload)?.filter(
          (vedlegg) =>
            !state?.requiredVedlegg?.find((e) => {
              return e?.type === vedlegg?.type;
            })
        ) || [];
      return {
        ...state,
        requiredVedlegg: [...state?.requiredVedlegg, ...vedleggList],
      };
    }
    case SoknadActionKeys.REMOVE_REQUIRED_VEDLEGG: {
      const newVedleggList = state?.requiredVedlegg?.filter((e) => {
        return !(e?.type === action?.payload);
      });
      return {
        ...state,
        requiredVedlegg: [...newVedleggList],
      };
    }
    case SoknadActionKeys.ADD_SØKNAD_URL: {
      return {
        ...state,
        søknadUrl: action?.payload,
      };
    }

    case SoknadActionKeys.ADD_VEDLEGG: {
      const filesToAdd = [...(state.søknad?.vedlegg?.[action.key] || []), ...action.payload];

      const updatedRequiredVedlegg = state.requiredVedlegg.map((vedleg) => {
        if (vedleg.type === action.key) {
          return { ...vedleg, completed: filesToAdd.length > 0 };
        } else {
          return vedleg;
        }
      });

      return {
        ...state,
        requiredVedlegg: updatedRequiredVedlegg,
        søknad: {
          ...state.søknad,
          vedlegg: { ...state.søknad?.vedlegg, [action.key]: filesToAdd || [] },
        },
      };
    }

    case SoknadActionKeys.DELETE_VEDLEGG: {
      const FilesUtenSpesifikkVedlegg = state?.søknad?.vedlegg?.[action.key]?.filter(
        (e) => e.vedleggId !== action.payload.vedleggId
      );

      return {
        ...state,
        søknad: {
          ...state.søknad,
          vedlegg: { ...state.søknad?.vedlegg, [action.key]: FilesUtenSpesifikkVedlegg || [] },
        },
      };
    }
  }
}

export const SoknadContextStandard = createContext<SoknadContextData<Soknad> | undefined>(
  undefined
);

export const SoknadContextProviderStandard = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(soknadReducerStandard, soknadContextInititalStateStandard);

  const contextValue: SoknadContextData<Soknad> = useMemo(() => {
    return { søknadState: state, søknadDispatch: dispatch };
  }, [state, dispatch]);

  return (
    <SoknadContextStandard.Provider value={contextValue}>{children}</SoknadContextStandard.Provider>
  );
};

export const useSoknadContextStandard = () => {
  const context = useContext(SoknadContextStandard);
  if (context === undefined) {
    throw new Error('useSoknadContextStandard must be used within a SoknadContextProviderStandard');
  }
  return context;
};

export const addBarnIfMissing = (dispatch: Dispatch<SoknadAction<Soknad>>, data: OppslagBarn[]) => {
  dispatch({ type: SoknadActionKeys.ADD_BARN_IF_MISSING, payload: data });
};

export const addBehandlerIfMissing = (
  dispatch: Dispatch<SoknadAction<Soknad>>,
  data: OppslagBehandler[]
) => {
  dispatch({ type: SoknadActionKeys.ADD_BEHANDLER_IF_MISSING, payload: data });
};

export const getVedleggUuidsFromSoknad = (søknad?: Soknad) => {
  const vedlegg = søknad?.vedlegg;
  return Object.values(vedlegg || {})
    .flat()
    .map((vedlegg) => vedlegg?.vedleggId);
};

export const deleteOpplastedeVedlegg = async (søknad?: Soknad) => {
  const vedleggUuids = getVedleggUuidsFromSoknad(søknad);
  if (vedleggUuids.length > 0) {
    const commaSeparatedUuids = vedleggUuids.join(',');
    await fetch(`/aap/soknad/api/vedlegg/slett/?uuids=${commaSeparatedUuids}`, {
      method: 'DELETE',
    });
  }
};
