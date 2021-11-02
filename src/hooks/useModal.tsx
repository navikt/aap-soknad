import {useState} from 'react';
type ModalContent = {
  heading?: string;
  text?: string;
  type?: string;
}
const useModal = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({});

  const handleModal = (content: object | null = null) => {
    setShowModal(!showModal);
    if(content !== null) {
      setModalContent(content);
    }
  }
  return {showModal, handleModal, modalContent};
}

export default useModal;
