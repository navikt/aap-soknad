import React, { useState } from 'react';
import {
  ArrayPath,
  Control,
  useController,
  useFieldArray,
  UseFormClearErrors,
  UseFormTrigger,
} from 'react-hook-form';
import { FormFields } from '../../pageComponents/standard/StartDato/MyComponent';
import { BodyShort, ErrorMessage, Heading, Loader } from '@navikt/ds-react';

import * as styles from './FileInput.module.css';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { FileCard } from './FileCard';
import { FileCardError } from './FileCardError';
import { ManuelleBarn } from '../../../types/Soknad';
import { OpplastingKnapp } from './OpplastingKnapp';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';

type FormFieldsWithManuelleBarn = Pick<FormFields, 'manuelleBarn'>;

interface Props {
  name: ArrayPath<FormFieldsWithManuelleBarn>;
  control: Control<FormFields>;
  triggerValidation: UseFormTrigger<FormFields>;
  clearErrors: UseFormClearErrors<FormFields>;
}

export const ManuelleBarnFileInput = (props: Props) => {
  const { name, control, triggerValidation, clearErrors } = props;
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState } = useSoknadContextStandard();
  const [loading, setLoading] = useState<boolean>(false);
  const { formState } = useController({ control, name });
  const { fields, update } = useFieldArray({
    name: 'manuelleBarn',
    control,
  });

  async function removeField(
    fieldIndex: number,
    vedleggIndex: number,
    field: ManuelleBarn,
    vedleggId?: string
  ) {
    const res = await fetch(`/aap/soknad/api/vedlegg/slett/?uuids=${vedleggId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      if (field.vedlegg) {
        const vedlegg = [...field.vedlegg];
        vedlegg.splice(vedleggIndex, 1);
        update(fieldIndex, {
          ...field,
          vedlegg: vedlegg,
        });
      }
    }
    triggerValidation(name);
  }

  async function handleUpload(manuelleBarnIndex: number, manuelleBarn: ManuelleBarn, file: File) {
    clearErrors(name);
    setLoading(true);
    const data = new FormData();
    data.append('vedlegg', file);

    const vedlegg = manuelleBarn.vedlegg ? manuelleBarn.vedlegg : [];
    try {
      const res = await fetch('/aap/soknad/api/vedlegg/lagre/', {
        method: 'POST',
        body: data,
      });
      const resData = await res.json();
      if (res.ok) {
        update(manuelleBarnIndex, {
          ...manuelleBarn,
          vedlegg: [
            ...vedlegg,
            {
              name: file?.name,
              size: file?.size,
              vedleggId: resData,
              file: file,
              isValid: true,
            },
          ],
        });
      } else {
        update(manuelleBarnIndex, {
          ...manuelleBarn,
          vedlegg: [
            ...vedlegg,
            {
              name: file?.name,
              size: file?.size,
              isValid: false,
              file: file,
              substatus: resData?.substatus,
            },
          ],
        });
      }
    } catch (err: any) {
      // setFetchError('Feilmelding i catch');
    }
    setLoading(false);

    // Only run validation for this field
    await triggerValidation(name);
  }

  console.log(fields);

  return (
    <>
      {fields.map((manuelleBarn, manuelleBarnIndex) => {
        const requiredVedlegg = søknadState?.requiredVedlegg.find(
          (e) => e?.type === `barn-${manuelleBarn.internId}`
        );

        return (
          <div className={styles.fileInput} key={manuelleBarnIndex}>
            <Heading size={'medium'} level={'3'}>
              {formatMessage(`søknad.vedlegg.andreBarn.title.${requiredVedlegg?.filterType}`, {
                navn: `${manuelleBarn?.navn?.fornavn} ${manuelleBarn?.navn?.etternavn}`,
              })}
            </Heading>
            <BodyShort>{requiredVedlegg?.description}</BodyShort>
            {manuelleBarn.vedlegg?.map((vedlegg, vedleggIndex) => {
              return vedlegg.isValid ? (
                <FileCard
                  vedlegg={vedlegg}
                  remove={() =>
                    removeField(manuelleBarnIndex, vedleggIndex, manuelleBarn, vedlegg.vedleggId)
                  }
                />
              ) : (
                <FileCardError
                  vedlegg={vedlegg}
                  remove={() =>
                    removeField(manuelleBarnIndex, vedleggIndex, manuelleBarn, vedlegg.vedleggId)
                  }
                />
              );
            })}
            <div>
              {loading ? (
                <Loader />
              ) : (
                <OpplastingKnapp
                  name={`name_${manuelleBarnIndex}`}
                  handleUpload={(file) => handleUpload(manuelleBarnIndex, manuelleBarn, file)}
                  title={`${manuelleBarn.navn.fornavn} ${manuelleBarn.navn.etternavn}`}
                />
              )}
            </div>
            {formState.errors[`manuelleBarn.${manuelleBarnIndex}`] && (
              <ErrorMessage>
                {formState.errors[`manuelleBarn.${manuelleBarnIndex}`]?.message}
              </ErrorMessage>
            )}
          </div>
        );
      })}
    </>
  );
};
