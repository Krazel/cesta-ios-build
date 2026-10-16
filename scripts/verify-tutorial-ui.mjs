import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

// Static exported app supplied from disk through Playwright, with no live API.
// This verifies browser UI/persistence; it does not validate native iOS or cloud.
const root = path.resolve('dist');
const english = JSON.parse(await fs.readFile('src/en.json', 'utf8'));
const output = path.resolve('artifacts/ui-review-20261016/screenshots');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const receipt = {
  checkedAt: new Date().toISOString(),
  mode: 'offline-static-browser',
  liveCloudVerified: false,
  nativeDeviceVerified: false,
  languages: [],
  screenshots: [],
};
let currentPage;
try {
  for (const language of ['es', 'en']) {
    const context = await browser.newContext({
      locale: language === 'es' ? 'es-ES' : 'en-GB',
      viewport: { width: 390, height: 844 },
      serviceWorkers: 'block',
    });
    const errors = [],
      apiCalls = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/')) {
        apiCalls.push(url.pathname);
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"message":"Offline QA"}',
        });
      }
      if (url.hostname !== 'cesta.local') return route.abort();
      const filename = path.resolve(
        root,
        '.' + (url.pathname === '/' ? '/index.html' : url.pathname),
      );
      if (!filename.startsWith(root + path.sep)) return route.abort();
      try {
        await route.fulfill({
          body: await fs.readFile(filename),
          contentType: filename.endsWith('.html')
            ? 'text/html'
            : filename.endsWith('.js')
              ? 'text/javascript'
              : 'image/x-icon',
        });
      } catch {
        await route.fulfill({ status: 404, body: 'Missing static asset' });
      }
    });
    const page = await context.newPage();
    currentPage = page;
    page.on('pageerror', (e) => errors.push(e.message));
    const t = (es, en = es) => (language === 'es' ? es : english[es] || en);
    const button = (es, en = es) => page.getByRole('button', { name: t(es, en), exact: true });
    const tab = (es, en) => page.getByRole('tab', { name: t(es, en), exact: true });
    const input = () =>
      page.getByRole('textbox', { name: t('Añadir producto', 'Add product'), exact: true });
    const capture = async (name) => {
      await expect(
        page.locator('[aria-live="polite"]').filter({ has: page.locator('svg') }),
      ).toHaveCount(0, { timeout: 6000 });
      await page.waitForTimeout(250);
      const file = `${name}-${language}.png`;
      await page.screenshot({ path: path.join(output, file) });
      receipt.screenshots.push({
        file,
        ...page.viewportSize(),
        sha256: crypto
          .createHash('sha256')
          .update(await fs.readFile(path.join(output, file)))
          .digest('hex'),
      });
    };
    await page.goto('https://cesta.local/');
    await expect(button('Omitir tutorial')).toBeVisible();
    await capture('tutorial-1');
    await button('Siguiente').click();
    await expect(page.getByRole('heading', { name: t('Añade a tu manera.') })).toBeVisible();
    await capture('tutorial-2');
    await button('Anterior').click();
    await expect(
      page.getByRole('heading', { name: t('Guarda una lista. Úsala cuando quieras.') }),
    ).toBeVisible();
    await button('Siguiente').click();
    await button('Siguiente').click();
    await capture('tutorial-3');
    await button('Siguiente').click();
    await capture('tutorial-4');
    await button('Entendido, vamos').click();
    await page.reload();
    await expect(button('Omitir tutorial')).toHaveCount(0);
    await expect(button('Empezar mi cesta', 'Start my basket')).toBeVisible();
    await expect(button('English')).toHaveCount(0);
    await expect(button('Español')).toHaveCount(0);
    await capture('onboarding');
    await page
      .getByRole('textbox', { name: t('Tu nombre', 'Your name'), exact: true })
      .fill('Alex');
    await button('Empezar mi cesta', 'Start my basket').click();
    await capture('library');
    await button('Nueva lista').click();
    await capture('new-list');
    await button('Cerrar ventana').click();
    await button('Abrir Compra semanal', 'Open Weekly shop').click();
    await capture('default-saved-list');
    await tab('Listas', 'Lists').click();
    await tab('Inicio', 'Home').click();
    await capture('home-empty');
    await button('Unirme a una lista').click();
    await capture('join');
    await button('Cerrar ventana').click();
    await button('Pegar lista', 'Paste list').click();
    await capture('text-import');
    await page
      .getByRole('textbox', { name: t('Nombre de la lista', 'List name'), exact: true })
      .fill('Semanal');
    await page
      .getByRole('textbox', { name: t('Texto de la compra', 'Shopping text'), exact: true })
      .fill('2 yogures, fruta, espaguetis');
    await button('Preparar lista', 'Prepare list').click();
    await capture('text-preview');
    await button('Añadir 3 productos', 'Add 3 products').click();
    await input().fill('Extra puntual');
    await button('Añadir producto escrito', 'Add typed product').click();
    await input().fill(t('espag', 'spag'));
    await expect(button('Añadir Espaguetis', 'Add Spaghetti')).toBeVisible();
    await capture('autocomplete');
    await input().fill('');
    await tab('Productos', 'Products').click();
    await capture('products');
    await expect(button('Volver a Semanal', 'Back to Semanal')).toBeVisible();
    await button('Crear producto', 'Create product').click();
    await capture('product-form');
    await page
      .getByRole('textbox', { name: t('Nombre del producto', 'Product name'), exact: true })
      .fill('Pan de casa');
    const chooser = page.waitForEvent('filechooser');
    await button('Añadir foto', 'Add photo').click();
    await (await chooser).setFiles(path.resolve('assets/icon.png'));
    await expect(
      page.getByRole('img', {
        name: t('Foto de Pan de casa', 'Photo of Pan de casa'),
        exact: true,
      }),
    ).toBeVisible();
    await button('Guardar producto', 'Save product').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await capture('custom-photo');
    await button('Añadir Pan de casa a Semanal', 'Add Pan de casa to Semanal').click();
    await button('Volver a Semanal', 'Back to Semanal').click();
    const photo = page.getByRole('img', {
      name: t('Foto de Pan de casa', 'Photo of Pan de casa'),
      exact: true,
    });
    await expect(photo).toBeVisible();
    await expect
      .poll(() => photo.evaluate((img) => img.complete && img.naturalWidth > 0))
      .toBe(true);
    await page
      .getByRole('checkbox', { name: t('Comprar Fruta', 'Buy Fruit'), exact: true })
      .check();
    await expect(
      page.getByText(t('1 de 5 comprados · 20%', '1 of 5 bought · 20%'), { exact: true }),
    ).toBeVisible();
    await input().fill('Borrador');
    await expect(input()).toBeFocused();
    await page.mouse.click(190, 40);
    await expect(input()).not.toBeFocused();
    await input().fill('');
    await capture('shopping');
    await button('Opciones de la lista').click();
    await capture('list-options');
    await button('Compartir lista').click();
    await capture('share');
    await button('Cerrar ventana').click();
    await tab('Inicio', 'Home').click();
    await capture('home-active');
    await button('Abrir Semanal', 'Open Semanal').click();
    await tab('Listas', 'Lists').click();
    await button('Abrir Semanal', 'Open Semanal').click();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(button('Producto Extra puntual', 'Product Extra puntual')).toHaveCount(0);
    await expect(button('Producto Pan de casa', 'Product Pan de casa')).toHaveCount(0);
    await capture('saved-list');
    await button('Abrir compra', 'Open shop').click();
    await expect(photo).toBeVisible();
    await button('Quitar del inicio', 'Remove from home').click();
    await button('Añadir al inicio', 'Add to home').click();
    await expect(photo).toBeVisible();
    await page.reload();
    await button('Abrir Semanal', 'Open Semanal').click();
    await expect(
      page.getByRole('checkbox', {
        name: t('Comprar Extra puntual', 'Buy Extra puntual'),
        exact: true,
      }),
    ).toBeVisible();
    await expect(photo).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cesta-state-v2')));
    assert(saved.customProducts[0].image.startsWith('data:image/jpeg;base64,'));
    assert(saved.customProducts[0].image.length <= 60000);
    await button('Opciones de la lista', 'List options').click();
    await button('Volver a usar', 'Use again').click();
    await button('Empezar de nuevo', 'Start again').click();
    await expect(
      page.getByRole('checkbox', {
        name: t('Comprar Extra puntual', 'Buy Extra puntual'),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole('checkbox')).toHaveCount(3);
    await tab('Ajustes', 'Settings').click();
    await capture('settings');
    await button('Privacidad').click();
    await capture('privacy');
    await button('Cerrar ventana').click();
    await button('Cambiar nombre').click();
    await capture('profile');
    await button('Cerrar ventana').click();
    await button('Ver tutorial').click();
    await expect(button('Siguiente')).toBeVisible();
    await button('Omitir tutorial').click();
    await expect(button('Ver tutorial')).toBeVisible();
    // Replay must preserve shopping state, selected tab and saved data.
    assert.equal(
      await page.evaluate(() => JSON.parse(localStorage.getItem('cesta-state-v2')).tutorialSeen),
      true,
    );
    await page.getByRole('radio', { name: t('Grande', 'Large'), exact: true }).click();
    await tab('Inicio', 'Home').click();
    await expect(input()).toBeVisible();
    await page.setViewportSize({ width: 320, height: 740 });
    assert((await page.evaluate(() => document.documentElement.scrollWidth)) <= 320);
    await page.evaluate(() => {
      Object.defineProperty(window.visualViewport, 'height', { configurable: true, value: 420 });
      window.visualViewport.dispatchEvent(new Event('resize'));
    });
    await input().fill('Pan');
    await expect
      .poll(async () => {
        const rect = await input().boundingBox();
        return rect.y + rect.height;
      })
      .toBeLessThanOrEqual(421);
    assert.deepEqual(errors, []);
    assert.deepEqual(apiCalls, [], 'Personal lists must not make API calls');
    await page.setViewportSize({ width: 320, height: 568 });
    await tab('Ajustes', 'Settings').click();
    await button('Ver tutorial').click();
    await button('Siguiente').click();
    await capture('tutorial-small');
    assert((await page.evaluate(() => document.documentElement.scrollWidth)) <= 320);
    await expect(button('Siguiente')).toBeVisible();
    await button('Omitir tutorial').click();
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('cesta-state-v2'));
      delete data.tutorialSeen;
      localStorage.setItem('cesta-state-v2', JSON.stringify(data));
    });
    await page.reload();
    await expect(button('Omitir tutorial')).toHaveCount(0);
    // A new install may arrive through an invitation. Keep it across the guide.
    await page.evaluate(() => localStorage.clear());
    await page.goto('https://cesta.local/?code=TESTINVITE');
    await expect(button('Omitir tutorial')).toBeVisible();
    await button('Omitir tutorial').click();
    await page.getByRole('textbox', { name: t('Tu nombre'), exact: true }).fill('Alex');
    await button('Empezar mi cesta').click();
    await expect(
      page.getByRole('textbox', { name: t('Código de invitación'), exact: true }),
    ).toHaveValue('TESTINVITE');
    await button('Cerrar ventana').click();
    await page.reload();
    await expect(button('Omitir tutorial')).toHaveCount(0);
    receipt.languages.push({
      language,
      passed: true,
      checks: [
        'tutorial-first-launch-next-back-finish',
        'tutorial-replay-skip-persistence',
        'tutorial-upgrade-keeps-existing-flow',
        'tutorial-320px',
        'invitation-survives-first-launch-guide',
        'onboarding-device-language',
        'paste-list',
        'autocomplete',
        'optional-photo-resize-and-reload',
        'progress-percentage',
        'keyboard-dismissal',
        'saved-list-extra-separation',
        'home-toggle',
        'reuse',
        'tab-context',
        'large-size-320px',
        'reduced-viewport',
      ],
      apiCalls: 0,
      runtimeErrors: 0,
    });
    console.log(`Local UI passed: ${language}`);
    await context.close();
  }
  await fs.writeFile(path.join(output, 'ui-receipt.json'), JSON.stringify(receipt, null, 2));
} catch (error) {
  receipt.error = error.message;
  await currentPage?.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  await fs.writeFile(path.join(output, 'ui-receipt.json'), JSON.stringify(receipt, null, 2));
  throw error;
} finally {
  await browser.close();
}
