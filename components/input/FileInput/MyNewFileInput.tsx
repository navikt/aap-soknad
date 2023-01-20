import React, { useRef, useState } from 'react';
import {
  ArrayPath,
  Control,
  useController,
  useFieldArray,
  UseFormClearErrors,
  UseFormTrigger,
} from 'react-hook-form';
import { FormFields } from '../../pageComponents/standard/StartDato/MyComponent';
import { ErrorMessage, Loader } from '@navikt/ds-react';

import * as styles from './FileInput.module.css';
import * as classes from './FileInput.module.css';
import { Upload as SvgUpload } from '@navikt/ds-icons';
import { FileCard } from './FileCard';
import { FileCardError } from './FileCardError';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

interface Props {
  name: ArrayPath<FormFields>;
  control: Control<FormFields>;
  triggerValidation: UseFormTrigger<FormFields>;
  clearErrors: UseFormClearErrors<FormFields>;
  heading: string;
}

export const MyNewFileInput = (props: Props) => {
  const { name, control, heading, triggerValidation, clearErrors } = props;
  const { formatMessage } = useFeatureToggleIntl();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState('');
  const { formState } = useController({ control, name });
  const fileUploadInputElement = useRef<HTMLInputElement>(null);
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  });

  const error422Text = (subType: string) => {
    console.log('im here with subtype!', subType);
    switch (subType) {
      case 'PASSWORD_PROTECTED':
        return formatMessage('fileInputErrors.passordbeskyttet');
      case 'VIRUS':
        return formatMessage('fileInputErrors.virus');
      case 'SIZE':
        return formatMessage('fileInputErrors.size');
      default:
        return '';
    }
  };

  async function handleUpload(file: File) {
    clearErrors(name);
    setLoading(true);
    const data = new FormData();
    data.append('vedlegg', file);
    try {
      const res = await fetch('/aap/soknad/api/vedlegg/lagre/', { method: 'POST', body: data });
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
        const message = error422Text(resData?.substatus);
        setFetchError(message);
        append({ name: file?.name, size: file?.size, isValid: false, file: file });
      }
    } catch (err: any) {
      setFetchError('Feilmelding i catch');
    }
    setLoading(false);

    // Only run validation for this field
    await triggerValidation(name);
  }

  return (
    <div className={styles.fileInput}>
      {fields.map((vedlegg, index) => {
        return vedlegg.isValid ? (
          <FileCard key={vedlegg.id} vedlegg={vedlegg} remove={() => remove(index)} />
        ) : (
          <FileCardError key={vedlegg.id} vedlegg={vedlegg} remove={() => remove(index)} />
        );
      })}
      <div>
        {loading ? (
          <Loader />
        ) : (
          <>
            <input
              id={name}
              type="file"
              value={''}
              onChange={(e) => {
                const file = e?.target?.files?.[0];
                if (file) {
                  handleUpload(file);
                }
              }}
              className={classes?.visuallyHidden}
              tabIndex={-1}
              ref={fileUploadInputElement}
              accept="image/*,.pdf"
            />
            <label htmlFor={name}>
              <button
                /* eslint-disable-next-line max-len */
                className={`${classes?.fileInputButton} navds-button navds-button__inner navds-body-short navds-button--secondary`}
                aria-controls={name}
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  fileUploadInputElement.current && fileUploadInputElement.current.click();
                }}
              >
                <SvgUpload title="" aria-hidden />
                Velg dine filer for {heading.toLowerCase()}
              </button>
            </label>
          </>
        )}
      </div>
      {fetchError && <ErrorMessage>{fetchError}</ErrorMessage>}
      {!fetchError && formState.errors[name] && (
        <ErrorMessage>{formState.errors[name]?.message}</ErrorMessage>
      )}
    </div>
  );
};
