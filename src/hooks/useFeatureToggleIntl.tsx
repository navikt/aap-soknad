import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export const useFeatureToggleIntl = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const isShowKeys = useMemo(() => searchParams.has('showKeys'), [searchParams]);

  const formatMessage = (id: string, values?: Record<string, string>) =>
    isShowKeys
      ? `${id}:${intl.formatMessage({ id: id }, values)}`
      : intl.formatMessage({ id: id }, values);
  return { formatMessage };
};
