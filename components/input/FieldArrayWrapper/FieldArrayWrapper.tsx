import React from 'react';
import * as classes from './FieldArrayWrapper.module.css';

interface Props {
  children?: React.ReactChild | React.ReactChild[];
}

const FieldArrayWrapper = ({ children }: Props) => {
  return <div className={classes?.fieldArrayMainContent}>{children}</div>;
};
export default FieldArrayWrapper;
