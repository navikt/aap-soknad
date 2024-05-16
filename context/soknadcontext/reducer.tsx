import { RegistrertFastlege } from 'types/Soknad';
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
      return {
        ...state,
        søknad: {
          ...state.søknad,
          barn: structuredClone(action.payload),
        },
      };
    }
    case SoknadActionKeys.ADD_FASTLEGE_IF_MISSING: {
      const oldRegistrertFastlege = state?.søknad?.fastlege || [];
      const registrerteFastleger: RegistrertFastlege[] = structuredClone(action.payload).map(
        (fastlege) => {
          const eksisterende = oldRegistrertFastlege.find(
            (e) => e?.behandlerRef === fastlege?.behandlerRef,
          );
          return eksisterende?.erRegistrertFastlegeRiktig
            ? { ...fastlege, erRegistrertFastlegeRiktig: eksisterende.erRegistrertFastlegeRiktig }
            : fastlege;
        },
      );
      return {
        ...state,
        søknad: {
          ...state.søknad,
          fastlege: registrerteFastleger,
        },
      };
    }
    case SoknadActionKeys.ADD_REQUIRED_VEDLEGG: {
      const vedleggList =
        structuredClone(action?.payload)?.filter(
          (vedlegg) =>
            !state?.requiredVedlegg?.find((e) => {
              return e?.type === vedlegg?.type;
            }),
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
        (e) => e.vedleggId !== action.payload.vedleggId,
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
