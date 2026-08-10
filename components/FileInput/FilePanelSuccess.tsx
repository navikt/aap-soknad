import { CheckmarkIcon, XMarkIcon } from '@navikt/aksel-icons';
import { BodyShort, Detail, Link, Panel } from '@navikt/ds-react';
import { Vedlegg } from './FileInput';

import styles from './FileInputInnsending.module.css';

interface Props {
  file: Vedlegg;
  deleteUrl: string;
  readAttachmentUrl: string;
  onDelete: () => void;
}

export const FilePanelSuccess = ({ file, onDelete, deleteUrl, readAttachmentUrl }: Props) => {
  return (
    <Panel className={styles.fileCard}>
      <div className={styles.fileCardLeftContent}>
        <div className={styles.fileSuccess}>
          <CheckmarkIcon color={'var(--a-icon-success)'} />
        </div>
        <div className={styles.fileInputText}>
          <Link target={'_blank'} href={`${readAttachmentUrl}${file.vedleggId}`}>
            {file.name}
          </Link>
          <Detail>{fileSizeString(file.size)}</Detail>
        </div>
      </div>
      <button
        onClick={async () => {
          const res = await fetch(`${deleteUrl}${file.vedleggId}`, { method: 'DELETE' });
          if (res.ok) {
            onDelete();
          }
        }}
        type={'button'}
        tabIndex={0}
        className={styles.deleteAttachment}
        data-testid={'slett-knapp'}
      >
        <XMarkIcon title={'Slett'} />
        <BodyShort>{'Slett'}</BodyShort>
      </button>
    </Panel>
  );
};

function fileSizeString(size: number) {
  const kb = size / 1024;
  return kb > 1000 ? `${(kb / 1024).toFixed(1)} mB` : `${Math.floor(kb)} kB`;
}
