import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FieldValues } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import * as yup from 'yup';
import * as classes from './AddBehandlerModal.module.css';
import { useEffect } from 'react';
import { Button, Cell, Grid, Heading, Modal } from '@navikt/ds-react';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  showModal: boolean;
  behandler?: any;
}

export const AddBehandlerModal = ({ showModal, onCloseClick, onSaveClick, behandler }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const schema = yup.object().shape({
    firstname: yup
      .string()
      .required(formatMessage('søknad.helseopplysninger.modal.fornavn.validation.required'))
      .nullable(),
    lastname: yup
      .string()
      .required(formatMessage('søknad.helseopplysninger.modal.etternavn.validation.required'))
      .nullable(),
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(behandler ? behandler : {}),
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
          {formatMessage('søknad.helseopplysninger.modal.title')}
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
            label={formatMessage('søknad.helseopplysninger.modal.fornavn.label')}
            name={'firstname'}
            error={errors?.firstname?.message}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.etternavn.label')}
            name={'lastname'}
            error={errors?.lastname?.message}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.legekontor.label')}
            name={'legekontor'}
            error={errors?.legekontor?.message}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.gateadresse.label')}
            name={'gateadresse'}
            error={errors?.gateadresse?.message}
          />
          <div className={classes?.addresseFlexContainer}>
            <TextFieldWrapper
              className={classes?.addresseFlexItem}
              control={control}
              label={formatMessage('søknad.helseopplysninger.modal.postnummer.label')}
              name={'postnummer'}
              error={errors?.postnummer?.message}
            />
            <TextFieldWrapper
              className={classes?.addresseFlexItem}
              control={control}
              label={formatMessage('søknad.helseopplysninger.modal.poststed.label')}
              name={'poststed'}
              error={errors?.poststed?.message}
            />
          </div>
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.telefonnummer.label')}
            name={'telefon'}
            error={errors?.telefon?.message}
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
              {formatMessage('søknad.helseopplysninger.modal.buttons.avbryt')}
            </Button>
            <Button type={'submit'}>
              {formatMessage('søknad.helseopplysninger.modal.buttons.lagre')}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
