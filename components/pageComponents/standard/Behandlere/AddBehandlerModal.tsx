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
  onDeleteClick: () => void;
  showModal: boolean;
  behandler?: any;
}

export const AddBehandlerModal = ({
  showModal,
  onDeleteClick,
  onCloseClick,
  onSaveClick,
  behandler,
}: Props) => {
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
    setValue,
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
    // TODO: Update med behandler props
    setValue('firstname', '');
    setValue('lastname', '');
    setValue('legekontor', '');
    setValue('gateadresse', '');
    setValue('postnummer', '');
    setValue('poststed', '');
    setValue('telefon', '');
  };

  return (
    <Modal open={showModal} onClose={() => onCloseClick()}>
      <Modal.Content className={classes?.addBehandlerModalContent}>
        <Heading size={'small'} level={'3'}>
          {formatMessage('søknad.helseopplysninger.modal.title')}
        </Heading>
        <form
          onSubmit={handleSubmit((data) => {
            const newData = { ...data };
            clearModal();
            onSaveClick(newData);
          })}
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
          <Grid>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={formatMessage('søknad.helseopplysninger.modal.postnummer.label')}
                name={'postnummer'}
                error={errors?.postnummer?.message}
              />
            </Cell>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={formatMessage('søknad.helseopplysninger.modal.poststed.label')}
                name={'poststed'}
                error={errors?.poststed?.message}
              />
            </Cell>
          </Grid>
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.telefonnummer.label')}
            name={'telefon'}
            error={errors?.telefon?.message}
          />
          <ModalButtonWrapper>
            {behandler ? (
              <Button
                type="button"
                variant={'danger'}
                onClick={() => {
                  clearModal();
                  onDeleteClick();
                }}
              >
                {formatMessage('søknad.helseopplysninger.modal.buttons.slett')}
              </Button>
            ) : (
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onCloseClick();
                }}
              >
                {formatMessage('søknad.helseopplysninger.modal.buttons.avbryt')}
              </Button>
            )}

            <Button type={'submit'}>
              {formatMessage('søknad.helseopplysninger.modal.buttons.lagre')}
            </Button>

            {behandler && (
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onCloseClick();
                }}
              >
                {formatMessage('søknad.helseopplysninger.modal.buttons.avbryt')}
              </Button>
            )}
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
