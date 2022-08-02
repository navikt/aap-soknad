import { Accordion, BodyLong, BodyShort, Button, Heading, Label, Link } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../../components/input/ConfirmationPanelWrapper';
import HeadingHelloName from '../../../components/async/HeadingHelloName';
import { SøkerView } from '../../../context/sokerOppslagContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './Veiledning.module.css';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

const VEILEDNING_CONFIRM = 'veiledningConfirm';
type VeiledningType = {
  veiledningConfirm?: boolean;
};
const initVeiledning: VeiledningType = {
  veiledningConfirm: false,
};
interface VeiledningProps {
  loading: boolean;
  søker: SøkerView;
  onSubmit: () => void;
}
export const Veiledning = ({ søker, loading, onSubmit }: VeiledningProps) => {
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
        <LucaGuidePanel>
          <HeadingHelloName size={'medium'} level={'2'} name={søker?.fulltNavn} loading={loading} />
          <BodyShort spacing>{formatMessage('søknad.veiledning.guide.text1')}</BodyShort>
          <BodyShort spacing>{formatMessage('søknad.veiledning.guide.text2')}</BodyShort>
        </LucaGuidePanel>
        <article>
          <Heading size={'small'} level={'2'} spacing>
            {formatMessage('søknad.veiledning.søknadsdato.title')}
          </Heading>
          <BodyShort spacing>{formatMessage('søknad.veiledning.søknadsdato.text1')}</BodyShort>
          <BodyShort spacing>{formatMessage('søknad.veiledning.søknadsdato.text2')}</BodyShort>
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
          onSubmit={handleSubmit(() => onSubmit())}
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
          <div className={classes?.buttonWrapper}>
            <Button variant="primary" type="submit">
              {formatMessage(`søknad.veiledning.startSøknad`)}
            </Button>
            <Button variant="tertiary" type="button" onClick={() => console.log('TODO')}>
              {formatMessage(`søknad.veiledning.avbrytSøknad`)}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};
