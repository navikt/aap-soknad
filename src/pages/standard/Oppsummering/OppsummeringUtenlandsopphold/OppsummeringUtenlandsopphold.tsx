import React from 'react';
import { BodyShort, Label } from '@navikt/ds-react';
import { UtenlandsPeriode } from '../../../../types/Soknad';
import { formatDate } from '../../../../utils/date';
import { GetText } from '../../../../hooks/useTexts';
import { landNavnFraSelector } from '../../../../utils/StringFormatters';

interface Props {
  getText: GetText;
  opphold?: UtenlandsPeriode[];
}

const OppsummeringUtenlandsopphold = ({ getText, opphold }: Props) => {
  return (
    <>
      {opphold?.map((etOpphold, index) => (
        <div key={index} style={{ paddingLeft: '12px' }}>
          <div>
            <Label>{'Land'}</Label>
            <BodyShort>{landNavnFraSelector(etOpphold?.land)}</BodyShort>
          </div>
          <div>
            <Label>{getText('steps.oppsummering.periode')}</Label>
            <BodyShort>{`${formatDate(etOpphold?.fraDato)} - ${formatDate(
              etOpphold?.tilDato
            )}`}</BodyShort>
          </div>
          {etOpphold?.iArbeid && (
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
