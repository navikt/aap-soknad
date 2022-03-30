import { BodyShort, Detail, Label, Panel } from '@navikt/ds-react';
import React, { DragEventHandler, useState } from 'react';
import SvgUpload from '@navikt/ds-icons/esm/Upload';
import * as classes from './FileInput.module.css';
import { FieldArray, FieldArrayMethodProps, FieldArrayWithId, FieldValues } from 'react-hook-form';
import { Delete, FileSuccess } from '@navikt/ds-icons';

export interface Props {
  fields: FieldArrayWithId[];
  append: (
    value: Partial<FieldArray<FieldValues, any>> | Partial<FieldArray<FieldValues, any>>[],
    options?: FieldArrayMethodProps
  ) => void;
  remove: (index?: number | number[] | undefined) => void;
  name: string;
}
const FileInput = ({ fields, append, remove, name }: Props) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
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
  const uploadFile = (file: any) => {
    const data = new FormData();
    data.append(name, file, file.name);
    console.log(file);
    append({ name: file.name, size: `${Math.round(file.size / 1024)} kB`, data });
    setDragOver(false);
  };
  return (
    <>
      <div
        className={`${classes?.dropZone} ${dragOver ? classes?.dragOver : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e)}
      >
        <input
          hidden
          id={'file-upload-input'}
          type="file"
          value={''}
          onChange={(e) => {
            const file = e?.target?.files?.[0];
            if (file) uploadFile(file);
          }}
        />
        <BodyShort>{'Dra og slipp'}</BodyShort>
        <BodyShort>{'eller'}</BodyShort>
        <label htmlFor={'file-upload-input'}>
          <span
            className={'navds-button navds-button__inner navds-body-short navds-button--secondary'}
          >
            <SvgUpload />
            {'Velg dine filer'}
          </span>
        </label>
      </div>
      {fields?.map((attachment, index) => {
        return (
          <Panel className={classes?.fileCard} key={attachment.id}>
            <div className={classes?.fileCardLeftContent}>
              <div className={classes?.fileSuccess}>
                <FileSuccess color={'var(--navds-semantic-color-feedback-success-icon)'} />
              </div>
              <div>
                <Label>{attachment?.name}</Label>
                <Detail>{attachment?.size}</Detail>
              </div>
            </div>
            <div className={classes?.deleteAttachment}>
              <Delete
                color={'var(--navds-global-color-nav-red)'}
                title={'Slett'}
                onClick={() => remove(index)}
              />
              <BodyShort>{'Slett'}</BodyShort>
            </div>
          </Panel>
        );
      })}
    </>
  );
};
export default FileInput;
