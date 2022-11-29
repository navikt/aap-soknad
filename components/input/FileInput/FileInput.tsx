import { Label, Link, BodyShort, Detail, Heading, Loader, Panel } from '@navikt/ds-react';
import React, { DragEventHandler, useRef, useState } from 'react';
import { Upload as SvgUpload } from '@navikt/ds-icons';
import * as classes from './FileInput.module.css';
import {
  FieldArray,
  FieldArrayMethodProps,
  FieldArrayWithId,
  FieldError,
  FieldValues,
} from 'react-hook-form';
import { Cancel, Delete, FileError, FileSuccess } from '@navikt/ds-icons';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';

export interface Props {
  fields: FieldArrayWithId[];
  append: (
    value: Partial<FieldArray<FieldValues, any>> | Partial<FieldArray<FieldValues, any>>[],
    options?: FieldArrayMethodProps
  ) => void;
  setError: (name: string, error: FieldError) => void;
  clearErrors: (name?: string | string[]) => void;
  remove: (index?: number | number[] | undefined) => void;
  heading: string;
  ingress?: string;
  error?: string;
}
const FileInput = ({
  fields,
  append,
  remove,
  heading,
  ingress,
  setError,
  clearErrors,
  error,
}: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filename, setFilename] = useState<string | undefined>();
  const [inputId] = useState<string>(`file-upload-input-${Math.floor(Math.random() * 100000)}`);
  const fileUploadInputElement = useRef(null);
  const [totalUploadedBytes, setTotalUploadedBytes] = useState(0);
  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    setDragOver(false);
    return e;
  };
  const handleDragEnter: DragEventHandler<HTMLDivElement> = (e) => {
    setDragOver(true);
    return e;
  };
  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };
  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
  };
  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(uploadFile);
  };
  const errorText = (statusCode: number) => {
    switch (statusCode) {
      case 422:
        return formatMessage('fileInputErrors.virus');
      case 413:
        return formatMessage('fileInputErrors.fileTooLarge');
      case 415:
        return formatMessage('fileInputErrors.unsupportedMediaType');
      case 500:
        return formatMessage('fileInputErrors.other');
      default:
        return '';
    }
  };
  const uploadFile = async (file: any) => {
    clearErrors(inputId);
    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(file?.type)) {
      setFilename(file?.name);
      setError(inputId, { type: 'custom', message: errorText(415) });
      setDragOver(false);
      return;
    }
    if (totalUploadedBytes + file?.size > 52428800) {
      setFilename(file?.name);
      setError(inputId, { type: 'custom', message: errorText(413) });
      setDragOver(false);
      return;
    }
    const data = new FormData();
    data.append('vedlegg', file);
    setLoading(true);
    const vedlegg = await fetch('/aap/soknad-api/vedlegg/lagre', {
      method: 'POST',
      body: data,
    });
    setLoading(false);
    if (vedlegg.ok) {
      const id = await vedlegg.json();
      console.log(file?.name, id);
      append({ name: file?.name, size: file?.size, vedleggId: id });
      setTotalUploadedBytes(totalUploadedBytes + file.size);
    } else {
      setFilename(file?.name);
      setError(inputId, { type: 'custom', message: errorText(vedlegg.status) });
    }
    setDragOver(false);
  };
  return (
    <div className={classes?.fileInput}>
      {heading && (
        <Heading size={'large'} level={'3'}>
          {heading}
        </Heading>
      )}
      {ingress && <BodyShort>{ingress}</BodyShort>}
      {fields?.map((attachment, index) => {
        return (
          <Panel className={classes?.fileCard} key={attachment.id}>
            <div className={classes?.fileCardLeftContent}>
              <div className={classes?.fileSuccess}>
                <FileSuccess color={'var(--a-icon-success)'} />
              </div>
              <div>
                <Link target={'_blank'} href={`/aap/soknad/vedlegg/${attachment?.vedleggId}`}>
                  {attachment?.name}
                </Link>
                <Detail>{attachment?.size}</Detail>
              </div>
            </div>
            <button
              type={'button'}
              onClick={() =>
                fetch(`/aap/soknad-api/vedlegg/slett?uuids=${attachment?.vedleggId}`, {
                  method: 'DELETE',
                }).then(() => remove(index))
              }
              tabIndex={0}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  remove(index);
                }
              }}
              className={classes?.deleteAttachment}
            >
              <Delete title={'Slett'} />
              <BodyShort>{'Slett'}</BodyShort>
            </button>
          </Panel>
        );
      })}
      {error && (
        <>
          <Panel className={`${classes?.fileCard} ${classes?.error}`} id={name} tabIndex={0}>
            <div className={classes?.fileCardLeftContent}>
              <div className={classes?.fileError}>
                <FileError color={'var(--a-surface-danger-hover)'} />
              </div>
              <div>
                <Label>{filename}</Label>
              </div>
            </div>
            <button
              type={'button'}
              onClick={() => {
                setFilename(undefined);
                clearErrors(inputId);
              }}
              tabIndex={0}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  setFilename(undefined);
                  clearErrors(inputId);
                }
              }}
              className={classes?.deleteAttachment}
            >
              <Cancel title={'Avbryt'} />
              <BodyShort>{'Avbryt'}</BodyShort>
            </button>
          </Panel>
          <div className={'navds-error-message navds-error-message--medium navds-label'}>
            {error}
          </div>
        </>
      )}
      <div
        className={`${classes?.dropZone} ${dragOver ? classes?.dragOver : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e)}
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            <input
              id={inputId}
              type="file"
              value={''}
              onChange={(e) => {
                const file = e?.target?.files?.[0];
                if (file) uploadFile(file);
              }}
              className={classes?.visuallyHidden}
              tabIndex={-1}
              ref={fileUploadInputElement}
              accept="image/*,.pdf"
            />
            <BodyShort>{'Dra og slipp'}</BodyShort>
            <BodyShort>{'eller'}</BodyShort>
            <label htmlFor={inputId}>
              <span
                /* eslint-disable-next-line max-len */
                className={`${classes?.fileInputButton} navds-button navds-button__inner navds-body-short navds-button--secondary`}
                role={'button'}
                aria-controls={inputId}
                tabIndex={0}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    fileUploadInputElement?.current?.click();
                  }
                }}
              >
                <SvgUpload title={'Last opp fil'} />
                {'Velg dine filer'}
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  );
};
export default FileInput;
