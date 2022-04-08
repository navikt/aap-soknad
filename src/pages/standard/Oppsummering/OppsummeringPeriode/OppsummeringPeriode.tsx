import React from 'react';
import { BodyShort } from '@navikt/ds-react';
import { Periode } from '../../../../types/SoknadStandard';
import { formatDate } from '../../../../utils/date';

interface Props {
  periode?: Periode;
}

const OppsummeringPeriode = ({ periode }: Props) => {
  return (
    <BodyShort>{`${formatDate(periode?.fraDato?.value)} - ${formatDate(
      periode?.tilDato?.value
    )}`}</BodyShort>
  );
};
export default OppsummeringPeriode;
