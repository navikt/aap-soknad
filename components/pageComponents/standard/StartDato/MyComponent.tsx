import React from 'react';
import { useForm } from 'react-hook-form';
import { MyNewFileInput } from '../../../input/FileInput/MyNewFileInput';
import { Button } from '@navikt/ds-react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFeatureToggleIntl } from '../../../../hooks/useFeatureToggleIntl';
import {
  isUnderTotalAmountOfUpload,
  isValidAttachment,
  isValidFileType,
} from '../../../input/FileInput/FileInputValidations';

const MAX_TOTAL_FILE_SIZE = 52428800; // 50mb

export interface FormFieldVedlegg {
  name: string;
  size: number;
  vedleggId?: string;
  barnId?: string; // Ny
  isValid: boolean; // Ny
  file: File; // Ny
  substatus?: string;
}

export interface FormFields {
  lønnOgAndreGoder: FormFieldVedlegg[];
  omsorgstønad: FormFieldVedlegg[];
  utlandsstønad: FormFieldVedlegg[];
  avbruttStudie: FormFieldVedlegg[];
  sykestipend: FormFieldVedlegg[];
  lån: FormFieldVedlegg[];
  annet: FormFieldVedlegg[];
  manuelleBarn: FormFieldVedlegg[];
}

export const MyComponent = () => {
  const { formatMessage } = useFeatureToggleIntl();

  const errorText = (statusCode: number) => {
    switch (statusCode) {
      case 413:
        return formatMessage('fileInputErrors.fileTooLarge');
      case 415:
        return formatMessage('fileInputErrors.unsupportedMediaType');
      default:
        return formatMessage('fileInputErrors.other');
    }
  };

  const schema = yup.object().shape({
    lønnOgAndreGoder: yup
      .array()
      .test('unvalidFileType', errorText(415), (value) => {
        return isValidFileType(value);
      })
      .test('filesToLarge', errorText(413), (value) => {
        return isUnderTotalAmountOfUpload(value);
      })
      .test('unvalidAttachment', errorText(1), (value) => {
        return isValidAttachment(value);
      }),
  });

  const {
    control,
    handleSubmit,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
  });

  return (
    <form
      style={{ display: 'grid', gridTemplateColumns: '1fr', gridRowGap: '1rem', width: '500px' }}
      onSubmit={handleSubmit((data) => console.log(data))}
    >
      <MyNewFileInput
        control={control}
        name={'lønnOgAndreGoder'}
        heading={'Lønn og andre goder'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <MyNewFileInput
        control={control}
        name={'omsorgstønad'}
        heading={'Omsorgstønad'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <MyNewFileInput
        control={control}
        name={'utlandsstønad'}
        heading={'Utlandsstønad'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <MyNewFileInput
        control={control}
        name={'avbruttStudie'}
        heading={'Avbrutt studie'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <MyNewFileInput
        control={control}
        name={'sykestipend'}
        heading={'Sykestipend'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <MyNewFileInput
        control={control}
        name={'lån'}
        heading={'Lån'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <MyNewFileInput
        control={control}
        name={'annet'}
        heading={'Annet'}
        triggerValidation={trigger}
        clearErrors={clearErrors}
      />
      <Button>Fullfør</Button>
    </form>
  );
};
