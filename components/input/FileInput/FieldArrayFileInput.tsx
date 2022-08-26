import { Control, FieldError, FieldErrors, useFieldArray } from 'react-hook-form';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import React, { DragEventHandler, useEffect, useRef, useState } from 'react';
import * as classes from './FileInput.module.css';
import { BodyShort, Detail, Heading, Label, Link, Loader, Panel } from '@navikt/ds-react';
import { Cancel, Delete, FileError, FileSuccess } from '@navikt/ds-icons';
import { Upload as SvgUpload } from '@navikt/ds-icons';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { updateRequiredVedlegg } from 'context/soknadContextCommon';
import { useRouter } from 'next/router';
type Props = {
  setError: (name: string, error: FieldError) => void;
  clearErrors: (name?: string | string[]) => void;
  name: string;
  type: string;
  heading: string;
  ingress?: string;
  errors?: FieldErrors;
  control: Control;
};
const FieldArrayFileInput = ({
  heading,
  ingress,
  name,
  type,
  setError,
  clearErrors,
  control,
  errors,
}: Props) => {
  const { append, remove, fields } = useFieldArray({
    name: name,
    control,
  });

  useEffect(() => {
    updateRequiredVedlegg({ type: type, completed: fields.length > 0 }, søknadDispatch);
  }, [fields]);

  const { formatMessage } = useFeatureToggleIntl();

  const { søknadDispatch } = useSoknadContextStandard();
  const router = useRouter();

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
    const vedlegg = await fetch('/aap/soknad/api/vedlegg/lagre/', {
      method: 'POST',
      body: data,
    });
    setLoading(false);
    if (vedlegg.status === 307) {
      const path = window?.location?.pathname;
      router.push(`/oauth2/login?redirect=${path}`);
    }
    if (vedlegg.ok) {
      const id = await vedlegg.json();
      append({ name: file?.name, size: file?.size, vedleggId: id });
      setTotalUploadedBytes(totalUploadedBytes + file.size);
      updateRequiredVedlegg({ type: 'OMSORGSSTØNAD', completed: true }, søknadDispatch);
    } else {
      setFilename(file?.name);
      setError(inputId, { type: 'custom', message: errorText(vedlegg.status) });
    }
    setDragOver(false);
  };
  const onDelete = (index: number) => {
    remove(index);
  };
  const fileSizeString = (size: number) => {
    const kb = size / 1024;
    return kb > 1000 ? `${(kb / 1024).toFixed(1)} mB` : `${Math.floor(kb)} kB`;
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
                <FileSuccess color={'var(--navds-semantic-color-feedback-success-icon)'} />
              </div>
              <div>
                <Link target={'_blank'} href={`/aap/soknad/vedlegg/${attachment?.vedleggId}`}>
                  {attachment?.name}
                </Link>
                <Detail>{fileSizeString(attachment?.size)}</Detail>
              </div>
            </div>
            <button
              type={'button'}
              onClick={() =>
                fetch(`/aap/soknad/api/vedlegg/slett/?uuids=${attachment?.vedleggId}`, {
                  method: 'DELETE',
                }).then(() => {
                  onDelete(index);
                })
              }
              tabIndex={0}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  onDelete(index);
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
      {errors?.[inputId]?.message && (
        <>
          <Panel className={`${classes?.fileCard} ${classes?.error}`} id={name} tabIndex={0}>
            <div className={classes?.fileCardLeftContent}>
              <div className={classes?.fileError}>
                <FileError color={'var(--navds-semantic-color-interaction-danger-hover)'} />
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
            {errors?.[inputId]?.message}
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
export default FieldArrayFileInput;
