import { BodyShort, Button, Heading, Link, Modal } from '@navikt/ds-react';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { useInterval } from 'hooks/useInterval';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as styles from './TimeoutBox.module.css';

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
  logoutTextKey?: string;
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
          const expireInSeconds = data.tokens.expire_in_seconds;
          // Sesjonen vi får fra Wonderwall er på 6 timer, men det virker ikke som om token refreshes automatisk.
          // Bruker token sin expire, siden sesion.ends_in_seconds ligger et sekund bak
          setLogoutTime(beregnUtloggingsTidspunkt(expireInSeconds));
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
        {logoutTextKey && <BodyShort spacing>{formatMessage(logoutTextKey)}</BodyShort>}
        <ModalButtonWrapper>
          <Button className={styles.item} onClick={onLoginClick}>
            {formatMessage('logoutModal.buttonText')}
          </Button>
          <Link href="https://www.nav.no">Gå tilbake til nav.no</Link>
        </ModalButtonWrapper>
      </Modal.Content>
    </Modal>
  );
};
