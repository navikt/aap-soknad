import { Button, Heading, Table } from '@navikt/ds-react';
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
const UtenlandsOppholdTabell = ({
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
    <Table size="medium">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={2}>
            <Heading size="xsmall" level="3">
              {formatMessage({
                id: `søknad.medlemskap.utenlandsperiode.perioder.title.${arbeidEllerBodd}`,
              })}
            </Heading>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {utenlandsPerioder.map((utenlandsPeriode) => (
          <Table.Row key={utenlandsPeriode.id}>
            <Table.DataCell className={styles.dataCell}>
              <Button
                variant="tertiary"
                type="button"
                onClick={() => {
                  setSelectedUtenlandsPeriode(utenlandsPeriode);
                  setShowUtenlandsPeriodeModal(true);
                }}
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
            </Table.DataCell>
            <Table.DataCell>
              <Button
                type={'button'}
                variant={'tertiary'}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    remove(utenlandsPeriode.id);
                  }
                }}
                onClick={() => remove(utenlandsPeriode.id)}
                icon={
                  <Delete
                    className={styles.deleteIcon}
                    title={'Slett utenlandsopphold'}
                    role={'button'}
                    tabIndex={0}
                  />
                }
                iconPosition={'left'}
              >
                Fjern
              </Button>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default UtenlandsOppholdTabell;
