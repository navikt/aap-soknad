import { BodyShort, GuidePanel} from "@navikt/ds-react";
import countries from "i18n-iso-countries";
import { StepWizard, Step } from '../../components/StepWizard';
import React, {useContext, useEffect, useMemo, useState} from "react";
import ControlDatoVelger from "../../components/input/ControlDatoVelger";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {getUtlandSchemas} from "../../schemas/utland";
import useTexts from "../../hooks/useTexts";
import {useSoknadContext} from "../../hooks/useSoknadContext";
import {SøknadType} from "../../context/soknadContext";
import ControlSelect from "../../components/input/ControlSelect";
import {StepWizardContext} from "../../context/stepWizardContext";
import SoknadForm from "../../types/SoknadForm";
// Support norwegian & english languages.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/nb.json"));


const UtlandNew = (): JSX.Element => {
  const { state } = useSoknadContext(SøknadType.UTLAND);
  const { currentStepIndex, goToNamedStep, goToNextStep } = useContext(StepWizardContext);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const { getText } = useTexts("utland");
  const SoknadUtlandSchemas = getUtlandSchemas(getText);
  const currentSchema = useMemo(() => {
    console.log('currentSchema', currentStepIndex, SoknadUtlandSchemas[currentStepIndex]);
    return SoknadUtlandSchemas[currentStepIndex];
  }, [currentStepIndex, SoknadUtlandSchemas]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(currentSchema),
    defaultValues: useMemo(() => state?.søknad, [state]),
  });
  useEffect(() => {
    if(state.currentStep && state.søknad) {
      reset({...state.søknad});
      goToNamedStep(state.currentStep as string);
    }
  }, [state, reset, goToNamedStep]);

  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(
        countries.getNames("nb", { select: "official" })
      );
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  const myHandleSubmit = (data: SoknadForm) => {
    goToNextStep();
  }
  return (
    <StepWizard
      onSubmit={handleSubmit(myHandleSubmit)}
    >
      <Step order={1} name='INTRODUCTION'>
        <BodyShort>{'intro'}</BodyShort>
      </Step>
      <Step order={2} name='SELECT_COUNTRY'>
        <GuidePanel poster>
          {getText('steps.country.guideText')}
        </GuidePanel>
        <ControlSelect
          name="country"
          label={getText('form.country.label')}
          control={control}
          error={errors.country?.message}
          >
          { countryList.map(([key, val]) => <option key={key} value={key}>{val}</option>) }
        </ControlSelect>
      </Step>
      <Step order={3} name='TRAVEL_PERIOD'>
        <ControlDatoVelger
          name="fromDate"
          label={getText('form.fromDate.label')}
          control={control}
          error={errors.fromDate?.message}
          />
        <ControlDatoVelger
          name="toDate"
          label={getText('form.toDate.label')}
          control={control}
          error={errors.toDate?.message}
          />
      </Step>
      <Step order={4} name='SUMMARY'>
        <BodyShort>{'Last Step'}</BodyShort>
      </Step>
    </StepWizard>
  );
};

export default UtlandNew;
