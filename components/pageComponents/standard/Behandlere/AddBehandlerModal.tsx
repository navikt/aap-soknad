import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import * as yup from 'yup';
import * as classes from './AddBehandlerModal.module.css';
import { useEffect } from 'react';
import { Button, Heading, Modal } from '@navikt/ds-react';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { useIntl } from 'react-intl';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  showModal: boolean;
  behandler?: any;
}

export const getBehandlerSchema = (formatMessage: any) => {
  return yup.object().shape({
    firstname: yup
      .string()
      .required(formatMessage({ id: 'søknad.helseopplysninger.modal.fornavn.validation.required' }))
      .nullable(),
    lastname: yup
      .string()
      .required(
        formatMessage({ id: 'søknad.helseopplysninger.modal.etternavn.validation.required' })
      )
      .nullable(),
  });
};

export const AddBehandlerModal = ({ showModal, onCloseClick, onSaveClick, behandler }: Props) => {
  const { formatMessage } = useIntl();
  const schema = getBehandlerSchema(formatMessage);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(behandler ?? {}),
    },
  });

  useEffect(() => {
    reset({ ...behandler });
  }, [behandler, reset]);

  const clearModal = () => {
    reset({});
  };

  return (
    <Modal
      open={showModal}
      onClose={() => {
        clearModal();
        onCloseClick();
      }}
    >
      <Modal.Content className={classes?.addBehandlerModalContent}>
        <Heading className={classes?.modalHeading} size={'small'} level={'3'}>
          {formatMessage({ id: 'søknad.helseopplysninger.modal.title' })}
        </Heading>
        <form
          onSubmit={handleSubmit((data) => {
            const newData = { ...data };
            onSaveClick(newData);
            clearModal();
            onCloseClick();
          })}
          className={classes?.modalForm}
        >
          <TextFieldWrapper
            control={control}
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.fornavn.label' })}
            name={'firstname'}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.etternavn.label' })}
            name={'lastname'}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.legekontor.label' })}
            name={'legekontor'}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.gateadresse.label' })}
            name={'gateadresse'}
          />
          <div className={classes?.addresseFlexContainer}>
            <TextFieldWrapper
              className={classes?.addresseFlexItem}
              control={control}
              label={formatMessage({ id: 'søknad.helseopplysninger.modal.postnummer.label' })}
              name={'postnummer'}
            />
            <TextFieldWrapper
              className={classes?.addresseFlexItem}
              control={control}
              label={formatMessage({ id: 'søknad.helseopplysninger.modal.poststed.label' })}
              name={'poststed'}
            />
          </div>
          <TextFieldWrapper
            control={control}
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.telefonnummer.label' })}
            name={'telefon'}
          />
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearModal();
                onCloseClick();
              }}
            >
              {formatMessage({ id: 'søknad.helseopplysninger.modal.buttons.avbryt' })}
            </Button>
            <Button type={'submit'}>
              {formatMessage({ id: 'søknad.helseopplysninger.modal.buttons.lagre' })}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
