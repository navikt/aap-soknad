import React from 'react';
import { BodyShort } from '@navikt/ds-react';
import { Periode } from '../../../../types/Soknad';
import { formatDate } from '../../../../utils/date';

interface Props {
  periode?: Periode;
}

const OppsummeringPeriode = ({ periode }: Props) => {
  console.log('periode', periode);
  return (
    <BodyShort>{`${formatDate(periode?.fraDato)} - ${formatDate(periode?.tilDato)}`}</BodyShort>
  );
};
export default OppsummeringPeriode;
