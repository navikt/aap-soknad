import { Alert, Button, Heading, Label } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from 'components/input/ConfirmationPanelWrapper';
import { SøkerView } from 'context/sokerOppslagContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './Veiledning.module.css';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';
import { FormattedMessage, useIntl } from 'react-intl';

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
  const { formatMessage } = useIntl();

  const schema = yup.object().shape({
    veiledningConfirm: yup
      .boolean()
      .required(formatMessage({ id: 'søknad.veiledning.veiledningConfirm.validation.required' }))
      .oneOf(
        [true],
        formatMessage({ id: 'søknad.veiledning.veiledningConfirm.validation.required' })
      ),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <>
      <header className={classes?.veiledningHeader}>
        <Heading size="large" level="1">
          <FormattedMessage
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
            label={formatMessage({ id: 'søknad.veiledning.veiledningConfirm.label' })}
            control={control}
            name={VEILEDNING_CONFIRM}
          >
            <Label as={'span'}>
              {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.title' })}
            </Label>
          </ConfirmationPanelWrapper>

          <div className={classes?.startButton}>
            <Button variant="primary" type="submit" loading={isLoading}>
              {formatMessage({ id: `søknad.veiledning.startSøknad` })}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};
