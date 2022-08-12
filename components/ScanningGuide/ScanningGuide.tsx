import React from 'react';
import { Alert, BodyLong, BodyShort, Heading, Label } from '@navikt/ds-react';
import ScanningIcon from '../ScanningIcon';
import { Error, Success } from '@navikt/ds-icons';
import * as classes from './ScanningGuide.module.css';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
interface Props {
  className?: string;
}

const ColorPanel = ({ className }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  return (
    <Alert className={className} variant={'info'}>
      <article>
        <Heading size={'medium'} level={'2'}>
          {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.takePictureTitle')}
        </Heading>
        <BodyLong>
          <ul>
            <li>
              {formatMessage(
                'søknad.vedlegg.vedleggPåPapir.readMore.alert.bulletPointTakePicture1'
              )}
            </li>
            <li>
              {formatMessage(
                'søknad.vedlegg.vedleggPåPapir.readMore.alert.bulletPointTakePicture2'
              )}
            </li>
            <li>
              {formatMessage(
                'søknad.vedlegg.vedleggPåPapir.readMore.alert.bulletPointTakePicture3'
              )}
            </li>
          </ul>
        </BodyLong>
        <Heading size={'medium'} level={'2'}>
          {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.checkPictureTitle')}
        </Heading>
        <BodyLong>
          <ul>
            <li>
              {formatMessage(
                'søknad.vedlegg.vedleggPåPapir.readMore.alert.bulletPointCheckPicture1'
              )}
            </li>
            <li>
              {formatMessage(
                'søknad.vedlegg.vedleggPåPapir.readMore.alert.bulletPointCheckPicture2'
              )}
            </li>
            <li>
              {formatMessage(
                'søknad.vedlegg.vedleggPåPapir.readMore.alert.bulletPointCheckPicture3'
              )}
            </li>
          </ul>
        </BodyLong>
        <Heading size={'medium'} level={'2'}>
          {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.examplesPicturesTitle')}
        </Heading>
      </article>
      <div className={classes?.scanningExamples}>
        <div className={classes?.scanningExample}>
          <ScanningIcon
            status={'good'}
            title={formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelGood')}
          />
          <span className={classes?.scanningExampleStatus}>
            <Success color={'var(--navds-global-color-green-600)'} />
            <Label>
              {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelGood')}
            </Label>
          </span>
          <BodyShort>
            {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleGood')}
          </BodyShort>
        </div>
        <div className={classes?.scanningExample}>
          <ScanningIcon
            status={'keystone'}
            title={formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelBad')}
          />
          <span className={classes?.scanningExampleStatus}>
            <Error color={'var(--navds-global-color-nav-red)'} />
            <Label>
              {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelBad')}
            </Label>
          </span>
          <BodyShort>
            {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleKeystone')}
          </BodyShort>
        </div>
        <div className={classes?.scanningExample}>
          <ScanningIcon
            status={'horizontal'}
            title={formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelBad')}
          />
          <span className={classes?.scanningExampleStatus}>
            <Error color={'var(--navds-global-color-nav-red)'} />
            <Label>
              {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelBad')}
            </Label>
          </span>
          <BodyShort>
            {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleHorizontal')}
          </BodyShort>
        </div>
        <div className={classes?.scanningExample}>
          <ScanningIcon
            status={'shadow'}
            title={formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelBad')}
          />
          <span className={classes?.scanningExampleStatus}>
            <Error color={'var(--navds-global-color-nav-red)'} />
            <Label>
              {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleLabelBad')}
            </Label>
          </span>
          <BodyShort>
            {formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.alert.exampleShaddow')}
          </BodyShort>
        </div>
      </div>
    </Alert>
  );
};
export default ColorPanel;
