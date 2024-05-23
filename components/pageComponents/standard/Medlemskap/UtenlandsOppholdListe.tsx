import { Button, Heading, HGrid, List, Table } from '@navikt/ds-react';
import * as styles from './Medlemskap.module.css';
import { formatDate } from 'utils/date';
import { Delete } from '@navikt/ds-icons';
import React, { Dispatch } from 'react';
import { useIntl } from 'react-intl';
import { UtenlandsPeriode } from 'types/Soknad';
import { ArbeidEllerBodd } from '../UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  utenlandsPerioder: UtenlandsPeriode[];
  setSelectedUtenlandsPeriode: Dispatch<UtenlandsPeriode>;
  setShowUtenlandsPeriodeModal: Dispatch<boolean>;
  arbeidEllerBodd: ArbeidEllerBodd;
}
export const UtenlandsOppholdListe = ({
  utenlandsPerioder,
  setSelectedUtenlandsPeriode,
  setShowUtenlandsPeriodeModal,
  arbeidEllerBodd,
}: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknad();

  const remove = (id?: string) => {
    updateSøknadData(søknadDispatch, {
      medlemskap: {
        ...søknadState?.søknad?.medlemskap,
        utenlandsOpphold: søknadState?.søknad?.medlemskap?.utenlandsOpphold?.filter(
          (e) => e.id !== id,
        ),
      },
    });
  };

  return (
    <div>
      <Heading size="xsmall" level="3">
        {formatMessage({
          id: `søknad.medlemskap.utenlandsperiode.perioder.title.${arbeidEllerBodd}`,
        })}
      </Heading>
      <ul className={styles.utenlandsoppholdListe}>
        {utenlandsPerioder.map((utenlandsPeriode) => (
          <li>
            <HGrid gap={'5'} columns={'3fr 1fr'}>
              <Button
                variant="tertiary"
                type="button"
                onClick={() => {
                  setSelectedUtenlandsPeriode(utenlandsPeriode);
                  setShowUtenlandsPeriodeModal(true);
                }}
                className={styles.editPeriodeButton}
              >
                <div className={styles.tableRowButtonContainer}>
                  <span>{`${utenlandsPeriode?.land?.split(':')?.[1]} `}</span>
                  <span>
                    {`${formatDate(utenlandsPeriode?.fraDato, 'MMMM yyyy')} - ${formatDate(
                      utenlandsPeriode?.tilDato,
                      'MMMM yyyy',
                    )}${utenlandsPeriode?.iArbeid === 'Ja' ? ' (Jobb)' : ''}`}
                  </span>
                </div>
              </Button>
              <Button
                type={'button'}
                variant={'tertiary'}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    remove(utenlandsPeriode.id);
                  }
                }}
                onClick={() => remove(utenlandsPeriode.id)}
                icon={<Delete className={styles.deleteIcon} aria-hidden />}
                iconPosition={'left'}
              >
                Fjern
              </Button>
            </HGrid>
          </li>
        ))}
      </ul>
    </div>
  );
};
