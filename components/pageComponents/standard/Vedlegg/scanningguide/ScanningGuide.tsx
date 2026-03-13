'use client';
import { BodyLong, BodyShort, Label, ReadMore } from '@navikt/ds-react';
import { CheckmarkCircleIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import ScanningIcon from 'components/pageComponents/standard/Vedlegg/scanningguide/ScanningIcon';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { scrollRefIntoView } from 'utils/dom';

export const ScanningGuide = () => {
  const t = useTranslations();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);

  useEffect(() => {
    if (scanningGuideOpen) {
      if (scanningGuideElement?.current != null) scrollRefIntoView(scanningGuideElement);
    }
  }, [scanningGuideOpen]);
  return (
    <div>
      <BodyLong>{t('søknad.vedlegg.vedleggPåPapir.text')}</BodyLong>
      <ReadMore
        header={t('søknad.vedlegg.vedleggPåPapir.readMore.title')}
        type={'button'}
        open={scanningGuideOpen}
        onClick={() => setScanningGuideOpen(!scanningGuideOpen)}
        ref={scanningGuideElement}
      >
        <div className={'scanning-guide'}>
          <article>
            <Label as="p" spacing>
              {t('scanningGuide.alert.takePictureTitle')}
            </Label>
            <ul>
              <li>{t('scanningGuide.alert.bulletPointTakePicture1')}</li>
              <li>{t('scanningGuide.alert.bulletPointTakePicture2')}</li>
              <li>{t('scanningGuide.alert.bulletPointTakePicture3')}</li>
            </ul>
            <Label as="p" spacing>
              {t('scanningGuide.alert.checkPictureTitle')}
            </Label>
            <ul>
              <li>{t('scanningGuide.alert.bulletPointCheckPicture1')}</li>
              <li>{t('scanningGuide.alert.bulletPointCheckPicture2')}</li>
              <li>{t('scanningGuide.alert.bulletPointCheckPicture3')}</li>
            </ul>
            <Label as="p" spacing>
              {t('scanningGuide.alert.examplesPicturesTitle')}
            </Label>
          </article>
          <ul className={'scanning-examples'}>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'good'}
                title={t('scanningGuide.alert.exampleLabelGood')}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <CheckmarkCircleIcon color={'var(--a-green-600)'} />
                  <Label as="span">
                    {t('scanningGuide.alert.exampleLabelGood')}
                  </Label>
                </span>
                <BodyShort>{t('scanningGuide.alert.exampleGood')}</BodyShort>
              </div>
            </li>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'keystone'}
                title={t('scanningGuide.alert.exampleLabelBad')}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <XMarkOctagonIcon color={'var(--a-nav-red)'} />
                  <Label as="span">
                    {t('scanningGuide.alert.exampleLabelBad')}
                  </Label>
                </span>
                <BodyShort>
                  {t('scanningGuide.alert.exampleKeystone')}
                </BodyShort>
              </div>
            </li>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'horizontal'}
                title={t('scanningGuide.alert.exampleLabelBad')}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <XMarkOctagonIcon color={'var(--a-nav-red)'} />
                  <Label as="span">
                    {t('scanningGuide.alert.exampleLabelBad')}
                  </Label>
                </span>
                <BodyShort>
                  {t('scanningGuide.alert.exampleHorizontal')}
                </BodyShort>
              </div>
            </li>
            <li className={'scanning-example'}>
              <ScanningIcon
                status={'shadow'}
                title={t('scanningGuide.alert.exampleLabelBad')}
              />
              <div className="scanning-example-item">
                <span className={'scanning-example-status'}>
                  <XMarkOctagonIcon color={'var(--a-nav-red)'} />
                  <Label as="span">
                    {t('scanningGuide.alert.exampleLabelBad')}
                  </Label>
                </span>
                <BodyShort>{t('scanningGuide.alert.exampleShaddow')}</BodyShort>
              </div>
            </li>
          </ul>
        </div>
      </ReadMore>
    </div>
  );
};
