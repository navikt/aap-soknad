import React from 'react';
import { Heading, Loader } from '@navikt/ds-react';
import { HeadingProps } from '@navikt/ds-react/esm/typography/Heading';

type Props = {
  level: HeadingProps['level'];
  size: HeadingProps['size'];
  name?: string;
  loading: boolean;
};

const HeadingHelloName = ({ level, size, name, loading }: Props) => {
  return (
    <Heading size={size} level={level} spacing>
      {`Hei, ${name}`}
      {loading && <Loader />}
      {`!`}
    </Heading>
  );
};

export default HeadingHelloName;
