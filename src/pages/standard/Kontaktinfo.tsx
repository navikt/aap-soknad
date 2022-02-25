import { Heading, TextField } from '@navikt/ds-react';
import TextFieldWrapper from '../../components/input/TextFieldWrapper';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';

interface KontaktinfoProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
}
export const Kontaktinfo = ({ getText, errors, control }: KontaktinfoProps) => {
  return (
    <>
      <TextFieldWrapper
        control={control}
        error={errors?.firstname?.message}
        label={getText('form.kontaktinfo.firstname.label')}
        name="firstname"
      />
      <TextFieldWrapper
        control={control}
        error={errors?.lastname?.message}
        label={getText('form.kontaktinfo.lastname.label')}
        name="lastname"
      />
      <TextFieldWrapper
        control={control}
        error={errors?.adresse?.message}
        label={getText('form.kontaktinfo.adresse.label')}
        name="adresse"
      />
      <TextFieldWrapper
        control={control}
        error={errors?.postnummer?.message}
        label={getText('form.kontaktinfo.postnummer.label')}
        name="postnummer"
      />
      <TextFieldWrapper
        control={control}
        error={errors?.poststed?.message}
        label={getText('form.kontaktinfo.poststed.label')}
        name="poststed"
      />
      <TextFieldWrapper
        control={control}
        error={errors?.epost?.message}
        label={getText('form.kontaktinfo.epost.label')}
        name="epost"
      />
      <TextFieldWrapper
        control={control}
        error={errors?.telefon?.message}
        label={getText('form.kontaktinfo.telefon.label')}
        name="telefon"
      />
    </>
  );
};
