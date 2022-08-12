import React, { useEffect, useState } from 'react';
import { Link } from '@navikt/ds-react';

const TextWithLink = ({ text, links = [] }: { text: string; links: any[] }) => {
  const [childrenList, setChildrenList] = useState<Array<any>>([]);
  useEffect(() => {
    setChildrenList([...links]);
  }, [links]);
  const textArray = text?.split('$') || [];
  return (
    <>
      {textArray.map((el: any, index) => {
        if (el) {
          return el;
        } else {
          const link = childrenList.shift();
          return (
            <Link key={index} target={'_blank'} href={link?.href}>
              {link?.name}
            </Link>
          );
        }
      })}
    </>
  );
};

export default TextWithLink;
