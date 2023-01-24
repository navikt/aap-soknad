import React, { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from 'react';
import { StepType } from 'components/StepWizard/Step';
import { veiledningSteg } from 'pages';

interface DispatchStepWizardAction {
  payload?: any;
  error?: any;
  type:
    | 'SET_STEP_LIST'
    | 'SET_ACTIVE_STEP'
    | 'COMPLETE_AND_GOTO_NEXT_STEP'
    | 'RESET_STEP_WIZARD'
    | 'GOTO_NAMED_STEP'
    | 'ADD_VEILEDNING_STEP'
    | 'GOTO_PREVIOUS_STEP';
}
type StepWizardState = {
  stepList: Array<StepType>;
};
export type StepWizardContextState = {
  stepList: Array<StepType>;
  currentStepIndex: number;
  currentStep: StepType;
  stepWizardDispatch: Dispatch<DispatchStepWizardAction>;
};
export const StepWizardContext = createContext<StepWizardContextState | undefined>(undefined);

function stateReducer(state: StepWizardState, action: DispatchStepWizardAction) {
  switch (action.type) {
    case 'SET_STEP_LIST': {
      return {
        ...state,
        stepList: [...action.payload],
      };
    }
    case 'SET_ACTIVE_STEP': {
      let newStepList = state.stepList.map((e) => ({ ...e, active: false }));
      const index = action.payload;
      return {
        ...state,
        stepList: [
          ...newStepList.slice(0, index),
          { ...newStepList[index], active: true },
          ...newStepList.slice(index + 1),
        ],
      };
    }
    case 'COMPLETE_AND_GOTO_NEXT_STEP': {
      const currentStepIndex = state.stepList.findIndex((e) => e.active);
      const nextStepIndex = currentStepIndex + 1;
      let newStepList = state.stepList.map((step, index) => ({
        ...step,
        ...(index === currentStepIndex ? { completed: true } : {}),
        active: index === nextStepIndex,
      }));
      return {
        ...state,
        stepList: newStepList,
      };
    }
    case 'RESET_STEP_WIZARD': {
      let newStepList = state.stepList.map((e) => ({ ...e, completed: false }));
      return {
        ...state,
        stepList: [{ ...newStepList[0], active: true }, ...newStepList.slice(1)],
      };
    }
    case 'GOTO_PREVIOUS_STEP': {
      const currentStepIndex = state.stepList.findIndex((e) => e.active);
      const prevIndex = currentStepIndex - 1;
      const newStepList = state.stepList.map((step, index) => ({
        ...step,
        active: index === prevIndex,
      }));
      return {
        ...state,
        stepList: newStepList,
      };
    }
    case 'GOTO_NAMED_STEP': {
      const stepIndex = state.stepList.findIndex((e) => e.name === action.payload);
      const newStepList = state.stepList.map((step, index) => ({
        ...step,
        active: index === stepIndex,
      }));
      return {
        ...state,
        stepList: newStepList,
      };
    }
    case 'ADD_VEILEDNING_STEP': {
      const newStepList = [veiledningSteg, ...state.stepList];
      return {
        ...state,
        stepList: newStepList,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
interface Props {
  children: ReactNode;
}
export const StepWizardProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(stateReducer, { stepList: [] });
  const currentStepIndex = useMemo(() => state.stepList.findIndex((step) => step.active), [state]);
  const currentStep = useMemo(() => state.stepList.find((step) => step.active), [state]);

  const contextValue = useMemo(() => {
    return {
      stepList: state.stepList,
      currentStepIndex,
      currentStep,
      stepWizardDispatch: dispatch,
    };
  }, [state, dispatch]);
  return <StepWizardContext.Provider value={contextValue}>{children}</StepWizardContext.Provider>;
};
export const useStepWizard = () => {
  const context = useContext(StepWizardContext);
  if (context === undefined) {
    throw new Error('useStepWizard must be used within a StepWizardProvider');
  }
  return context;
};

export const setStepList = async (
  stepList: StepType[],
  dispatch: Dispatch<DispatchStepWizardAction>
) => {
  dispatch({ type: 'SET_STEP_LIST', payload: stepList });
};
export const setCurrentStepIndex = async (
  index: number,
  dispatch: Dispatch<DispatchStepWizardAction>
) => {
  dispatch({ type: 'SET_ACTIVE_STEP', payload: index });
};
export const completeAndGoToNextStep = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'COMPLETE_AND_GOTO_NEXT_STEP' });
};
export const goToPreviousStep = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'GOTO_PREVIOUS_STEP' });
};
export const goToNamedStep = async (dispatch: Dispatch<DispatchStepWizardAction>, name: string) => {
  dispatch({ type: 'GOTO_NAMED_STEP', payload: name });
};
export const resetStepWizard = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'RESET_STEP_WIZARD' });
};
export const addVeiledningSteg = async (dispatch: Dispatch<DispatchStepWizardAction>) => {
  dispatch({ type: 'ADD_VEILEDNING_STEP' });
};
