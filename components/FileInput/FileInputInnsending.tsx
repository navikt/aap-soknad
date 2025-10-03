import { UploadIcon } from '@navikt/aksel-icons';
import { BodyShort, Heading, Loader } from '@navikt/ds-react';
import React, { useMemo, useRef, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { FileInputProps, Vedlegg } from './FileInput';
import { FilePanelError } from './FilePanelError';
import { FilePanelSuccess } from './FilePanelSuccess';
import { useIntl } from 'react-intl';

const MAX_TOTAL_FILE_SIZE = 52428800; // 50mb
export const FileInputInnsending = (props: FileInputProps) => {
  const {
    heading,
    ingress,
    files,
    onUpload,
    onDelete,
    uploadUrl,
    deleteUrl,
    id,
    locale,
    readAttachmentUrl = 'nb',
    ...rest
  } = props;
  const { formatMessage } = useIntl();
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [totalSizeIInnsending, setTotalSizeIInnsending] = useState<number>(0);
  const fileInputElement = useRef<HTMLInputElement>(null);
  const inputId = useMemo(() => uuidV4(), []);

  function feilmeldingForSubstatus(substatus: string) {
    switch (substatus) {
      case 'PASSWORD_PROTECTED':
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.passordbeskyttet'});
      case 'VIRUS':
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.virus'});
      case 'SIZE':
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.size'});
      default:
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.default422'});
    }
  }

  const settFeilmelding = (statusCode: number, substatus = '') => {
    switch (statusCode) {
      case 422:
        return feilmeldingForSubstatus(substatus);
      case 413:
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.fileTooLarge'});
      case 415:
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.unsupportedMediaType'});
      default:
        return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.other'});
    }
  };

  function internalValidate(fileToUpload: File): string | undefined {
    const totalUploadedSize = files.reduce((acc, curr) => acc + curr.size, 0);

    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(fileToUpload?.type)) {
      return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.unsupportedMediaType'});
    }

    if (totalUploadedSize + fileToUpload?.size > MAX_TOTAL_FILE_SIZE) {
      return formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.fileTooLarge'});
    }
  }

  async function validateAndSetFiles(filelist: FileList) {
    const fileArray = Array.from(filelist);
    const totalSize = fileArray.reduce((acc, curr) => acc + curr.size, 0);
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      setIsUploading(false);
      onUpload([
        {
          vedleggId: uuidV4(),
          errorMessage: formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.fileTooLarge'}),
          type: '',
          size: totalSize,
          name: `${fileArray.length} filer`,
        },
      ]);
    } else if (totalSize + totalSizeIInnsending > MAX_TOTAL_FILE_SIZE) {
      setIsUploading(false);
      onUpload([
        {
          vedleggId: uuidV4(),
          errorMessage: formatMessage({id: 'søknad.vedlegg.fileinput.fileInputErrors.fileTooLarge'}),
          type: '',
          size: totalSize,
          name: `${fileArray.length} filer`,
        },
      ]);
    } else {
      setIsUploading(true);
      const uploadedFiles: Vedlegg[] = await Promise.all(
        fileArray.map(async (file) => {
          const internalErrorMessage = internalValidate(file);
          let uploadResult: Vedlegg = {
            vedleggId: uuidV4(),
            errorMessage: '',
            type: file.type,
            size: file.size,
            name: file.name,
          };

          if (!internalErrorMessage) {
            try {
              const data = new FormData();
              data.append('vedlegg', file);
              const res = await fetch(uploadUrl, { method: 'POST', body: data });
              const resData = await res.json();

              if (res.ok) {
                uploadResult.vedleggId = resData.filId;
              } else {
                uploadResult.errorMessage = settFeilmelding(res.status, resData.substatus);
              }
            } catch (err: any) {
              uploadResult.errorMessage = settFeilmelding(err?.status || 500);
            }
          } else if (internalErrorMessage) {
            uploadResult.errorMessage = internalErrorMessage;
          }

          return uploadResult;
        }),
      );

      const successfullyUploadedFiles = uploadedFiles.filter((file) => !file.errorMessage);
      setTotalSizeIInnsending(
        totalSizeIInnsending + successfullyUploadedFiles.reduce((acc, curr) => acc + curr.size, 0),
      );
      setIsUploading(false);
      onUpload(uploadedFiles);
    }
  }

  return (
    <div className={'fileInput'} id={props.id}>
      <Heading size={'medium'}>{heading}</Heading>
      {ingress && <BodyShort>{ingress}</BodyShort>}
      {files?.map((file) => {
        if (file.errorMessage) {
          return (
            <FilePanelError file={file} key={file.vedleggId} onDelete={() => onDelete(file)} />
          );
        } else {
          return (
            <FilePanelSuccess
              file={file}
              key={file.vedleggId}
              deleteUrl={deleteUrl}
              readAttachmentUrl={readAttachmentUrl}
              onDelete={() => {
                onDelete(file);
              }}
            />
          );
        }
      })}
      <div
        data-testid={'dropzone'}
        className={`dropzone ${dragOver ? 'dragover' : ''}`}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) {
            validateAndSetFiles(e.dataTransfer.files);
          }
          setDragOver(false);
        }}
      >
        {isUploading ? (
          <Loader title={'Laster'} />
        ) : (
          <>
            <input
              id={inputId}
              type={'file'}
              value={''}
              onChange={(e) => {
                if (e.target.files) {
                  validateAndSetFiles(e.target.files);
                }
              }}
              className={'visuallyHidden'}
              tabIndex={-1}
              data-testid={'fileinput'}
              multiple={true}
              accept="image/*,.pdf"
              ref={fileInputElement}
              {...rest}
            />
            <BodyShort>{formatMessage({id: 'søknad.vedlegg.fileinput.inputText'})}</BodyShort>
            <BodyShort>{'eller'}</BodyShort>
            <label htmlFor={inputId} aria-labelledby={props.id}>
              <span
                className={
                  'fileInputButton navds-button navds-button__inner navds-body-short navds-button--secondary'
                }
                role={'button'}
                aria-controls={inputId}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    fileInputElement?.current?.click();
                  }
                }}
              >
                <UploadIcon title="Last opp filer" aria-hidden />
                {formatMessage({id: 'søknad.vedlegg.fileinput.labelText'})} {heading.toLowerCase()}
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  );
};
