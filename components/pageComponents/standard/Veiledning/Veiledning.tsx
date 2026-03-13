'use client';

import { Alert, Button, ConfirmationPanel, Heading, Label } from '@navikt/ds-react';
import classes from './Veiledning.module.css';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';
import { useTranslations } from 'next-intl';
import { FormEvent, useRef, useState } from 'react';
import { Person } from 'app/api/oppslagapi/person/route';

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
  const t = useTranslations();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const confirmRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmRef.current?.checked) {
      setErrorMessage(
        t('søknad.veiledning.veiledningConfirm.validation.required'),
      );
      return;
    }
    await onSubmit();
  }

  return (
    <>
      <header className={classes?.veiledningHeader}>
        <Heading size="large" level="1">
          {t.rich('søknad.veiledning.title', { wbr: () => <>&shy;</> })}
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
            label={t('søknad.veiledning.veiledningConfirm.label')}
            error={errorMessage}
            onChange={() => setErrorMessage(undefined)}
          >
            <Label as={'span'}>
              {t('søknad.veiledning.veiledningConfirm.title')}
            </Label>
          </ConfirmationPanel>

          <div className={classes?.startButton}>
            <Button variant="primary" type="submit" loading={isLoading}>
              {t(`søknad.veiledning.startSøknad`)}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};
