import { SoknadActionKeys, SoknadAction } from './soknadActions';
import { SoknadContextState} from "./soknadContext";

const soknadReducer = (
  state: SoknadContextState,
  action: SoknadAction
): SoknadContextState => {
  console.log('soknadReducer', action.type, action.payload)
  switch (action.type) {
    case SoknadActionKeys.SET_SOKNAD:
      return {
        ...state,
        søknad: action.payload
      };
  }
}
export default soknadReducer;
