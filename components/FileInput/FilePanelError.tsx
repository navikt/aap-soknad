import { BodyShort, Label, Panel } from '@navikt/ds-react';
import { ArrowUndoIcon, FileTextIcon } from '@navikt/aksel-icons';
import React from 'react';
import { Vedlegg } from './FileInput';

interface Props {
  file: Vedlegg;
  onDelete: () => void;
}

export const FilePanelError = ({ file, onDelete }: Props) => {
  return (
    <>
      <Panel className={'fileCard error'} tabIndex={0}>
        <div className={'fileCardLeftContent'}>
          <div className={'fileError'}>
            <FileTextIcon color={'var(--a-surface-danger-hover)'} />
          </div>
          <div>
            <Label as={'span'}>{file.name}</Label>
          </div>
        </div>
        <button type={'button'} onClick={onDelete} tabIndex={0} className={'deleteAttachment'}>
          <ArrowUndoIcon title={'Avbryt'} />
          <BodyShort>{'Avbryt'}</BodyShort>
        </button>
      </Panel>
      <div className={'navds-error-message navds-error-message--medium navds-label'}>{file.errorMessage}</div>
    </>
  );
};
