import React from 'react';
import * as classes from './Panel.module.css';
interface Props {
  children?: React.ReactChild | React.ReactChild[];
}

const ColorPanel = ({ children }: Props) => {
  return <div className={classes?.panelGrey}>{children}</div>;
};
export default ColorPanel;
