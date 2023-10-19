import { Behandler } from 'types/Soknad';
import * as yup from 'yup';
import * as classes from './AddBehandlerModal.module.css';
import { Button, Heading, Modal, TextField } from '@navikt/ds-react';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { IntlFormatters, useIntl } from 'react-intl';
import { Dispatch, useState } from 'react';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';

interface Props {
  onCloseClick: () => void;
  onSaveClick: (data: Behandler) => void;
  showModal: boolean;
  behandler: Behandler;
  setBehandler: Dispatch<Behandler>;
}

export const getBehandlerSchema = (formatMessage: IntlFormatters['formatMessage']) => {
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

export const EndreEllerLeggTilBehandlerModal = ({
  showModal,
  onCloseClick,
  onSaveClick,
  behandler,
  setBehandler,
}: Props) => {
  const { formatMessage } = useIntl();
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  function clearErrors() {
    setErrors(undefined);
  }

  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;

  return (
    <Modal
      open={showModal}
      onClose={() => {
        clearErrors();
        onCloseClick();
      }}
    >
      <Modal.Header>
        <Heading className={classes?.modalHeading} size={'small'} level={'3'}>
          {formatMessage({ id: 'søknad.helseopplysninger.modal.title' })}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes?.addBehandlerModalContent}>
        <form
          onSubmit={async (formEvent) => {
            formEvent.preventDefault();
            const errors = await validate(getBehandlerSchema(formatMessage), behandler);
            if (errors) {
              setErrors(errors);
            } else {
              onSaveClick(behandler);
              clearErrors();
              onCloseClick();
            }
          }}
          className={classes?.modalForm}
        >
          <TextField
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.fornavn.label' })}
            name={'firstname'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, firstname: event.target.value });
            }}
            error={findError('firstname')}
            value={behandler.firstname || ''}
          />
          <TextField
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.etternavn.label' })}
            name={'lastname'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, lastname: event.target.value });
            }}
            error={findError('lastname')}
            value={behandler.lastname || ''}
          />
          <TextField
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.legekontor.label' })}
            name={'legekontor'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, legekontor: event.target.value });
            }}
            error={findError('legekontor')}
            value={behandler.legekontor || ''}
          />
          <TextField
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.gateadresse.label' })}
            name={'gateadresse'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, gateadresse: event.target.value });
            }}
            error={findError('gateadresse')}
            value={behandler.gateadresse || ''}
          />
          <div className={classes?.addresseFlexContainer}>
            <TextField
              label={formatMessage({ id: 'søknad.helseopplysninger.modal.postnummer.label' })}
              name={'postnummer'}
              onChange={(event) => {
                clearErrors();
                setBehandler({ ...behandler, postnummer: event.target.value });
              }}
              error={findError('postnummer')}
              value={behandler.postnummer || ''}
            />
            <TextField
              label={formatMessage({ id: 'søknad.helseopplysninger.modal.poststed.label' })}
              name={'poststed'}
              onChange={(event) => {
                clearErrors();
                setBehandler({ ...behandler, poststed: event.target.value });
              }}
              error={findError('poststed')}
              value={behandler.poststed || ''}
            />
          </div>
          <TextField
            label={formatMessage({ id: 'søknad.helseopplysninger.modal.telefonnummer.label' })}
            name={'telefon'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, telefon: event.target.value });
            }}
            error={findError('telefon')}
            value={behandler.telefon || ''}
          />
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearErrors();
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
      </Modal.Body>
    </Modal>
  );
};
