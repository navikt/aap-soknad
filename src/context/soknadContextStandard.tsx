import React, { createContext, Dispatch, useContext, useMemo, useReducer } from 'react';
import { GenericSoknadContextState, SøknadType } from '../types/SoknadContext';
import {
  soknadContextInititalState,
  SoknadAction,
  SoknadContextData,
  ProviderProps,
  SoknadActionKeys,
} from './soknadContextCommon';
import Soknad, { Vedlegg } from '../types/Soknad';
import { OppslagBarn } from './sokerOppslagContext';

const soknadContextInititalStateStandard = {
  ...soknadContextInititalState,
  type: SøknadType.STANDARD,
};

function soknadReducerStandard(
  state: GenericSoknadContextState<Soknad>,
  action: SoknadAction<Soknad>
): GenericSoknadContextState<Soknad> {
  console.log('soknadReducer', action.type, action.payload);
  switch (action.type) {
    case SoknadActionKeys.SET_STATE_FROM_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    case SoknadActionKeys.SET_SOKNAD_TYPE:
      return {
        ...state,
        type: action.payload,
      };
    case SoknadActionKeys.SET_SOKNAD:
      return {
        ...state,
        søknad: action.payload,
      };
    case SoknadActionKeys.UPDATE_SOKNAD: {
      const manuelleBarn = state?.søknad?.manuelleBarn || [];
      return {
        ...state,
        søknad: {
          ...state?.søknad,
          ...action.payload,
          ...(action?.payload?.manuelleBarn && manuelleBarn.length > 0
            ? {
                manuelleBarn: manuelleBarn.map((e, i) => ({
                  ...e,
                  ...action?.payload?.manuelleBarn?.[i],
                })),
              }
            : {}),
        },
      };
    }
    case SoknadActionKeys.ADD_BARN_IF_MISSING: {
      const barn = state?.søknad?.barnetillegg || [];
      const newBarn = action.payload?.filter((e: any) => !barn.find((a: any) => a?.fnr === e?.fnr));
      return {
        ...state,
        søknad: {
          ...state.søknad,
          barnetillegg: [...barn, ...newBarn],
        },
      };
    }
    case SoknadActionKeys.ADD_VEDLEGG: {
      const vedleggList =
        action?.payload?.filter(
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
    case SoknadActionKeys.REMOVE_VEDLEGG: {
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
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
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
    throw new Error('useSoknadContextUtland must be used within a SoknadContextProviderUtland');
  }
  return context;
};

export const addBarnIfMissing = (dispatch: Dispatch<SoknadAction<Soknad>>, data: OppslagBarn[]) => {
  dispatch({ type: SoknadActionKeys.ADD_BARN_IF_MISSING, payload: data });
};

export const getVedleggUuidsFromSoknad = (søknad?: Soknad) => {
  const vedlegg = søknad?.vedlegg;
  console.log('vedlegg', vedlegg);
  return Object.values(vedlegg ?? {})
    .reduce((acc: Vedlegg[], v: Vedlegg[]) => {
      return acc.concat(v);
    }, [])
    .map((v) => v.vedleggId);
};

export const deleteOpplastedeVedlegg = async (søknad?: Soknad) => {
  const vedleggUuids = getVedleggUuidsFromSoknad(søknad);
  console.log('vedleggUuids', vedleggUuids);
  if (vedleggUuids.length > 0) {
    const commaSeparatedUuids = vedleggUuids.join(',');
    console.log('fetch delete');
    await fetch(`${process.env.NEXT_PUBLIC_TEMP_FILOPPLASTING_SLETT_URL}${commaSeparatedUuids}`, {
      method: 'DELETE',
    });
  }
};
