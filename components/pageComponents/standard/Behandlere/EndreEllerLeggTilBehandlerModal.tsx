'use client';
import { Behandler } from 'types/Soknad';
import * as classes from './AddBehandlerModal.module.css';
import { Button, Heading, Modal, TextField } from '@navikt/ds-react';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { useTranslations } from 'next-intl';
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

import { getBehandlerSchema } from './behandler.schema';

export { getBehandlerSchema } from './behandler.schema';

export const EndreEllerLeggTilBehandlerModal = ({
  showModal,
  onCloseClick,
  onSaveClick,
  behandler,
  setBehandler,
}: Props) => {
  const t = useTranslations();
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
      aria-label={t('søknad.helseopplysninger.modal.title')}
    >
      <Modal.Header>
        <Heading className={classes?.modalHeading} size={'small'} level={'3'}>
          {t('søknad.helseopplysninger.modal.title')}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes?.addBehandlerModalContent}>
        <form
          onSubmit={async (formEvent) => {
            formEvent.preventDefault();
            const errors = await validate(getBehandlerSchema(t), behandler);
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
            label={t('søknad.helseopplysninger.modal.fornavn.label')}
            name={'firstname'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, firstname: event.target.value });
            }}
            error={findError('firstname')}
            value={behandler.firstname || ''}
          />
          <TextField
            label={t('søknad.helseopplysninger.modal.etternavn.label')}
            name={'lastname'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, lastname: event.target.value });
            }}
            error={findError('lastname')}
            value={behandler.lastname || ''}
          />
          <TextField
            label={t('søknad.helseopplysninger.modal.legekontor.label')}
            name={'legekontor'}
            onChange={(event) => {
              clearErrors();
              setBehandler({ ...behandler, legekontor: event.target.value });
            }}
            error={findError('legekontor')}
            value={behandler.legekontor || ''}
          />
          <TextField
            label={t('søknad.helseopplysninger.modal.gateadresse.label')}
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
              label={t('søknad.helseopplysninger.modal.postnummer.label')}
              name={'postnummer'}
              onChange={(event) => {
                clearErrors();
                setBehandler({ ...behandler, postnummer: event.target.value });
              }}
              error={findError('postnummer')}
              value={behandler.postnummer || ''}
            />
            <TextField
              label={t('søknad.helseopplysninger.modal.poststed.label')}
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
            label={t('søknad.helseopplysninger.modal.telefonnummer.label')}
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
              {t('søknad.helseopplysninger.modal.buttons.avbryt')}
            </Button>
            <Button type={'submit'}>
              {t('søknad.helseopplysninger.modal.buttons.lagre')}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Body>
    </Modal>
  );
};
