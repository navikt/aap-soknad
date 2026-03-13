'use client';
import { BodyShort, Heading, Link } from '@navikt/ds-react';
import { useTranslations } from 'next-intl';
import { AmplitudeAwareAccordion } from '../AmplitudeAwareAccordion/AmplitudeAwareAccordion';
import { LucaGuidePanel } from 'components/LucaGuidePanel';

export const IntroduksjonTekst = ({ navn }: { navn?: string }) => {
  const t = useTranslations();

  return (
    <>
      <LucaGuidePanel>
        <Heading size="medium" level="2" spacing>
          {t('søknad.veiledning.guide.title', { name: navn ?? '' })}
        </Heading>
        <BodyShort spacing>{t('søknad.veiledning.guide.text1')}</BodyShort>
        <BodyShort spacing>{t('søknad.veiledning.guide.text2')}</BodyShort>
        <BodyShort spacing>{t('søknad.veiledning.guide.text3')}</BodyShort>
      </LucaGuidePanel>
      <article>
        <Heading size={'small'} level={'2'} spacing>
          {t('søknad.veiledning.søknadsdato.title')}
        </Heading>
        <BodyShort spacing>
          {t('søknad.veiledning.søknadsdato.text1')}
        </BodyShort>
        <BodyShort spacing>
          {t('søknad.veiledning.søknadsdato.text2')}
        </BodyShort>
      </article>
      <article>
        <AmplitudeAwareAccordion
          title={t('søknad.veiledning.accordionHvis.title')}
        >
          <ul>
            <li>
              {t('søknad.veiledning.accordionHvis.bulletPointOppfølging')}
            </li>
            <li>{t('søknad.veiledning.accordionHvis.bulletPointPlikt')}</li>
            <li>{t('søknad.veiledning.accordionHvis.bulletPointMeldekort')}</li>
            <li>
              {t('søknad.veiledning.accordionHvis.bulletPointTilbakebetaling')}
            </li>
            <li>{t('søknad.veiledning.accordionHvis.bulletPointBeskjed')}</li>
          </ul>
        </AmplitudeAwareAccordion>
        <AmplitudeAwareAccordion
          title={t('søknad.veiledning.accordionInformasjon.title')}
        >
          <BodyShort spacing>
            {t('søknad.veiledning.accordionInformasjon.informasjonDuOppgir')}
          </BodyShort>
          <ul>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletPointPersoninformasjon')}
            </li>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletPontSkatt')}
            </li>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletpointHelse')}
            </li>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletPointArbeid')}
            </li>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletPointAndreOpplysninger')}
            </li>
          </ul>

          <BodyShort spacing>
            {t('søknad.veiledning.accordionInformasjon.folketrygdloven')}
          </BodyShort>
          <ul>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletPointLagring')}
            </li>
            <li>
              {t('søknad.veiledning.accordionInformasjon.bulletPointDeler')}
            </li>
          </ul>

          <Link href={t('applinks.personOpplysninger')} target={'_blank'}>
            {t('søknad.veiledning.accordionInformasjon.personopplysningerNavNo')}
          </Link>
        </AmplitudeAwareAccordion>
      </article>
    </>
  );
};
