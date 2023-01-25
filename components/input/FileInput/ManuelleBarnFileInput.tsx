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
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { FileCard } from './FileCard';
import { FileCardError } from './FileCardError';
import { ManuelleBarn } from '../../../types/Soknad';
import { OpplastingKnapp } from './OpplastingKnapp';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
import { FormFields } from '../../pageComponents/standard/Vedlegg/Vedlegg';

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
    manuelleBarnIndex: number,
    vedleggIndex: number,
    manuelleBarn: ManuelleBarn,
    vedleggId?: string
  ) {
    const res = await fetch(`/aap/soknad/api/vedlegg/slett/?uuids=${vedleggId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      if (manuelleBarn.vedlegg) {
        const vedlegg = [...manuelleBarn.vedlegg];
        vedlegg.splice(vedleggIndex, 1);
        update(manuelleBarnIndex, {
          ...manuelleBarn,
          vedlegg: vedlegg,
        });
      }
    }
    await triggerValidation(name);
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
              status: res.status,
            },
          ],
        });
      }
    } catch (err: any) {
      // TODO What to do here?
    }
    setLoading(false);

    await triggerValidation(name);
  }

  return (
    <>
      {fields.map((manuelleBarn, manuelleBarnIndex) => {
        const requiredVedlegg = søknadState?.requiredVedlegg.find(
          (vedlegg) => vedlegg?.type === `barn-${manuelleBarn.internId}`
        );

        return (
          <div className={styles.fileInput} key={manuelleBarn.id}>
            <Heading size={'medium'} level={'3'}>
              {formatMessage(`søknad.vedlegg.andreBarn.title.${requiredVedlegg?.filterType}`, {
                navn: `${manuelleBarn?.navn?.fornavn} ${manuelleBarn?.navn?.etternavn}`,
              })}
            </Heading>
            <BodyShort>{requiredVedlegg?.description}</BodyShort>
            {manuelleBarn.vedlegg?.map((vedlegg, vedleggIndex) => {
              return vedlegg.isValid ? (
                <FileCard
                  key={vedleggIndex}
                  vedlegg={vedlegg}
                  remove={() =>
                    removeField(manuelleBarnIndex, vedleggIndex, manuelleBarn, vedlegg.vedleggId)
                  }
                />
              ) : (
                <FileCardError
                  key={vedleggIndex}
                  vedlegg={vedlegg}
                  remove={() =>
                    removeField(manuelleBarnIndex, vedleggIndex, manuelleBarn, vedlegg.vedleggId)
                  }
                />
              );
            })}
            {loading ? (
              <Loader />
            ) : (
              <OpplastingKnapp
                name={`manuelleBarn.${manuelleBarnIndex}.vedlegg`}
                handleUpload={(file) => handleUpload(manuelleBarnIndex, manuelleBarn, file)}
                title={`${manuelleBarn.navn.fornavn} ${manuelleBarn.navn.etternavn}`}
              />
            )}
            {formState.errors.manuelleBarn !== undefined && (
              <ErrorMessage>
                {formState.errors.manuelleBarn[manuelleBarnIndex]?.vedlegg?.message}
              </ErrorMessage>
            )}
          </div>
        );
      })}
    </>
  );
};
