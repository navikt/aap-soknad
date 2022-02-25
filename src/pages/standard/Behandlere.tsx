import { BodyShort, Button, Label } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, useFieldArray } from 'react-hook-form';
import TextFieldWrapper from '../../components/input/TextFieldWrapper';

interface BehandlereProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
}
enum JaEllerNei {
  JA = 'ja',
  NEI = 'nei',
}

export const Behandlere = ({ getText, errors, control }: BehandlereProps) => {
  const { fields, append, remove } = useFieldArray({ name: 'behandlere', control });
  return (
    <>
      <Label>Din registrerte fastlege</Label>
      <BodyShort>Lege Legesen</BodyShort>
      <BodyShort>Legenes legekontor</BodyShort>
      <BodyShort>Bamseveien 21, 0101 Bodø</BodyShort>
      {fields.map((field, index) => (
        <div key={field.id}>
          <TextFieldWrapper
            control={control}
            error={errors?.behandlere?.[index]?.firstname?.message}
            label={getText('form.behandlere.firstname.label')}
            name={`behandlere.${index}.firstname`}
          />
          <TextFieldWrapper
            control={control}
            error={errors?.behandlere?.[index]?.lastname?.message}
            label={getText('form.behandlere.lastname.label')}
            name={`behandlere.${index}.lastname`}
          />
          <TextFieldWrapper
            control={control}
            error={errors?.behandlere?.[index]?.telefon?.message}
            label={getText('form.behandlere.telefon.label')}
            name={`behandlere.${index}.telefon`}
          />
          <Button type="button" onClick={() => remove(index)}>
            Fjern
          </Button>
        </div>
      ))}
      <Button
        variant="primary"
        type="button"
        onClick={() => append({ firstname: '', lastname: '' })}
      >
        Legg til behandler
      </Button>
    </>
  );
};
