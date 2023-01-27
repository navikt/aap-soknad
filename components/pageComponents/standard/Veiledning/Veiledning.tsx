import { Alert, BodyShort, Button, Heading, Label, Link } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from 'components/input/ConfirmationPanelWrapper';
import { SøkerView } from 'context/sokerOppslagContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './Veiledning.module.css';
import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { AmplitudeAwareAccordion } from 'components/AmplitudeAwareAccordion/AmplitudeAwareAccordion';
import { FormattedMessage } from 'react-intl';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';

const VEILEDNING_CONFIRM = 'veiledningConfirm';
type VeiledningType = {
  veiledningConfirm?: boolean;
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
  const { formatMessage, FormatElement } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    veiledningConfirm: yup
      .boolean()
      .required(formatMessage('søknad.veiledning.veiledningConfirm.validation.required'))
      .oneOf([true], formatMessage('søknad.veiledning.veiledningConfirm.validation.required')),
  });

  const { control, handleSubmit } = useForm<VeiledningType>({
    resolver: yupResolver(schema),
  });

  return (
    <>
      <header className={classes?.veiledningHeader}>
        <Heading size="large" level="1">
          <FormatElement
            id={`søknad.veiledning.title`}
            values={{
              wbr: () => <>&shy;</>,
            }}
          />
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

        <IntroduksjonTekst navn={søker.fulltNavn} />

        <form
          onSubmit={handleSubmit(async () => {
            await onSubmit();
          })}
          autoComplete="off"
        >
          <ConfirmationPanelWrapper
            label={formatMessage('søknad.veiledning.veiledningConfirm.label')}
            control={control}
            name={VEILEDNING_CONFIRM}
          >
            <Label as={'span'}>{formatMessage('søknad.veiledning.veiledningConfirm.title')}</Label>
          </ConfirmationPanelWrapper>

          <div className={classes?.startButton}>
            <Button variant="primary" type="submit" loading={isLoading}>
              {formatMessage(`søknad.veiledning.startSøknad`)}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};
