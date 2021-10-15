import React, { useState, useEffect } from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {
  Select,
  ConfirmationPanel,
  ErrorSummary,
  ErrorSummaryItem,
  Heading,
  Ingress,
  Button,
  Loader,
} from "@navikt/ds-react";
import { Controller, useForm, FieldErrors } from "react-hook-form";
import DatoVelger from "../components/datovelger";
import { vFirstDateIsAfterSecondDate } from "../utils/formValidation";

// Support norwegian & english languages.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/nb.json"));

type FormValues = {
  country: string;
  fromDate: string;
  toDate: string;
  confirmationPanel: boolean;
};

const FormErrorSummary = ({ errors }: FieldErrors) => {
  const keyList = Object.keys(errors).filter((e) => e);
  if (keyList.length < 1) return null;
  return (
    <ErrorSummary>
      {keyList.map((key) => (
        <ErrorSummaryItem key={key} href={`#${key}`}>
          {
            // @ts-ignore
            errors[key]?.message
          }
        </ErrorSummaryItem>
      ))}
    </ErrorSummary>
  );
};

const Utland = (): JSX.Element => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<string[][]>([]);
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames("nb", {select: "official"}))
      setCountryList(list);
    }
    getCountries();
  }, [setCountryList])
  const {
    getValues,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      country: "none",
      fromDate: undefined,
      toDate: undefined,
      confirmationPanel: false,
    },
  });
  const onSubmit = async (data: FormValues) => {
    setIsWaiting(true);
    console.log(data);
    setTimeout(() => setIsWaiting(false), 3000);
  };

  return (
    <>
      <Heading size="2xlarge" level="1" spacing={true}>
        Søknad om å beholde arbeidsavklaringspenger under opphold i utlandet
      </Heading>
      <Ingress spacing={true}>
        Du må som hovedregel oppholde deg i Norge eller i et annet EU/EØS-land
        for å få AAP. Er du statsborger i et EU/EØS-land, må du søke om å motta
        AAP i en begrenset periode hvis du oppholder deg utenfor et EU/EØS-land.
        Du må sørge for at du kan gjennomføre den aktiviteten du har avtalt med
        NAV ved utenlandsopphold.
      </Ingress>
      <form onSubmit={handleSubmit( data => onSubmit(data))} className="soknad-utland-form">
        <Select
          label="Landet du skal oppholde deg i"
          error={errors.country?.message}
          {...register("country", {
            required: "Venligst velg et land.",
            validate: (value) => value !== "none" || "Venligst velg et land.",
          })}
        >
          <option value="none">Velg land</option>
          { countryList.map(([key, val]) => <option value={key}>{val}</option>) }
        </Select>
        <Controller
          name="fromDate"
          control={control}
          rules={{
            required: "Venligst velg en dato",
          }}
          render={({ field: { name, value, onChange } }) => (
            <DatoVelger
              id={name}
              name={name}
              label="Fra dato"
              value={value}
              onChange={onChange}
              error={errors.fromDate?.message}
            />
          )}
        />
        <Controller
          name="toDate"
          control={control}
          rules={{
            required: "Venligst velg en dato",
            validate: () =>
              vFirstDateIsAfterSecondDate(
                getValues("toDate"),
                getValues("fromDate")
              ),
          }}
          render={({ field: { name, value, onChange } }) => (
            <DatoVelger
              id={name}
              name={name}
              label="Til dato"
              value={value}
              onChange={onChange}
              error={errors.toDate?.message}
            />
          )}
        />
        <Controller
          name="confirmationPanel"
          control={control}
          rules={{
            required: "Kryss av for å bekrefte",
          }}
          render={({ field: { name, value, onChange } }) => (
            <ConfirmationPanel
              id={name}
              name={name}
              label="Jeg bekrefter at utenlandsoppholdet ikke er til hinder for avtalt aktivitet som behandling, arbeidsrettede tiltak eller oppfølging fra NAV."
              checked={value}
              onChange={onChange}
              error={errors.confirmationPanel?.message}
            />
          )}
        />
        <FormErrorSummary errors={errors} />
        <Button variant="primary" type="submit">
          Send inn
          {isWaiting ? <Loader /> : null}
        </Button>
      </form>
    </>
  );
};

export default Utland;
