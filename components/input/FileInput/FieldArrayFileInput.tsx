import { ArrayPath, Control, FieldError, FieldErrors, useFieldArray } from 'react-hook-form';
import React, { DragEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import * as classes from './FileInput.module.css';
import { BodyShort, Detail, Heading, Label, Link, Loader, Panel } from '@navikt/ds-react';
import { Cancel, Delete, FileError, FileSuccess, Upload as SvgUpload } from '@navikt/ds-icons';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { updateRequiredVedlegg } from 'context/soknadContextCommon';
import { SoknadVedlegg } from '../../../types/Soknad';
import { useIntl } from 'react-intl';

const MAX_TOTAL_FILE_SIZE = 52428800; // 50mb
type Props = {
  setError: (name: string, error: FieldError) => void;
  clearErrors: (name?: string | string[]) => void;
  name: ArrayPath<SoknadVedlegg>;
  type: string;
  heading: string;
  ingress?: string;
  errors?: FieldErrors<SoknadVedlegg>;
  control: Control<SoknadVedlegg>;
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

  const { formatMessage } = useIntl();

  const { søknadDispatch } = useSoknadContextStandard();

  const [dragOver, setDragOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filename, setFilename] = useState<string | undefined>();
  const [inputId] = useState<string>(`file-upload-input-${Math.floor(Math.random() * 100000)}`);
  const fileUploadInputElement = useRef<HTMLInputElement>(null);
  const totalUploadedBytes = useMemo(
    () => fields.reduce((acc, curr) => acc + curr.size, 0),
    [fields]
  );
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
    const totalFileSize = Array.from(files).reduce((acc, curr) => acc + curr.size, 0);
    if (totalUploadedBytes + totalFileSize > MAX_TOTAL_FILE_SIZE) {
      setFilename(files[0]?.name);
      setError(`${type}-${inputId}`, { type: 'custom', message: errorText(413) });
      setDragOver(false);
      return;
    }
    handleFiles(files);
  };
  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(uploadFile);
  };
  const errorText = (statusCode: number, substatus = '') => {
    switch (statusCode) {
      case 422:
        return error422Text(substatus);
      case 413:
        return formatMessage({ id: 'fileInputErrors.fileTooLarge' });
      case 415:
        return formatMessage({ id: 'fileInputErrors.unsupportedMediaType' });
      default:
        return formatMessage({ id: 'fileInputErrors.other' });
    }
  };
  const error422Text = (subType: string) => {
    switch (subType) {
      case 'PASSWORD_PROTECTED':
        return formatMessage({ id: 'fileInputErrors.passordbeskyttet' });
      case 'VIRUS':
        return formatMessage({ id: 'fileInputErrors.virus' });
      case 'SIZE':
        return formatMessage({ id: 'fileInputErrors.size' });
      default:
        return '';
    }
  };
  const uploadFile = async (file: any) => {
    clearErrors(inputId);
    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(file?.type)) {
      setFilename(file?.name);
      setError(`${type}-${inputId}`, { type: 'custom', message: errorText(415) });
      setDragOver(false);
      return;
    }
    if (totalUploadedBytes + file?.size > MAX_TOTAL_FILE_SIZE) {
      setFilename(file?.name);
      setError(`${type}-${inputId}`, { type: 'custom', message: errorText(413) });
      setDragOver(false);
      return;
    }
    const data = new FormData();
    data.append('vedlegg', file);
    setLoading(true);
    try {
      const res = await fetch('/aap/soknad/api/vedlegg/lagre/', { method: 'POST', body: data });
      const resData = await res.json();
      if (!res.ok) {
        const message = errorText(res?.status, resData?.substatus);
        setFilename(file?.name);
        setError(`${type}-${inputId}`, { type: 'custom', message });
      } else {
        // append({ name: file?.name, size: file?.size, vedleggId: resData });
      }
      setLoading(false);
    } catch (err: any) {
      const message = errorText(err?.status || 500);
      setFilename(file?.name);
      setError(`${type}-${inputId}`, { type: 'custom', message });
      setLoading(false);
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
        <Heading size={'medium'} level={'3'}>
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
              <div className={classes?.fileInputText}>
                <Link target={'_blank'}>{attachment?.name}</Link>
                <Detail>{fileSizeString(attachment?.size)}</Detail>
              </div>
            </div>
            <button
              type={'button'}
              onClick={() => {}}
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
      {errors?.[`${type}-${inputId}`]?.message && (
        <>
          <Panel
            id={`${type}-${inputId}`}
            className={`${classes?.fileCard} ${classes?.error}`}
            tabIndex={0}
          >
            <div className={classes?.fileCardLeftContent}>
              <div className={classes?.fileError}>
                <FileError color={'var(--a-surface-danger-hover)'} />
              </div>
              <div>
                <Label as={'span'}>{filename}</Label>
              </div>
            </div>
            <button
              type={'button'}
              onClick={() => {
                setFilename(undefined);
                clearErrors(`${type}-${inputId}`);
              }}
              tabIndex={0}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  setFilename(undefined);
                  clearErrors(`${type}-${inputId}`);
                }
              }}
              className={classes?.deleteAttachment}
            >
              <Cancel title={'Avbryt'} />
              <BodyShort>{'Avbryt'}</BodyShort>
            </button>
          </Panel>
          <div className={'navds-error-message navds-error-message--medium navds-label'}>
            {errors?.[`${type}-${inputId}`]?.message}
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
                <SvgUpload title="" aria-hidden />
                Velg dine filer for {heading.toLowerCase()}
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  );
};
export default FieldArrayFileInput;
