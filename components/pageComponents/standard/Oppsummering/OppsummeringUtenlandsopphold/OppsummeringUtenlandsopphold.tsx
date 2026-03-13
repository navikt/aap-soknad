'use client';
import React from 'react';
import { BodyShort, Label } from '@navikt/ds-react';
import { UtenlandsPeriode } from 'types/Soknad';
import { formatDate } from 'utils/date';
import { landNavnFraSelector } from 'utils/StringFormatters';
import { useTranslations } from 'next-intl';

interface Props {
  opphold?: UtenlandsPeriode[];
}

const OppsummeringUtenlandsopphold = ({ opphold }: Props) => {
  const t = useTranslations();

  return (
    <>
      {opphold?.map((etOpphold, index) => (
        <div key={index} style={{ paddingLeft: '12px' }}>
          <div>
            <Label>
              {t('søknad.oppsummering.medlemskap.utenlandsopphold.land')}
            </Label>
            <BodyShort>{landNavnFraSelector(etOpphold?.land)}</BodyShort>
          </div>
          <div>
            <Label>
              {t('søknad.oppsummering.medlemskap.utenlandsopphold.periode')}
            </Label>
            <BodyShort>{`${formatDate(etOpphold?.fraDato)} - ${formatDate(
              etOpphold?.tilDato
            )}`}</BodyShort>
          </div>
          {etOpphold?.iArbeid && (
            <div>
              <Label>
                {t('søknad.oppsummering.medlemskap.utenlandsopphold.jobbetIPerioden')}
              </Label>
              <BodyShort>{etOpphold?.iArbeid}</BodyShort>
            </div>
          )}
          {etOpphold?.utenlandsId && (
            <div>
              <Label>
                {t('søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label')}
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
