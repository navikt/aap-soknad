import React, { useEffect, useState } from 'react';
import { BodyLong } from '@navikt/ds-react';

type Props = {
  text?: string;
  children?: React.ReactChild | React.ReactChild[];
};

const TextWithLink = ({ text, children }: Props) => {
  const [childrenList, setChildrenList] = useState<Array<any>>([]);
  useEffect(() => {
    setChildrenList(Array.isArray(children) ? [...children] : [children]);
  }, [children]);
  const textArray = text?.split('$') || [];
  return (
    <BodyLong>
      {textArray.map((el: any) => {
        if (el) {
          return el;
        } else {
          return childrenList.shift();
        }
      })}
    </BodyLong>
  );
};

export default TextWithLink;
