import { Alert, Button, ConfirmationPanel, Heading, Label } from '@navikt/ds-react';
import * as classes from './Veiledning.module.css';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormEvent, useRef, useState } from 'react';
import { Person } from 'pages/api/oppslagapi/person';

interface VeiledningProps {
  person?: Person;
  isLoading: boolean;
  hasError: boolean;
  errorMessageRef: React.MutableRefObject<HTMLDivElement | null>;
  onSubmit: () => void;
}
export const Veiledning = ({
  person,
  isLoading,
  hasError,
  errorMessageRef,
  onSubmit,
}: VeiledningProps) => {
  const { formatMessage } = useIntl();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const confirmRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmRef.current?.checked) {
      setErrorMessage(
        formatMessage({ id: 'søknad.veiledning.veiledningConfirm.validation.required' }),
      );
      return;
    }
    await onSubmit();
  }

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

        <IntroduksjonTekst navn={person?.navn} />

        <form onSubmit={(event) => handleSubmit(event)} autoComplete="off">
          <ConfirmationPanel
            ref={confirmRef}
            label={formatMessage({ id: 'søknad.veiledning.veiledningConfirm.label' })}
            error={errorMessage}
            onChange={() => setErrorMessage(undefined)}
          >
            <Label as={'span'}>
              {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.title' })}
            </Label>
          </ConfirmationPanel>

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
