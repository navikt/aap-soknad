import { BodyLong, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { scrollRefIntoView } from '../../../../../utils/dom';
import { ScanningGuide as ScanningGuideAAP } from '@navikt/aap-felles-react';

export const ScanningGuide = () => {
  const { formatMessage, locale } = useIntl();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);

  useEffect(() => {
    if (scanningGuideOpen) {
      if (scanningGuideElement?.current != null) scrollRefIntoView(scanningGuideElement);
    }
  }, [scanningGuideOpen]);
  return (
    <div>
      <BodyLong>{formatMessage({ id: 'søknad.vedlegg.vedleggPåPapir.text' })}</BodyLong>
      <ReadMore
        header={formatMessage({ id: 'søknad.vedlegg.vedleggPåPapir.readMore.title' })}
        type={'button'}
        open={scanningGuideOpen}
        onClick={() => setScanningGuideOpen(!scanningGuideOpen)}
        ref={scanningGuideElement}
      >
        <ScanningGuideAAP locale={locale} />
      </ReadMore>
    </div>
  );
};
