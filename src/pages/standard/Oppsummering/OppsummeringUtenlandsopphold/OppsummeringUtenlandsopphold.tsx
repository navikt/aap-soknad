import React from 'react';
import { BodyShort, Label } from '@navikt/ds-react';
import { UtenlandsPeriode } from '../../../../types/Soknad';
import { formatDate } from '../../../../utils/date';
import { GetText } from '../../../../hooks/useTexts';

interface Props {
  getText: GetText;
  opphold?: UtenlandsPeriode[];
}

const OppsummeringUtenlandsopphold = ({ getText, opphold }: Props) => {
  return (
    <>
      {opphold?.map((etOpphold) => (
        <div>
          <div>
            <Label>{etOpphold?.land?.label}</Label>
            <BodyShort>{etOpphold?.land?.value}</BodyShort>
          </div>
          <div>
            <Label>{getText('steps.oppsummering.periode')}</Label>
            <BodyShort>{`${formatDate(etOpphold?.fraDato?.value)} - ${formatDate(
              etOpphold?.tilDato?.value
            )}`}</BodyShort>
          </div>
          {etOpphold?.iArbeid?.value && (
            <div>
              <Label>{etOpphold?.iArbeid?.label}</Label>
              <BodyShort>{etOpphold?.iArbeid?.value}</BodyShort>
            </div>
          )}
          {etOpphold?.utenlandsId?.value && (
            <div>
              <Label>{etOpphold?.utenlandsId?.label}</Label>
              <BodyShort>{etOpphold?.utenlandsId?.value}</BodyShort>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
export default OppsummeringUtenlandsopphold;
