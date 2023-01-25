import React, { DragEventHandler, useRef, useState } from 'react';
import * as classes from './FileInput.module.css';
import { Upload as SvgUpload } from '@navikt/ds-icons';
import { ArrayPath } from 'react-hook-form';
import { FormFields } from '../../pageComponents/standard/Vedlegg/Vedlegg';

interface Props {
  name: ArrayPath<FormFields>;
  handleUpload: (e: File) => void;
  title: string;
}

export const FileInput = (props: Props) => {
  const { name, handleUpload, title } = props;
  const [dragOver, setDragOver] = useState(false);
  const fileUploadInputElement = useRef<HTMLInputElement>(null);

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
    const files = e.dataTransfer.files[0];
    handleUpload(files);
  };

  return (
    <div
      className={`${classes?.dropZone} ${dragOver ? classes?.dragOver : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e)}
    >
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
        <span
          /* eslint-disable-next-line max-len */
          className={`${classes?.fileInputButton} navds-button navds-button__inner navds-body-short navds-button--secondary`}
          aria-controls={name}
          role={'button'}
          tabIndex={0}
          onKeyPress={(e) => {
            e.preventDefault();
            fileUploadInputElement.current && fileUploadInputElement.current.click();
          }}
        >
          <SvgUpload title="" aria-hidden />
          Velg dine filer for {title}
        </span>
      </label>
    </div>
  );
};
