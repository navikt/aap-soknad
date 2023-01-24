import React from 'react';
import * as styles from './FileInput.module.css';
import { Delete, FileSuccess } from '@navikt/ds-icons';
import { BodyShort, Detail, Link, Panel } from '@navikt/ds-react';
import { Vedlegg } from '../../../types/Soknad';

interface Props {
  vedlegg: Vedlegg;
  remove: () => Promise<void>;
}

export const FileCard = (props: Props) => {
  const { vedlegg, remove } = props;

  return (
    <Panel className={styles.fileCard}>
      <div className={styles?.fileCardLeftContent}>
        <div className={styles?.fileSuccess}>
          <FileSuccess color={'var(--a-icon-success)'} />
        </div>
        <div>
          <Link target={'_blank'} href={`/aap/soknad/vedlegg/${vedlegg?.vedleggId}`}>
            {vedlegg?.name}
          </Link>
          <Detail>{fileSizeString(vedlegg?.size)}</Detail>
        </div>
      </div>
      <button
        type={'button'}
        onClick={() => remove()}
        tabIndex={0}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            remove();
          }
        }}
        className={styles?.deleteAttachment}
      >
        <Delete title={'Slett'} />
        <BodyShort>{'Slett'}</BodyShort>
      </button>
    </Panel>
  );
};

function fileSizeString(size: number) {
  const kb = size / 1024;
  return kb > 1000 ? `${(kb / 1024).toFixed(1)} mB` : `${Math.floor(kb)} kB`;
}
