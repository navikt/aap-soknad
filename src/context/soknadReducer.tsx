import { SoknadActionKeys, SoknadAction } from './soknadActions';
import { SoknadContextState } from './soknadContext';

const soknadReducer = (state: SoknadContextState, action: SoknadAction): SoknadContextState => {
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
    case SoknadActionKeys.UPDATE_SOKNAD:
      return {
        ...state,
        søknad: {
          ...state?.søknad,
          ...action.payload,
        },
      };
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
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};
export default soknadReducer;
