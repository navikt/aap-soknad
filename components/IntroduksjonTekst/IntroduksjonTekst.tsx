import { Accordion, BodyShort, Heading, Link } from '@navikt/ds-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { Events } from '@navikt/analytics-types';

export const IntroduksjonTekst = ({ navn }: { navn?: string }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <LucaGuidePanel>
        <Heading size="medium" level="2" spacing>
          <FormattedMessage id={'søknad.veiledning.guide.title'} values={{ name: navn }} />
        </Heading>
        <BodyShort spacing>{formatMessage({ id: 'søknad.veiledning.guide.text1' })}</BodyShort>
        <BodyShort spacing>{formatMessage({ id: 'søknad.veiledning.guide.text2' })}</BodyShort>
        <BodyShort spacing>{formatMessage({ id: 'søknad.veiledning.guide.text3' })}</BodyShort>
      </LucaGuidePanel>
      <article>
        <Heading size={'small'} level={'2'} spacing>
          {formatMessage({ id: 'søknad.veiledning.søknadsdato.title' })}
        </Heading>
        <BodyShort spacing>
          {formatMessage({ id: 'søknad.veiledning.søknadsdato.text1' })}
        </BodyShort>
        <BodyShort spacing>
          {formatMessage({ id: 'søknad.veiledning.søknadsdato.text2' })}
        </BodyShort>
      </article>
      <article>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header
              data-sporing-event={Events.ACCORDION_APNET}
              data-sporing-event-tekst={'hvis du får AAP gjelder dette'}
            >
              {formatMessage({ id: 'søknad.veiledning.accordionHvis.title' })}
            </Accordion.Header>
            <Accordion.Content>
              <ul>
                <li>
                  {formatMessage({ id: 'søknad.veiledning.accordionHvis.bulletPointOppfølging' })}
                </li>
                <li>{formatMessage({ id: 'søknad.veiledning.accordionHvis.bulletPointPlikt' })}</li>
                <li>
                  {formatMessage({ id: 'søknad.veiledning.accordionHvis.bulletPointMeldekort' })}
                </li>
                <li>
                  {formatMessage({
                    id: 'søknad.veiledning.accordionHvis.bulletPointTilbakebetaling',
                  })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.veiledning.accordionHvis.bulletPointBeskjed' })}
                </li>
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header
              data-sporing-event={Events.ACCORDION_APNET}
              data-sporing-event-tekst={'vi vil hente og bruke informasjon om deg'}
            >
              {formatMessage({ id: 'søknad.veiledning.accordionInformasjon.title' })}
            </Accordion.Header>
            <Accordion.Content>
              <BodyShort spacing>
                {formatMessage({
                  id: 'søknad.veiledning.accordionInformasjon.informasjonDuOppgir',
                })}
              </BodyShort>
              <ul>
                <li>
                  {formatMessage({
                    id: 'søknad.veiledning.accordionInformasjon.bulletPointPersoninformasjon',
                  })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.veiledning.accordionInformasjon.bulletPontSkatt' })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.veiledning.accordionInformasjon.bulletpointHelse' })}
                </li>
                <li>
                  {formatMessage({
                    id: 'søknad.veiledning.accordionInformasjon.bulletPointArbeid',
                  })}
                </li>
                <li>
                  {formatMessage({
                    id: 'søknad.veiledning.accordionInformasjon.bulletPointAndreOpplysninger',
                  })}
                </li>
              </ul>

              <BodyShort spacing>
                {formatMessage({ id: 'søknad.veiledning.accordionInformasjon.folketrygdloven' })}
              </BodyShort>
              <ul>
                <li>
                  {formatMessage({
                    id: 'søknad.veiledning.accordionInformasjon.bulletPointLagring',
                  })}
                </li>
                <li>
                  {formatMessage({ id: 'søknad.veiledning.accordionInformasjon.bulletPointDeler' })}
                </li>
              </ul>

              <Link
                href={formatMessage({ id: 'applinks.personOpplysninger' })}
                target={'_blank'}
                data-sporing-event={Events.NAVIGERE}
                data-sporing-event-lenketekst={
                  'Du kan lese mer om hvordan Nav behandler personopplysninger på nav.no'
                }
              >
                {formatMessage({
                  id: 'søknad.veiledning.accordionInformasjon.personopplysningerNavNo',
                })}
              </Link>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </article>
    </>
  );
};
