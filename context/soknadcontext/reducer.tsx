import { RegistrertBehandler } from '../../types/Soknad';
import structuredClone from '@ungap/structured-clone';
import { SoknadContextState } from './soknadContext';
import { SoknadAction, SoknadActionKeys } from './actions';

export function soknadReducer(state: SoknadContextState, action: SoknadAction): SoknadContextState {
  switch (action.type) {
    case SoknadActionKeys.SET_STATE_FROM_CACHE:
      return {
        ...state,
        ...structuredClone(action.payload),
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
            (e) => e?.behandlerRef === behandler?.behandlerRef
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

      const updatedRequiredVedlegg = state.requiredVedlegg.map((vedlegg) => {
        if (vedlegg.type === action.key) {
          return { ...vedlegg, completed: filesToAdd.length > 0 };
        } else {
          return vedlegg;
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
      const filesUtenSlettetVedlegg = state?.søknad?.vedlegg?.[action.key]?.filter(
        (e) => e.vedleggId !== action.payload.vedleggId
      );

      const updatedRequiredVedlegg = state.requiredVedlegg.map((vedleg) => {
        if (vedleg.type === action.key) {
          return {
            ...vedleg,
            completed: filesUtenSlettetVedlegg && filesUtenSlettetVedlegg.length > 0,
          };
        } else {
          return vedleg;
        }
      });

      return {
        ...state,
        requiredVedlegg: updatedRequiredVedlegg,
        søknad: {
          ...state.søknad,
          vedlegg: { ...state.søknad?.vedlegg, [action.key]: filesUtenSlettetVedlegg || [] },
        },
      };
    }
  }
}
