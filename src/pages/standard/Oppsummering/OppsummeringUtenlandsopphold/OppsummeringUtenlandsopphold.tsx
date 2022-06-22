import React from 'react';
import { BodyShort, Label } from '@navikt/ds-react';
import { UtenlandsPeriode } from '../../../../types/Soknad';
import { formatDate } from '../../../../utils/date';
import { GetText } from '../../../../hooks/useTexts';
import { landNavnFraSelector } from '../../../../utils/StringFormatters';
import { useFeatureToggleIntl } from '../../../../hooks/useFeatureToggleIntl';

interface Props {
  opphold?: UtenlandsPeriode[];
}

const OppsummeringUtenlandsopphold = ({ opphold }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  return (
    <>
      {opphold?.map((etOpphold, index) => (
        <div key={index} style={{ paddingLeft: '12px' }}>
          <div>
            <Label>{formatMessage('søknad.oppsummering.medlemskap.utenlandsopphold.land')}</Label>
            <BodyShort>{landNavnFraSelector(etOpphold?.land)}</BodyShort>
          </div>
          <div>
            <Label>
              {formatMessage('søknad.oppsummering.medlemskap.utenlandsopphold.periode')}
            </Label>
            <BodyShort>{`${formatDate(etOpphold?.fraDato)} - ${formatDate(
              etOpphold?.tilDato
            )}`}</BodyShort>
          </div>
          {etOpphold?.iArbeid && (
            <div>
              <Label>
                {formatMessage('søknad.oppsummering.medlemskap.utenlandsopphold.arbeidetIPerioden')}
              </Label>
              <BodyShort>{etOpphold?.iArbeid}</BodyShort>
            </div>
          )}
          {etOpphold?.utenlandsId && (
            <div>
              <Label>
                {formatMessage('søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label')}
              </Label>
              <BodyShort>{etOpphold?.utenlandsId}</BodyShort>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
export default OppsummeringUtenlandsopphold;
