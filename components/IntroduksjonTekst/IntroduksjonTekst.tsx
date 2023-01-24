import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { BodyShort, Heading, Link } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { AmplitudeAwareAccordion } from '../AmplitudeAwareAccordion/AmplitudeAwareAccordion';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';

export const IntroduksjonTekst = ({ navn }: { navn?: string }) => {
  const { formatMessage } = useFeatureToggleIntl();

  return (
    <>
      <LucaGuidePanel>
        <Heading size="medium" level="2" spacing>
          <FormattedMessage id={'søknad.veiledning.guide.title'} values={{ name: navn }} />
        </Heading>
        <BodyShort spacing>{formatMessage('søknad.veiledning.guide.text1')}</BodyShort>
        <BodyShort spacing>{formatMessage('søknad.veiledning.guide.text2')}</BodyShort>
        <BodyShort spacing>{formatMessage('søknad.veiledning.guide.text3')}</BodyShort>
      </LucaGuidePanel>
      <article>
        <Heading size={'small'} level={'2'} spacing>
          {formatMessage('søknad.veiledning.søknadsdato.title')}
        </Heading>
        <BodyShort spacing>{formatMessage('søknad.veiledning.søknadsdato.text1')}</BodyShort>
        <BodyShort spacing>{formatMessage('søknad.veiledning.søknadsdato.text2')}</BodyShort>
      </article>
      <article>
        <AmplitudeAwareAccordion title={formatMessage('søknad.veiledning.accordionHvis.title')}>
          <ul>
            <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointOppfølging')}</li>
            <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointPlikt')}</li>
            <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointMeldekort')}</li>
            <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointTilbakebetaling')}</li>
            <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointBeskjed')}</li>
          </ul>
        </AmplitudeAwareAccordion>
        <AmplitudeAwareAccordion
          title={formatMessage('søknad.veiledning.accordionInformasjon.title')}
        >
          <BodyShort spacing>
            {formatMessage('søknad.veiledning.accordionInformasjon.informasjonDuOppgir')}
          </BodyShort>
          <ul>
            <li>
              {formatMessage('søknad.veiledning.accordionInformasjon.bulletPointPersoninformasjon')}
            </li>
            <li>{formatMessage('søknad.veiledning.accordionInformasjon.bulletPontSkatt')}</li>
            <li>{formatMessage('søknad.veiledning.accordionInformasjon.bulletpointHelse')}</li>
            <li>{formatMessage('søknad.veiledning.accordionInformasjon.bulletPointArbeid')}</li>
            <li>
              {formatMessage('søknad.veiledning.accordionInformasjon.bulletPointAndreOpplysninger')}
            </li>
          </ul>

          <BodyShort spacing>
            {formatMessage('søknad.veiledning.accordionInformasjon.folketrygdloven')}
          </BodyShort>
          <ul>
            <li>{formatMessage('søknad.veiledning.accordionInformasjon.bulletPointDeler')}</li>
            <li>{formatMessage('søknad.veiledning.accordionInformasjon.bulletPointForbedre')}</li>
          </ul>

          <Link href={formatMessage('applinks.personOpplysninger')} target={'_blank'}>
            {formatMessage('søknad.veiledning.accordionInformasjon.personopplysningerNavNo')}
          </Link>
        </AmplitudeAwareAccordion>
      </article>
    </>
  );
};
