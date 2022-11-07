import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { useInterval } from 'hooks/useInterval';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ONE_SECOND_IN_MS = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * 60;

const now = (): number => {
  return new Date().getTime();
};

const beregnUtloggingsTidspunkt = (sessionDurationInSeconds: number): number => {
  const millisekunderTilUtlogging = sessionDurationInSeconds * ONE_SECOND_IN_MS;
  return now() + millisekunderTilUtlogging;
};

interface Props {
  logoutTextKey: string;
}

export const TimeoutBox = ({ logoutTextKey }: Props) => {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [logoutTime, setLogoutTime] = useState(beregnUtloggingsTidspunkt(SECONDS_IN_HOUR));

  const { formatMessage } = useFeatureToggleIntl();

  const router = useRouter();

  useEffect(() => {
    if (
      window.location.hostname.indexOf('localhost') > -1 ||
      window.location.hostname.indexOf('labs.nais.io') > -1
    ) {
      setLogoutTime(beregnUtloggingsTidspunkt(SECONDS_IN_HOUR));
    } else {
      fetch('/aap/soknad/oauth2/session')
        .then((res) => res.json())
        .then((data) => {
          const endsInSeconds = data.session.ends_in_seconds;
          setLogoutTime(beregnUtloggingsTidspunkt(endsInSeconds));
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const onLoginClick = () => {
    router.reload();
  };

  useInterval(() => {
    const tidIgjenAvSesjon = logoutTime - now();
    setIsLoggedOut(tidIgjenAvSesjon < 0);
  }, SECONDS_IN_MINUTE * ONE_SECOND_IN_MS);

  return (
    <Modal
      open={isLoggedOut}
      onClose={() => null}
      shouldCloseOnOverlayClick={false}
      closeButton={false}
    >
      <Modal.Content>
        <Heading level="1" size="large" spacing>
          {formatMessage('logoutModal.title')}
        </Heading>
        <BodyShort spacing>{formatMessage(logoutTextKey)}</BodyShort>
        <Button onClick={onLoginClick}>{formatMessage('logoutModal.buttonText')}</Button>
      </Modal.Content>
    </Modal>
  );
};
