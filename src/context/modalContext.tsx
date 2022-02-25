import React, { createContext } from 'react';
import useModal from '../hooks/useModal';
import NotificationModal from '../components/NotificationModal';
import { Heading, BodyShort, Button } from '@navikt/ds-react';

type ModalProviderProps = {
  children?: React.ReactChild | React.ReactChild[];
};
export const ModalContext = createContext({
  showModal: false,
  handleNotificationModal: (content: any) => {},
  modalContent: {},
});

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const { showModal, handleModal, modalContent } = useModal();
  return (
    <ModalContext.Provider
      value={{ showModal, handleNotificationModal: handleModal, modalContent }}
    >
      <NotificationModal>
        <Heading size="large">{modalContent?.heading}</Heading>
        <BodyShort>{modalContent?.text}</BodyShort>
        <>
          {modalContent?.buttons ? (
            modalContent.buttons.map((button, index) => (
              <Button
                key={index}
                onClick={() => (button?.onClick ? button.onClick() : handleModal())}
              >
                {button?.label}
              </Button>
            ))
          ) : (
            <></>
          )}
        </>
      </NotificationModal>
      {children}
    </ModalContext.Provider>
  );
};
