import {Modal} from "@navikt/ds-react";
import React, {useContext} from "react";
import {ModalContext} from "../context/modalContext";

type NotificationModalProps = {
  children?:
    | React.ReactChild
    | React.ReactChild[];
};
const NotificationModal = ({children}: NotificationModalProps) => {
  const {showModal, handleNotificationModal} = useContext(ModalContext);
  return(
    <Modal open={showModal} onClose={() => handleNotificationModal(null)}>
      <Modal.Content>
        {children}
      </Modal.Content>
    </Modal>);
}

export default NotificationModal;
