import React from 'react';
import * as classes from './Panel.module.css';
interface Props {
  children?: React.ReactChild | React.ReactChild[];
  className?: string;
}

const ColorPanel = ({ children, className }: Props) => {
  return <div className={`${classes?.panelGrey} ${className}`}>{children}</div>;
};
export default ColorPanel;
