import React, { useMemo } from 'react';
import * as classes from './Panel.module.css';
interface Props {
  children?: React.ReactChild | React.ReactChild[];
  className?: string;
  color?: 'grey';
  padding: boolean;
}

const ColorPanel = ({ children, className, color, padding = true }: Props) => {
  const colorClass = useMemo(() => {
    switch (color) {
      case 'grey':
        return 'panelGrey';
      default:
        return 'panelWhite';
    }
  }, [color]);
  return (
    <div
      className={`${classes?.colorPanel} ${className} ${classes?.[colorClass]} ${
        padding && classes?.panelPadding
      }`}
    >
      {children}
    </div>
  );
};
export default ColorPanel;
