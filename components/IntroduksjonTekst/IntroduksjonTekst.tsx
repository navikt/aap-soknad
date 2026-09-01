import { Accordion, BodyShort, Heading, Link } from '@navikt/ds-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { sporAccordionApnet, sporLenkeKlikket } from 'lib/utils/umami';

export const IntroduksjonTekst = ({ navn }: { navn?: string }) => {
  const { formatMessage } = useIntl();
  const personopplysningerUrl = formatMessage({ id: 'applinks.personOpplysninger' });

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
          <Accordion.Item
            onOpenChange={(open) => open && sporAccordionApnet('hvis du får AAP gjelder dette')}
          >
            <Accordion.Header>
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
          <Accordion.Item
            onOpenChange={(open) =>
              open && sporAccordionApnet('vi vil hente og bruke informasjon om deg')
            }
          >
            <Accordion.Header>
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
                href={personopplysningerUrl}
                target={'_blank'}
                onClick={() =>
                  sporLenkeKlikket(
                    'Du kan lese mer om hvordan Nav behandler personopplysninger på nav.no',
                    personopplysningerUrl,
                  )
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
