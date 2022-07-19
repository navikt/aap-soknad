import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import React, { useMemo } from 'react';

export const useFeatureToggleIntl = () => {
  const intl = useIntl();
  //const [searchParams] = useSearchParams();
  //const isShowKeys = useMemo(() => searchParams.has('showKeys'), [searchParams]);

  const formatMessage = (id: string, values?: Record<string, string | undefined>) =>
    //isShowKeys
    //  ? `${id}:${intl.formatMessage({ id: id }, values)}`
    //  :
    intl.formatMessage({ id: id }, values);
  const formatElement = (
    id: string,
    values?:
      | Record<
          string,
          string | number | boolean | {} | Date | React.ReactElement<any, any> | undefined
        >
      | undefined
  ) =>
    //isShowKeys ? (
    //  <>
    //    {id}:{intl.formatMessage({ id: id }, values)}
    //  </>
    //) : (
    intl.formatMessage({ id: id }, values);
  //);
  return { formatMessage, formatElement };
};
