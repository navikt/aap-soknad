import { Control, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import React, { useEffect, useMemo } from 'react';
import DatoVelgerWrapper from '../../components/input/DatoVelgerWrapper';
import {
  Grid,
  BodyLong,
  GuidePanel,
  Heading,
  Radio,
  ReadMore,
  BodyShort,
  Cell,
  Alert,
} from '@navikt/ds-react';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import { JaNeiVetIkke } from '../../types/Generic';
import TextFieldWrapper from '../../components/input/TextFieldWrapper';
import ColorPanel from '../../components/panel/ColorPanel';

const STARTDATO = 'startDato';
const FERIE = 'ferie';
interface Props {
  watch: UseFormWatch<FieldValues>;
  control: Control<SoknadStandard>;
  getText: GetText;
  errors: FieldErrors;
  setValue: any;
}

const StartDato = ({ getText, errors, watch, control, setValue }: Props) => {
  const getParagraphs = (path: string) => {
    const paragraphs = getText(path);
    return Array.isArray(paragraphs) ? paragraphs : [];
  };
  const skalHaFerie = watch(`${FERIE}.skalHaFerie.value`);
  const ferieType = watch(`${FERIE}.type.value`);
  const antallDager = watch(`${FERIE}.antallDager.value`);
  const FerieType = useMemo(
    () => ({
      PERIODE: getText(`form.${FERIE}.ferieType.periode`),
      DAGER: getText(`form.${FERIE}.ferieType.dager`),
    }),
    [getText]
  );
  useEffect(() => {
    setValue(`${STARTDATO}.label`, getText(`form.${STARTDATO}.label`));
    setValue(`${FERIE}.skalHaFerie.label`, getText('form.ferie.skalHaFerie.legend'));
  }, [getText]);
  useEffect(() => {
    setValue(`${FERIE}.type.value`, undefined);
    setValue(`${FERIE}.type.label`, undefined);
  }, [skalHaFerie]);
  useEffect(() => {
    setValue(`${FERIE}.type.label`, getText('form.ferie.ferieType.legend'));
    setValue(`${FERIE}.periode.fraDato.value`, undefined);
    setValue(`${FERIE}.periode.fraDato.label`, undefined);
    setValue(`${FERIE}.periode.tilDato.value`, undefined);
    setValue(`${FERIE}.periode.tilDato.label`, undefined);
    setValue(`${FERIE}.antallDager.value`, '');
    setValue(`${FERIE}.antallDager.label`, '');
  }, [ferieType]);
  useEffect(() => {
    if (antallDager)
      setValue(`${FERIE}.antallDager.label`, getText('form.ferie.antallDager.label'));
  }, [antallDager]);
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.startDato.title')}
      </Heading>
      <GuidePanel>
        {getParagraphs('steps.startDato.guide.paragraphs').map((e: string, index: number) => (
          <BodyLong key={`${index}`}>{e}</BodyLong>
        ))}
        <ReadMore header={getText('steps.startDato.guideReadMore.heading')} type={'button'}>
          <BodyLong>{getText('steps.startDato.guideReadMore.text')}</BodyLong>
        </ReadMore>
      </GuidePanel>
      <DatoVelgerWrapper
        name={`${STARTDATO}.value`}
        label={getText(`form.${STARTDATO}.label`)}
        control={control}
        error={errors.startDato?.value?.message}
      />
      <RadioGroupWrapper
        legend={getText('form.ferie.skalHaFerie.legend')}
        name={`${FERIE}.skalHaFerie.value`}
        control={control}
        error={errors?.[`${FERIE}`]?.skalHaFerie?.value?.message}
      >
        <Radio value={JaNeiVetIkke.JA}>{JaNeiVetIkke.JA}</Radio>
        <Radio value={JaNeiVetIkke.NEI}>{JaNeiVetIkke.NEI}</Radio>
        <Radio value={JaNeiVetIkke.VET_IKKE}>{JaNeiVetIkke.VET_IKKE}</Radio>
      </RadioGroupWrapper>
      {skalHaFerie === JaNeiVetIkke.JA && (
        <ColorPanel>
          <RadioGroupWrapper
            legend={getText('form.ferie.ferieType.legend')}
            name={`${FERIE}.type.value`}
            control={control}
            error={errors?.[`${FERIE}`]?.type?.value?.message}
          >
            <Radio value={FerieType.PERIODE}>
              <BodyShort>{FerieType.PERIODE}</BodyShort>
            </Radio>
            <Radio value={FerieType.DAGER}>
              <BodyShort>{FerieType.DAGER}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          {ferieType === FerieType.PERIODE ? (
            <Grid>
              <Cell xs={6}>
                <DatoVelgerWrapper
                  name={`${FERIE}.periode.fraDato.value`}
                  label={getText('form.ferie.fraDato.label')}
                  control={control}
                />
              </Cell>
              <Cell xs={6}>
                <DatoVelgerWrapper
                  name={`${FERIE}.periode.tilDato.value`}
                  label={getText('form.ferie.tilDato.label')}
                  control={control}
                />
              </Cell>
            </Grid>
          ) : (
            <></>
          )}
          {ferieType === FerieType.DAGER ? (
            <TextFieldWrapper
              name={`${FERIE}.antallDager.value`}
              label={getText('form.ferie.antallDager.label')}
              control={control}
            />
          ) : (
            <></>
          )}
        </ColorPanel>
      )}
      {skalHaFerie === JaNeiVetIkke.VET_IKKE && (
        <Alert variant={'info'}>
          Det er viktig at du gir oss beskjed hvis du bestemmer deg for å ta ferie, fordi det kan
          påvirke startdatoen din. Dette påvirker spesielt deg som får sykepenger.
        </Alert>
      )}
    </>
  );
};
export default StartDato;
