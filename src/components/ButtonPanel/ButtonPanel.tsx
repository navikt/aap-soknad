import React from 'react';
import { Expand } from '@navikt/ds-icons';
import * as classes from './ButtonPanel.module.css';

interface Props {
  children?: React.ReactChild | React.ReactChild[];
  onClick: () => void;
}

const ButtonPanel = ({ children, onClick }: Props) => {
  return (
    <button type={'button'} onClick={onClick} className={classes?.buttonPanel}>
      {children}
      <Expand />
    </button>
  );
};
export default ButtonPanel;
