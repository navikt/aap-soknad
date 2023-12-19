import * as classes from './Behandlere.module.css';
import { Button, Label } from '@navikt/ds-react';
import { formatFullAdresse, formatTelefonnummer } from 'utils/StringFormatters';
import { Delete } from '@navikt/ds-icons';
import React, { Dispatch } from 'react';
import { Behandler } from 'types/Soknad';
import { useIntl } from 'react-intl';
import { useSoknadContext } from 'context/soknadcontext/soknadContext';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  behandler: Behandler;
  setSelectedBehandler: Dispatch<Behandler>;
  setShowModal: Dispatch<boolean>;
}
export const AnnenBehandler = ({ behandler, setSelectedBehandler, setShowModal }: Props) => {
  const { formatMessage } = useIntl();
  const { søknadDispatch, søknadState } = useSoknadContext();

  const slettBehandler = (behandlerId?: string) => {
    updateSøknadData(søknadDispatch, {
      andreBehandlere: søknadState.søknad?.andreBehandlere?.filter(
        (behandler) => behandlerId !== behandler.id
      ),
    });
  };

  return (
    <li key={behandler.id}>
      <article className={classes?.legeKort}>
        <dl>
          <div className={classes?.oneLineDetail}>
            <dt>
              <Label as={'span'}>
                {formatMessage({
                  id: 'søknad.helseopplysninger.dineBehandlere.navn',
                })}
                :
              </Label>
            </dt>
            <dd>{`${behandler?.firstname} ${behandler?.lastname}`}</dd>
          </div>
          {behandler?.legekontor && (
            <div className={classes?.oneLineDetail}>
              <dt>
                <Label as={'span'}>
                  {formatMessage({
                    id: 'søknad.helseopplysninger.dineBehandlere.legekontor',
                  })}
                  :
                </Label>
              </dt>
              <dd>{behandler?.legekontor}</dd>
            </div>
          )}
          {behandler?.gateadresse && (
            <div className={classes?.oneLineDetail}>
              <dt>
                <Label as={'span'}>
                  {formatMessage({
                    id: 'søknad.helseopplysninger.dineBehandlere.adresse',
                  })}
                  :
                </Label>
              </dt>
              <dd>
                {formatFullAdresse({
                  adressenavn: behandler.gateadresse,
                  postnummer: {
                    postnr: behandler.postnummer,
                    poststed: behandler.poststed,
                  },
                })}
              </dd>
            </div>
          )}
          {behandler?.telefon && (
            <div className={classes?.oneLineDetail}>
              <dt>
                <Label as={'span'}>
                  {formatMessage({
                    id: 'søknad.helseopplysninger.dineBehandlere.telefon',
                  })}
                  :
                </Label>
              </dt>
              <dd>{formatTelefonnummer(behandler?.telefon)}</dd>
            </div>
          )}
        </dl>
        <div className={classes?.cardButtonWrapper}>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => {
              setSelectedBehandler(behandler);
              setShowModal(true);
            }}
          >
            {formatMessage({
              id: 'søknad.helseopplysninger.dineBehandlere.editButton',
            })}
          </Button>
          <Button
            variant="tertiary"
            type="button"
            icon={<Delete title={'Slett'} />}
            iconPosition={'left'}
            onClick={() => {
              slettBehandler(behandler.id);
            }}
          >
            {formatMessage({
              id: 'søknad.helseopplysninger.dineBehandlere.slettButton',
            })}
          </Button>
        </div>
      </article>
    </li>
  );
};
