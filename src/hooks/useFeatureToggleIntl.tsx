import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

export const useFeatureToggleIntl = () => {
  const intl = useIntl();
  const [hostname, setHostname] = useState<string>('');
  const [searchParams] = useSearchParams();
  const isShowKeys = useMemo(() => searchParams.has('showKeys'), [searchParams]);
  useEffect(
    () =>
      setHostname(
        window?.location?.hostname === 'localhost' ? 'dev.nav.no' : window.location.hostname
      ),
    []
  );

  const formatMessage = (id: string, values?: Record<string, string>) =>
    isShowKeys
      ? `${id}:${intl.formatMessage({ id: id }, values)}`
      : intl.formatMessage({ id: id }, values);
  const formatLink = (id: string) =>
    isShowKeys
      ? `${id}:${intl.formatMessage({ id: `applinks.${id}` }, { hostname })}`
      : intl.formatMessage({ id: `applinks.${id}` }, { hostname });
  return { formatMessage, formatLink };
};
