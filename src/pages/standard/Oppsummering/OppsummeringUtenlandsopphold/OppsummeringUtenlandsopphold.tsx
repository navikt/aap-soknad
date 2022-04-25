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
        <div style={{ paddingLeft: '12px' }}>
          <div>
            <Label>{'Land'}</Label>
            <BodyShort>{etOpphold?.land}</BodyShort>
          </div>
          <div>
            <Label>{getText('steps.oppsummering.periode')}</Label>
            <BodyShort>{`${formatDate(etOpphold?.fraDato)} - ${formatDate(
              etOpphold?.tilDato
            )}`}</BodyShort>
          </div>
          {etOpphold?.iArbeid !== undefined && (
            <div>
              <Label>{'Jobbet i perioden'}</Label>
              <BodyShort>{etOpphold?.iArbeid}</BodyShort>
            </div>
          )}
          {etOpphold?.utenlandsId && (
            <div>
              <Label>{getText('form.utenlandsperiode.utenlandsId.label')}</Label>
              <BodyShort>{etOpphold?.utenlandsId}</BodyShort>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
export default OppsummeringUtenlandsopphold;
