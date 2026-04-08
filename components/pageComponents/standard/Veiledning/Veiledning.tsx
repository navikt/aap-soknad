import {
  Alert,
  BodyShort,
  Box,
  Button,
  Checkbox,
  ErrorMessage,
  Heading,
  BodyLong,
  Link,
} from '@navikt/ds-react';
import * as classes from './Veiledning.module.css';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormEvent, RefObject, useState } from 'react';
import { Person } from 'pages/api/oppslagapi/person';

interface VeiledningProps {
  person?: Person;
  isLoading: boolean;
  hasError: boolean;
  errorMessageRef: RefObject<HTMLDivElement | null>;
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
  const [confirmation, setConfirmation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmation) {
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

        {person?.erUnderAttenÅr ? (
          <Alert variant="warning">
            <Heading size="small" spacing level="2">
              {formatMessage({ id: 'søknad.veiledning.søkerUnderAttenÅr.title' })}
            </Heading>
            <BodyLong>
              {formatMessage({ id: 'søknad.veiledning.søkerUnderAttenÅr.description' })}
            </BodyLong>
          </Alert>
        ) : (
          <>
            <IntroduksjonTekst navn={person?.navn} />

        <form onSubmit={(event) => handleSubmit(event)} autoComplete="off">
          <Box
            background="surface-warning-subtle"
            borderColor="border-warning"
            borderWidth="1"
            padding="space-16"
            borderRadius="medium"
          >
            <BodyShort>
              {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.description' })}{' '}
              <Link
                href={formatMessage({ id: 'søknad.veiledning.veiledningConfirm.link' })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.readMore' })}
              </Link>
            </BodyShort>

            <Checkbox
              onChange={(e) => {
                setConfirmation(e.target.checked);
                setErrorMessage(undefined);
              }}
            >
              {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.checkbox' })}
            </Checkbox>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          </Box>

              <div className={classes?.startButton}>
                <Button variant="primary" type="submit" loading={isLoading}>
                  {formatMessage({ id: `søknad.veiledning.startSøknad` })}
                </Button>
              </div>
            </form>
          </>
        )}
      </main>
    </>
  );
};
