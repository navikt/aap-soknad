import React from 'react';
import { BodyShort, Label, Panel } from '@navikt/ds-react';
import * as classes from './FileInput.module.css';
import { Cancel, FileError } from '@navikt/ds-icons';
import { Vedlegg } from '../../../types/Soknad';

interface Props {
  vedlegg: Vedlegg;
  remove: () => Promise<void>;
}

export const FileCardError = (props: Props) => {
  const { vedlegg, remove } = props;

  return (
    <Panel className={`${classes?.fileCard} ${classes?.error}`} tabIndex={0}>
      <div className={classes?.fileCardLeftContent}>
        <div className={classes?.fileError}>
          <FileError color={'var(--a-surface-danger-hover)'} />
        </div>
        <div>
          <Label as={'span'}>{vedlegg.name}</Label>
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
        className={classes?.deleteAttachment}
      >
        <Cancel title={'Avbryt'} />
        <BodyShort>{'Avbryt'}</BodyShort>
      </button>
    </Panel>
  );
};
