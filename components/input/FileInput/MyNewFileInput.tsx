import React, { Ref, useRef, useState } from 'react';
import { ArrayPath, Control, useFieldArray } from 'react-hook-form';
import { Vedlegg } from '../../../types/Soknad';
import { FormFields } from '../../pageComponents/standard/StartDato/MyComponent';
import { BodyShort, Detail, Link, Loader, Panel } from '@navikt/ds-react';

import * as styles from './FileInput.module.css';
import * as classes from './FileInput.module.css';
import { Delete, FileSuccess, Upload as SvgUpload } from '@navikt/ds-icons';

interface Props {
  name: ArrayPath<FormFields>;
  control: Control<FormFields>;
  heading: string;
}

export const MyNewFileInput = (props: Props) => {
  const { name, control, heading } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const fileUploadInputElement = useRef<HTMLInputElement>(null);
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  });

  const initialVedlegg: Vedlegg = {
    vedleggId: '',
    name: '',
    size: '',
  };

  async function handleUpload(file: any) {
    const data = new FormData();
    data.append('vedlegg', file);
    append({ name: file?.name, size: file?.size, vedleggId: 'hdi' });
    // try {
    //   const res = await fetch('/aap/soknad/api/vedlegg/lagre/', { method: 'POST', body: data });
    //   const resData = await res.json();
    //   if (res.ok) {
    //     append({ name: file?.name, size: file?.size, vedleggId:  'hdi' });
    //   }
    // } catch (err: any) {}
  }

  return (
    <div className={styles.fileInput}>
      {fields.map((attachment, index) => (
        <Panel className={styles.fileCard} key={attachment.id}>
          <div className={classes?.fileCardLeftContent}>
            <div className={classes?.fileSuccess}>
              <FileSuccess color={'var(--a-icon-success)'} />
            </div>
            <div>
              <Link target={'_blank'} href={`/aap/soknad/vedlegg/${attachment?.vedleggId}`}>
                {attachment?.name}
              </Link>
              <Detail>{fileSizeString(Number(attachment?.size))}</Detail>
            </div>
          </div>
          <button
            type={'button'}
            onClick={() =>
              fetch(`/aap/soknad/api/vedlegg/slett/?uuids=${attachment?.vedleggId}`, {
                method: 'DELETE',
              }).then(() => {
                remove(index);
              })
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
      ))}
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
                if (file) handleUpload(file);
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
    </div>
  );
};

function fileSizeString(size: number) {
  const kb = size / 1024;
  return kb > 1000 ? `${(kb / 1024).toFixed(1)} mB` : `${Math.floor(kb)} kB`;
}
