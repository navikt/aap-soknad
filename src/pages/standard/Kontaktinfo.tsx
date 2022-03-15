import { Alert, BodyShort, Label, Radio } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import { JaEllerNei } from '../../types/Generic';

interface KontaktinfoProps {
  watch: UseFormWatch<FieldValues>;
  control: Control<FieldValues>;
  getText: GetText;
  errors: FieldErrors;
  søkerFulltNavn: string;
  personident: string;
  adresseFull: string;
}
export const Kontaktinfo = ({
  watch,
  control,
  getText,
  errors,
  søkerFulltNavn,
  personident,
  adresseFull,
}: KontaktinfoProps) => {
  const bekreftOpplysninger = watch('bekreftOpplysninger');
  return (
    <>
      <div>
        <Label>{getText('steps.kontaktinfo.registrertInfo.title')}</Label>
        <BodyShort>{getText('steps.kontaktinfo.registrertInfo.text')}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.fullname')}</Label>
        <BodyShort>{søkerFulltNavn}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.personident')}</Label>
        <BodyShort>{personident}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.adresse')}</Label>
        <BodyShort>{adresseFull}</BodyShort>
      </div>
      <RadioGroupWrapper
        name={'bekreftOpplysninger'}
        legend={getText('form.kontaktinfo.bekreftOpplysninger.legend')}
        control={control}
        error={errors?.bekreftOpplysninger?.message}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {bekreftOpplysninger === JaEllerNei.NEI && (
        <Alert variant={'info'}>{getText('form.kontaktinfo.bekreftOpplysninger.alert')}</Alert>
      )}
    </>
  );
};
