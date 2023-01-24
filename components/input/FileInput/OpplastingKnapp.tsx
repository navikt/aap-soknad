import React, { useRef } from 'react';
import * as classes from './FileInput.module.css';
import { Upload as SvgUpload } from '@navikt/ds-icons';

interface Props {
  name: string;
  handleUpload: (e: File) => void;
  title: string;
}

export const OpplastingKnapp = (props: Props) => {
  const { name, handleUpload, title } = props;
  const fileUploadInputElement = useRef<HTMLInputElement>(null);
  return (
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
    </>
  );
};
