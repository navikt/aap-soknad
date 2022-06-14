import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FieldValues } from 'react-hook-form';
import { GetText } from '../../../hooks/useTexts';
import Soknad from '../../../types/Soknad';
import * as yup from 'yup';
import * as classes from './AddBehandlerModal.module.css';
import { useEffect } from 'react';
import { Button, Cell, Grid, Heading, Modal } from '@navikt/ds-react';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import { ModalButtonWrapper } from '../../../components/ButtonWrapper/ModalButtonWrapper';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  onDeleteClick: () => void;
  showModal: boolean;
  behandler?: any;
}

export const AddBehandlerModal = ({
  getText,
  showModal,
  onDeleteClick,
  onCloseClick,
  onSaveClick,
  behandler,
}: Props) => {
  const schema = yup.object().shape({});
  const { control, handleSubmit, setValue, reset } = useForm<FieldValues>({
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
          {'Legg til annen lege eller behandler'}
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
            label={getText('form.fastlege.annenbehandler.firstname.label')}
            name={'firstname'}
          />
          <TextFieldWrapper
            control={control}
            label={getText('form.fastlege.annenbehandler.lastname.label')}
            name={'lastname'}
          />
          <TextFieldWrapper
            control={control}
            label={getText('form.fastlege.annenbehandler.legekontor.label')}
            name={'legekontor'}
          />
          <TextFieldWrapper
            control={control}
            label={getText('form.fastlege.annenbehandler.gateadresse.label')}
            name={'gateadresse'}
          />
          <Grid>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={getText('form.fastlege.annenbehandler.postnummer.label')}
                name={'postnummer'}
              />
            </Cell>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={getText('form.fastlege.annenbehandler.poststed.label')}
                name={'poststed'}
              />
            </Cell>
          </Grid>
          <TextFieldWrapper
            control={control}
            label={getText('form.fastlege.annenbehandler.telefon.label')}
            name={'telefon'}
          />
          <ModalButtonWrapper>
            <Button type={'submit'}>Lagre</Button>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                onCloseClick();
              }}
            >
              Avbryt
            </Button>
            {behandler && (
              <Button
                type="button"
                variant={'danger'}
                onClick={() => {
                  clearModal();
                  onDeleteClick();
                }}
              >
                Slett
              </Button>
            )}
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
