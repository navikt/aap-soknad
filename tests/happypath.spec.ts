import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const checkWcag = async (page: Page) =>
  new AxeBuilder({ page }).include('#app').withTags(wcagTags).analyze();

test('at enkel gjennomkjøring av søknaden fungerer', async ({ page }) => {
  await page.goto('http://localhost:3000/aap/soknad/');
  let wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await expect(
    page.getByRole('heading', { name: 'Søknad om arbeidsavklarings­penger (AAP)' }),
  ).toBeVisible();

  await page.getByLabel('Jeg vil svare så godt jeg kan på spørsmålene i søknaden.').check();

  await page.getByRole('button', { name: 'Start søknad' }).click();

  //await page.goto('http://localhost:3000/aap/soknad/1/');
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await expect(page.getByRole('heading', { name: 'Startdato' })).toBeVisible();

  await page.getByLabel('Nei').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');
  await expect(page.getByRole('heading', { name: 'Bosted og jobb' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByLabel('Ja').check();

  await page
    .getByRole('group', { name: 'Har du jobbet utenfor Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/');
  await expect(page.getByRole('heading', { name: 'Yrkesskade' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByLabel('Nei').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/4/');

  await expect(
    page.getByRole('heading', { name: 'Kontaktperson for helseopplysninger' }),
  ).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByLabel('Ja').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/');

  await expect(page.getByRole('heading', { name: 'Barnetillegg' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/6/');

  await expect(page.getByRole('heading', { name: 'Student' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByLabel('Nei').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/7/');

  await expect(page.getByRole('heading', { name: 'Utbetalinger' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByLabel('Nei').check();

  await page.getByLabel('Ingen av disse').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/8/');

  await expect(
    page.getByRole('heading', { name: 'Vedlegg og tilleggsopplysninger' }),
  ).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/9/');
  await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
  // TODO Disse feiler på link komponenten til Aksel.
  // wcagRes = await checkWcag(page);
  // await expect(wcagRes.violations).toEqual([]);

  // test på accordion
  await expect(page.getByText('Folkeregistrert adresse')).toBeVisible();
  await expect(page.getByText('Har du sykepenger nå?')).toBeVisible();

  await page.getByRole('button', { name: /^Om deg$/ }).click();
  await expect(page.getByText('Folkeregistrert adresse')).not.toBeVisible();

  await page.getByRole('button', { name: /^Startdato$/ }).click();
  await expect(page.getByText('Har du sykepenger nå?')).not.toBeVisible();

  await page
    .getByLabel(
      'Jeg har lest all informasjonen jeg har fått i søknaden og bekrefter at opplysningene jeg har gitt er korrekte.',
    )
    .check();

  await page.getByRole('button', { name: 'Send søknad' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/kvittering/');
  await expect(page.getByRole('heading', { name: 'Takk for søknaden, Jackie Li' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);
});
