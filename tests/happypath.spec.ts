import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/aap/soknad/');

  await page.screenshot({ path: 'screenshot.png' });

  await page.getByRole('heading', { name: 'Søknad om arbeidsavklaringspenger (AAP)' }).click();

  await page.getByLabel('Jeg vil svare så godt jeg kan på spørsmålene i søknaden.').check();

  await page.getByRole('button', { name: 'Start søknad' }).click();

  await page.goto('http://localhost:3000/aap/soknad/1/');

  await page.getByRole('heading', { name: 'Startdato' }).click();

  await page.getByLabel('Nei').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');

  await page.getByRole('heading', { name: 'Bosted og jobb' }).click();

  await page.getByLabel('Ja').check();

  await page
    .getByRole('group', { name: 'Har du jobbet utenfor Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/');

  await page.getByRole('heading', { name: 'Yrkesskade' }).click();

  await page.getByLabel('Nei').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/4/');

  await page.getByRole('heading', { name: 'Kontaktperson for helseopplysninger' }).click();

  await page.getByLabel('Ja').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/');

  await page.getByRole('heading', { name: 'Barnetillegg' }).click();

  await page
    .locator(
      'article:has-text("Navn: Embla Bakke LiFødselsdato: 11.11.2021Har barnet årlig inntekt over 111 477")'
    )
    .getByLabel('Nei')
    .check();

  await page
    .locator(
      'article:has-text("Navn: Jonas Li Fødselsdato: 11.11.2020Har barnet årlig inntekt over 111 477kr?Hv")'
    )
    .getByLabel('Nei')
    .check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/6/');

  await page.getByRole('heading', { name: 'Student' }).click();

  await page.getByLabel('Nei').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/7/');

  await page.getByRole('heading', { name: 'Utbetalinger' }).click();

  await page.getByLabel('Nei').check();

  await page.getByLabel('Ingen av disse').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/8/');

  await page.getByRole('heading', { name: 'Tilleggsopplysninger' }).click();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/9/');

  await page.getByRole('heading', { name: 'Vedlegg' }).click();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/10/');

  await page.getByRole('heading', { name: 'Oppsummering' }).click();

  await page
    .getByLabel(
      'Jeg har lest all informasjonen jeg har fått i søknaden og bekrefter at opplysningene jeg har gitt er korrekte.'
    )
    .check();

  await page.getByRole('button', { name: 'Send søknad' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/kvittering/');

  await page.getByRole('heading', { name: 'Takk for søknaden, Jackie Li' }).click();
});
