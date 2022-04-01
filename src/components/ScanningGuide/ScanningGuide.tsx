import React from 'react';
import { Alert, BodyLong, BodyShort, Heading, Label } from '@navikt/ds-react';
import ScanningIcon from '../ScanningIcon';
import { Error, Success } from '@navikt/ds-icons';
import * as classes from './ScanningGuide.module.css';
import { GetText } from '../../hooks/useTexts';
interface Props {
  className?: string;
  getText: GetText;
}

const ColorPanel = ({ className, getText }: Props) => {
  return (
    <Alert className={className} variant={'info'}>
      <article>
        <Heading size={'medium'} level={'2'}>
          {getText('scanningGuide.before.heading')}
        </Heading>
        <BodyLong>
          <ul>
            <li>{getText('scanningGuide.before.bullet1')}</li>
            <li>{getText('scanningGuide.before.bullet2')}</li>
            <li>{getText('scanningGuide.before.bullet3')}</li>
          </ul>
        </BodyLong>
        <Heading size={'medium'} level={'2'}>
          {getText('scanningGuide.after.heading')}
        </Heading>
        <BodyLong>
          <ul>
            <li>{getText('scanningGuide.after.bullet1')}</li>
            <li>{getText('scanningGuide.after.bullet2')}</li>
            <li>{getText('scanningGuide.after.bullet3')}</li>
          </ul>
        </BodyLong>
        <Heading size={'medium'} level={'2'}>
          {getText('scanningGuide.examples.heading')}
        </Heading>
      </article>
      <div className={classes?.scanningExamples}>
        <div className={classes?.scanningExample}>
          <ScanningIcon status={'good'} title={'Bra'} />
          <span className={classes?.scanningExampleStatus}>
            <Success color={'var(--navds-global-color-green-600)'} />
            <Label>{getText('scanningGuide.examples.good.label')}</Label>
          </span>
          <BodyShort>{getText('scanningGuide.examples.good.description')}</BodyShort>
        </div>
        <div className={classes?.scanningExample}>
          <ScanningIcon status={'keystone'} title={'Dårlig'} />
          <span className={classes?.scanningExampleStatus}>
            <Error color={'var(--navds-global-color-nav-red)'} />
            <Label>{getText('scanningGuide.examples.keystone.label')}</Label>
          </span>
          <BodyShort>{getText('scanningGuide.examples.keystone.description')}</BodyShort>
        </div>
        <div className={classes?.scanningExample}>
          <ScanningIcon status={'horizontal'} title={'Dårlig'} />
          <span className={classes?.scanningExampleStatus}>
            <Error color={'var(--navds-global-color-nav-red)'} />
            <Label>{getText('scanningGuide.examples.horizontal.label')}</Label>
          </span>
          <BodyShort>{getText('scanningGuide.examples.horizontal.description')}</BodyShort>
        </div>
        <div className={classes?.scanningExample}>
          <ScanningIcon status={'shadow'} title={'Dårlig'} />
          <span className={classes?.scanningExampleStatus}>
            <Error color={'var(--navds-global-color-nav-red)'} />
            <Label>{getText('scanningGuide.examples.shadow.label')}</Label>
          </span>
          <BodyShort>{getText('scanningGuide.examples.shadow.description')}</BodyShort>
        </div>
      </div>
    </Alert>
  );
};
export default ColorPanel;
