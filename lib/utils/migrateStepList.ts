import { StepType } from '../../components/StepWizard/Step';

export const migrateStepList = (stepList: Array<StepType>) => {
  const nyStepListRiktigIndex = stepList.map((steg: StepType, index) => {
    return { ...steg, stepIndex: index + 1 };
  });

  const tillegsopplysningerSteg = nyStepListRiktigIndex.find(
    (steg: StepType) => steg.name === 'TILLEGGSOPPLYSNINGER'
  );

  const nyStepList = nyStepListRiktigIndex
    .filter((steg: StepType) => steg.name != 'TILLEGGSOPPLYSNINGER')
    .map((steg: StepType, index) => {
      const stepIndex = tillegsopplysningerSteg?.stepIndex ?? 0;
      if (index == stepIndex - 2) {
        return {
          ...steg,
          stepIndex: index + 1,
          active: true,
        };
      }
      return {
        ...steg,
        stepIndex: index + 1,
      };
    });

  return nyStepList;
};
