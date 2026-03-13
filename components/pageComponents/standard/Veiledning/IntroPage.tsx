'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'i18n/routing';
import { Veiledning } from './Veiledning';
import { SOKNAD_VERSION, SoknadContextState } from 'context/soknadcontext/soknadContext';
import { defaultStepList } from 'lib/defaultStepList';
import { mellomLagreSøknad } from 'hooks/useDebounceLagreSoknad';
import { scrollRefIntoView } from 'utils/dom';
import { Person } from 'app/api/oppslagapi/person/route';

interface IntroPageProps {
  person: Person;
}

export function IntroPage({ person }: IntroPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const errorMessageRef = useRef<HTMLDivElement | null>(null);

  const startSoknad = async () => {
    setIsLoading(true);
    setHasError(false);
    const initState: SoknadContextState = {
      version: SOKNAD_VERSION,
      søknad: { vedlegg: {} },
      lagretStepList: defaultStepList,
      requiredVedlegg: [],
    };
    const result = await mellomLagreSøknad(initState);

    if (!result?.ok) {
      setIsLoading(false);
      setHasError(true);
    } else {
      router.push('/1');
    }
  };

  useEffect(() => {
    if (hasError && errorMessageRef?.current != null) {
      scrollRefIntoView(errorMessageRef);
    }
  }, [hasError]);

  return (
    <Veiledning
      person={person}
      isLoading={isLoading}
      hasError={hasError}
      errorMessageRef={errorMessageRef}
      onSubmit={startSoknad}
    />
  );
}
