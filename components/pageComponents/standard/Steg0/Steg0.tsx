'use client';
import { IntroduksjonTekst } from 'components/IntroduksjonTekst/IntroduksjonTekst';
import * as classes from './Steg0.module.css';
import { BodyShort, Label } from '@navikt/ds-react';
import { SuccessColored } from '@navikt/ds-icons';
import { useTranslations } from 'next-intl';
import SøknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { Person } from 'app/api/oppslagapi/person/route';

interface Props {
  onNext: () => void;
  person: Person;
}

export const Steg0 = ({ onNext, person }: Props) => {
  const t = useTranslations();

  return (
    <SøknadFormWrapper
      className={classes?.paddingTop}
      onNext={onNext}
      nextButtonText={t('navigation.next')}
    >
      <IntroduksjonTekst navn={person?.navn} />

      <div>
        <Label as="p" spacing>
          {t('søknad.veiledning.veiledningConfirm.title')}
        </Label>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <SuccessColored />
          <BodyShort>
            {t('søknad.veiledning.veiledningConfirm.label')}
          </BodyShort>
        </div>
      </div>
    </SøknadFormWrapper>
  );
};
