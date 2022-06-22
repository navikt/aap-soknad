import React from 'react';
import { Heading, Loader } from '@navikt/ds-react';
import { HeadingProps } from '@navikt/ds-react/esm/typography/Heading';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';

type Props = {
  level: HeadingProps['level'];
  size: HeadingProps['size'];
  name?: string;
  loading: boolean;
};

const HeadingHelloName = ({ level, size, name, loading }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  return (
    <Heading size={size} level={level} spacing>
      {loading ? <Loader /> : formatMessage('søknad.veiledning.guide.title', { name: name })}
    </Heading>
  );
};

export default HeadingHelloName;
