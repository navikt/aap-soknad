import React, { useState } from 'react';
import {
  ArrayPath,
  Control,
  useController,
  useFieldArray,
  UseFormClearErrors,
  UseFormTrigger,
} from 'react-hook-form';
import { BodyShort, ErrorMessage, Heading, Loader } from '@navikt/ds-react';

import * as styles from './FileInput.module.css';
import { FileCard } from './FileCard';
import { FileCardError } from './FileCardError';
import { FileInput } from './FileInput';
import { FormFields } from '../../pageComponents/standard/Vedlegg/Vedlegg';

type FormFieldsWithoutManuelleBarn = Omit<FormFields, 'manuelleBarn'>;

interface Props {
  name: ArrayPath<FormFieldsWithoutManuelleBarn>;
  control: Control<FormFields>;
  triggerValidation: UseFormTrigger<FormFields>;
  clearErrors: UseFormClearErrors<FormFields>;
  heading: string;
  ingress?: string;
}

export const VedleggFileInput = (props: Props) => {
  const { name, control, heading, ingress, triggerValidation, clearErrors } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const { formState } = useController({ control, name });
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  });

  async function handleUpload(file: File) {
    clearErrors(name);
    setLoading(true);
    const data = new FormData();
    data.append('vedlegg', file);
    try {
      const res = await fetch('/aap/soknad/api/vedlegg/lagre/', {
        method: 'POST',
        body: data,
      });
      const resData = await res.json();
      if (res.ok) {
        append({
          name: file?.name,
          size: file?.size,
          vedleggId: resData,
          file: file,
          isValid: true,
        });
      } else {
        append({
          name: file?.name,
          size: file?.size,
          isValid: false,
          file: file,
          substatus: resData?.substatus,
        });
      }
    } catch (err: any) {
      //TODO what todo here?
    }
    setLoading(false);

    // Only run validation for this field
    await triggerValidation(name);
  }

  async function removeField(index: number, vedleggId?: string) {
    const res = await fetch(`/aap/soknad/api/vedlegg/slett/?uuids=${vedleggId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      remove(index);
      triggerValidation(name);
    }
  }

  return (
    <div className={styles.fileInput}>
      <Heading size={'medium'} level={'3'}>
        {heading}
      </Heading>
      {ingress && <BodyShort>{ingress}</BodyShort>}
      {fields.map((vedlegg, index) => {
        return vedlegg.isValid ? (
          <FileCard
            key={vedlegg.id}
            vedlegg={vedlegg}
            remove={() => removeField(index, vedlegg.vedleggId)}
          />
        ) : (
          <FileCardError
            key={vedlegg.id}
            vedlegg={vedlegg}
            remove={() => removeField(index, vedlegg.vedleggId)}
          />
        );
      })}
      <div>
        {loading ? (
          <Loader />
        ) : (
          <FileInput name={name} handleUpload={(file) => handleUpload(file)} title={heading} />
        )}
      </div>
      {formState.errors[name] && <ErrorMessage>{formState.errors[name]?.message}</ErrorMessage>}
    </div>
  );
};
