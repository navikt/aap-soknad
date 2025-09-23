import { BodyLong, BodyShort, Label, ReadMore } from '@navikt/ds-react';
import { CheckmarkCircleIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import ScanningIcon from 'components/pageComponents/standard/Vedlegg/scanningguide/ScanningIcon';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { scrollRefIntoView } from 'utils/dom';

export const ScanningGuide = () => {
  const { formatMessage } = useIntl();
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
        <div className={'scanning-guide'}>
          <article>
            <Label as="p" spacing>
              {formatMessage({ id: 'scanningGuide.alert.takePictureTitle' })}
            </Label>
            <ul>
              <li>{formatMessage({ id: 'scanningGuide.alert.bulletPointTakePicture1' })}</li>
              <li>{formatMessage({ id: 'scanningGuide.alert.bulletPointTakePicture2' })}</li>
              <li>{formatMessage({ id: 'scanningGuide.alert.bulletPointTakePicture3' })}</li>
            </ul>
            <Label as="p" spacing>
              {formatMessage({ id: 'scanningGuide.alert.checkPictureTitle' })}
            </Label>
            <ul>
              <li>{formatMessage({ id: 'scanningGuide.alert.bulletPointCheckPicture1' })}</li>
              <li>{formatMessage({ id: 'scanningGuide.alert.bulletPointCheckPicture2' })}</li>
              <li>{formatMessage({ id: 'scanningGuide.alert.bulletPointCheckPicture3' })}</li>
            </ul>
            <Label as="p" spacing>
              {formatMessage({ id: 'scanningGuide.alert.examplesPicturesTitle' })}
            </Label>
          </article>
          <ul className={'scanning-examples'}>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'good'}
                title={formatMessage({ id: 'scanningGuide.alert.exampleLabelGood' })}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <CheckmarkCircleIcon color={'var(--a-green-600)'} />
                  <Label as="span">
                    {formatMessage({ id: 'scanningGuide.alert.exampleLabelGood' })}
                  </Label>
                </span>
                <BodyShort>{formatMessage({ id: 'scanningGuide.alert.exampleGood' })}</BodyShort>
              </div>
            </li>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'keystone'}
                title={formatMessage({ id: 'scanningGuide.alert.exampleLabelBad' })}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <XMarkOctagonIcon color={'var(--a-nav-red)'} />
                  <Label as="span">
                    {formatMessage({ id: 'scanningGuide.alert.exampleLabelBad' })}
                  </Label>
                </span>
                <BodyShort>
                  {formatMessage({ id: 'scanningGuide.alert.exampleKeystone' })}
                </BodyShort>
              </div>
            </li>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'horizontal'}
                title={formatMessage({ id: 'scanningGuide.alert.exampleLabelBad' })}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <XMarkOctagonIcon color={'var(--a-nav-red)'} />
                  <Label as="span">
                    {formatMessage({ id: 'scanningGuide.alert.exampleLabelBad' })}
                  </Label>
                </span>
                <BodyShort>
                  {formatMessage({ id: 'scanningGuide.alert.exampleHorizontal' })}
                </BodyShort>
              </div>
            </li>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'shadow'}
                title={formatMessage({ id: 'scanningGuide.alert.exampleLabelBad' })}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <XMarkOctagonIcon color={'var(--a-nav-red)'} />
                  <Label as="span">
                    {formatMessage({ id: 'scanningGuide.alert.exampleLabelBad' })}
                  </Label>
                </span>
                <BodyShort>{formatMessage({ id: 'scanningGuide.alert.exampleShaddow' })}</BodyShort>
              </div>
            </li>
          </ul>
        </div>
      </ReadMore>
    </div>
  );
};
