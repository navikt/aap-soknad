import * as classes from './ModalButtonWrapper.module.css';

interface Props {
  children?: React.ReactNode;
}

export const ModalButtonWrapper = ({ children }: Props) => (
  <div className={classes?.modalButtonWrapper}>{children}</div>
);
