import { migrateStepList } from './migrateStepList';
import { StepType } from '../../components/StepWizard/Step';
import { StepNames } from '../../pages';

describe('migrateStepList', () => {
  it('steg for tillegsopplysninger finnes ikke i steplist', () => {
    const stepList = [{ stepIndex: 1, name: 'STARTDATO', active: true }];

    expect(migrateStepList(stepList)).toEqual(stepList);
  });

  it('steg for tillegsopplysninger finnes, men ikke aktivt', () => {
    const stepList = [
      { stepIndex: 1, name: 'STARTDATO', active: true },
      { stepIndex: 2, name: 'TILLEGGSOPPLYSNINGER' },
      { stepIndex: 8, name: 'YRKESSKADE' },
    ];

    expect(
      migrateStepList(stepList).find((steg: StepType) => steg.name === 'TILLEGGSOPPLYSNINGER')
    ).toBeUndefined();

    expect(
      migrateStepList(stepList).find((steg: StepType) => steg.name === 'YRKESSKADE')?.stepIndex == 2
    ).toBe(true);
  });

  it('steg for tillegsopplysninger finnes og er aktivt', () => {
    const stepList = [
      { stepIndex: 1, name: 'STARTDATO' },
      { stepIndex: 8, name: 'TILLEGGSOPPLYSNINGER', active: true },
    ];

    expect(
      migrateStepList(stepList).find((steg: StepType) => steg.name === 'TILLEGGSOPPLYSNINGER')
    ).toBeUndefined();

    expect(
      migrateStepList(stepList).find((steg: StepType) => steg.name === 'STARTDATO')?.active
    ).toBe(true);
  });
});
