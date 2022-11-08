import { Accordion, Alert, BodyShort, Button, Heading, Label, Link } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from 'components/input/ConfirmationPanelWrapper';
import { SøkerView } from 'context/sokerOppslagContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './Veiledning.module.css';
import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';

const VEILEDNING_CONFIRM = 'veiledningConfirm';
type VeiledningType = {
  veiledningConfirm?: boolean;
};
const initVeiledning: VeiledningType = {
  veiledningConfirm: false,
};
interface VeiledningProps {
  søker: SøkerView;
  isLoading: boolean;
  hasError: boolean;
  errorMessageRef: React.MutableRefObject<HTMLDivElement | null>;
  onSubmit: () => void;
}
export const Veiledning = ({
  søker,
  isLoading,
  hasError,
  errorMessageRef,
  onSubmit,
}: VeiledningProps) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    veiledningConfirm: yup
      .boolean()
      .required(formatMessage('søknad.veiledning.veiledningConfirm.validation.required'))
      .oneOf([true])
      .nullable(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VeiledningType>({
    resolver: yupResolver(schema),
    defaultValues: { ...initVeiledning },
  });
  return (
    <>
      <header className={classes?.veiledningHeader}>
        <Heading size="large" level="1">
          {formatMessage(`søknad.veiledning.title`)}
        </Heading>
      </header>
      <main className={classes?.veiledningContent}>
        <div aria-live="polite" ref={errorMessageRef}>
          {hasError && (
            <Alert variant="error">
              Det kan dessverre se ut til at vi har noen tekniske problemer akkurat nå. Prøv igjen
              senere.
            </Alert>
          )}
        </div>

        <LucaGuidePanel>
          <Heading size="medium" level="2" spacing>
            {formatMessage('søknad.veiledning.guide.title', { name: søker.fulltNavn })}
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
          <BodyShort spacing>{formatMessage('søknad.veiledning.søknadsdato.text3')}</BodyShort>
        </article>
        <article>
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>
                {formatMessage('søknad.veiledning.accordionHvis.title')}
              </Accordion.Header>
              <Accordion.Content>
                <ul>
                  <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointOppfølging')}</li>
                  <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointPlikt')}</li>
                  <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointMeldekort')}</li>
                  <li>
                    {formatMessage('søknad.veiledning.accordionHvis.bulletPointTilbakebetaling')}
                  </li>
                  <li>{formatMessage('søknad.veiledning.accordionHvis.bulletPointBeskjed')}</li>
                </ul>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>
                {formatMessage('søknad.veiledning.accordionInformasjon.title')}
              </Accordion.Header>
              <Accordion.Content>
                <BodyShort spacing>
                  {formatMessage('søknad.veiledning.accordionInformasjon.informasjonDuOppgir')}
                </BodyShort>
                <ul>
                  <li>
                    {formatMessage(
                      'søknad.veiledning.accordionInformasjon.bulletPointPersoninformasjon'
                    )}
                  </li>
                  <li>{formatMessage('søknad.veiledning.accordionInformasjon.bulletPontSkatt')}</li>
                  <li>
                    {formatMessage('søknad.veiledning.accordionInformasjon.bulletpointHelse')}
                  </li>
                  <li>
                    {formatMessage('søknad.veiledning.accordionInformasjon.bulletPointArbeid')}
                  </li>
                  <li>
                    {formatMessage(
                      'søknad.veiledning.accordionInformasjon.bulletPointAndreOpplysninger'
                    )}
                  </li>
                </ul>

                <BodyShort spacing>
                  {formatMessage('søknad.veiledning.accordionInformasjon.folketrygdloven')}
                </BodyShort>
                <ul>
                  <li>
                    {formatMessage('søknad.veiledning.accordionInformasjon.bulletPointDeler')}
                  </li>
                  <li>
                    {formatMessage('søknad.veiledning.accordionInformasjon.bulletPointForbedre')}
                  </li>
                </ul>

                <Link href={formatMessage('applinks.personOpplysninger')} target={'_blank'}>
                  {formatMessage('søknad.veiledning.accordionInformasjon.personopplysningerNavNo')}
                </Link>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </article>

        <form
          onSubmit={handleSubmit(async () => {
            await onSubmit();
          })}
          className={classes?.veiledningContent}
          autoComplete="off"
        >
          <ConfirmationPanelWrapper
            label={formatMessage('søknad.veiledning.veiledningConfirm.label')}
            control={control}
            name={VEILEDNING_CONFIRM}
            error={errors?.[VEILEDNING_CONFIRM]?.message}
          >
            <Label as={'span'}>{formatMessage('søknad.veiledning.veiledningConfirm.title')}</Label>
          </ConfirmationPanelWrapper>

          <div>
            <Button variant="primary" type="submit" loading={isLoading}>
              {formatMessage(`søknad.veiledning.startSøknad`)}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};
