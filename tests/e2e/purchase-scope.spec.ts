import { test, expect } from '@playwright/test';

for (const language of ['es', 'en'] as const) {
  test(`Device language and reusable lists keep one-time extras separate (${language})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: language === 'es' ? 'es-ES' : 'en-GB',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const t = (es: string, en: string) => (language === 'es' ? es : en);
    const button = (es: string, en = es) =>
      page.getByRole('button', { name: t(es, en), exact: true });
    const input = () =>
      page.getByRole('textbox', { name: t('Añadir producto', 'Add product'), exact: true });
    const add = async (name: string) => {
      await input().fill(name);
      await button('Añadir producto escrito', 'Add typed product').click();
    };
    try {
      await page.goto('/');
      await expect(button('Empezar mi cesta', 'Start my basket')).toBeVisible();
      await expect(button('English')).toHaveCount(0);
      await expect(button('Español')).toHaveCount(0);
      await expect(
        page.getByText('Empiezas con cuatro listas guardadas que puedes cambiar o eliminar.', {
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByText(/Sin anuncios\. Sin contraseñas\.|No ads\. No passwords\./),
      ).toHaveCount(0);
      await page.screenshot({ path: `artifacts/screenshots/onboarding-device-${language}.png` });
      await page
        .getByRole('textbox', { name: t('Tu nombre', 'Your name'), exact: true })
        .fill('Alex');
      await button('Empezar mi cesta', 'Start my basket').click();
      await button('Nueva lista', 'New list').click();
      await page
        .getByRole('textbox', { name: t('Nombre de la lista', 'List name'), exact: true })
        .fill('Semanal');
      await button('Crear lista', 'Create list').click();
      await add('Habitual');
      await button('Añadir al inicio', 'Add to home').click();
      await add('Extra puntual');
      await page.getByRole('tab', { name: t('Productos', 'Products'), exact: true }).click();
      await page
        .getByRole('textbox', { name: t('Buscar productos', 'Search products'), exact: true })
        .fill(t('Fruta', 'Fruit'));
      await button('Añadir Fruta a Semanal', 'Add Fruit to Semanal').click();
      await button('Volver a Semanal', 'Back to Semanal').click();
      await input().fill('Conservar');
      await page
        .getByRole('radio', { name: t('Guardar como habitual', 'Keep on saved list'), exact: true })
        .click();
      await button('Añadir producto escrito', 'Add typed product').click();
      await button('Editar Extra puntual', 'Edit Extra puntual').click();
      await expect(
        page.getByRole('radio', { name: t('Solo esta compra', 'This shop only'), exact: true }),
      ).toBeChecked();
      await button('Guardar producto', 'Save product').click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `artifacts/screenshots/purchase-extras-${language}.png` });
      await page.getByRole('tab', { name: t('Listas', 'Lists'), exact: true }).click();
      await button('Abrir Semanal', 'Open Semanal').click();
      await expect(button('Producto Habitual', 'Product Habitual')).toBeVisible();
      await expect(button('Producto Conservar', 'Product Conservar')).toBeVisible();
      await expect(button('Producto Extra puntual', 'Product Extra puntual')).toHaveCount(0);
      await expect(button('Producto Fruta', 'Product Fruit')).toHaveCount(0);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `artifacts/screenshots/saved-regular-${language}.png` });
      await button('Abrir compra', 'Open shop').click();
      await expect(
        page.getByRole('checkbox', {
          name: t('Comprar Extra puntual', 'Buy Extra puntual'),
          exact: true,
        }),
      ).toBeVisible();
      await button('Quitar del inicio', 'Remove from home').click();
      await button('Añadir al inicio', 'Add to home').click();
      await expect(
        page.getByRole('checkbox', {
          name: t('Comprar Extra puntual', 'Buy Extra puntual'),
          exact: true,
        }),
      ).toBeVisible();
      await page.reload();
      await button('Abrir Semanal', 'Open Semanal').click();
      await expect(
        page.getByRole('checkbox', {
          name: t('Comprar Extra puntual', 'Buy Extra puntual'),
          exact: true,
        }),
      ).toBeVisible();
      await button('Opciones de la lista', 'List options').click();
      await button('Volver a usar', 'Use again').click();
      await button('Empezar de nuevo', 'Start again').click();
      await expect(
        page.getByRole('checkbox', {
          name: t('Comprar Extra puntual', 'Buy Extra puntual'),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('checkbox', { name: t('Comprar Fruta', 'Buy Fruit'), exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('checkbox', { name: t('Comprar Habitual', 'Buy Habitual'), exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('checkbox', { name: t('Comprar Conservar', 'Buy Conservar'), exact: true }),
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });
}
