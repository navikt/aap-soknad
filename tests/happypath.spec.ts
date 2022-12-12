import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const checkWcag = async (page: Page) => new AxeBuilder({ page }).withTags(wcagTags).analyze();
test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/aap/soknad/');
  let wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await expect(
    page.getByRole('heading', { name: 'Søknad om arbeidsavklarings­penger (AAP)' })
  ).toBeVisible();

  await page.getByLabel('Jeg vil svare så godt jeg kan på spørsmålene i søknaden.').check();

  await page.getByRole('button', { name: 'Start søknad' }).click();

  await page.goto('http://localhost:3000/aap/soknad/1/');
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
    page.getByRole('heading', { name: 'Kontaktperson for helseopplysninger' })
  ).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByLabel('Ja').check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/');

  await expect(page.getByRole('heading', { name: 'Barnetillegg' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.locator('article:has-text("Navn: Embla Bakke Li")').getByLabel('Nei').check();

  await page.locator('article:has-text("Navn: Jonas Li")').getByLabel('Nei').check();

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

  await expect(page.getByRole('heading', { name: 'Tilleggsopplysninger' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/9/');

  await expect(page.getByRole('heading', { name: 'Vedlegg' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/10/');
  await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);

  await page
    .getByLabel(
      'Jeg har lest all informasjonen jeg har fått i søknaden og bekrefter at opplysningene jeg har gitt er korrekte.'
    )
    .check();

  await page.getByRole('button', { name: 'Send søknad' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/kvittering/');
  await expect(page.getByRole('heading', { name: 'Takk for søknaden, Jackie Li' })).toBeVisible();
  wcagRes = await checkWcag(page);
  await expect(wcagRes.violations).toEqual([]);
});
