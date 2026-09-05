import { test, expect, type Page } from '@playwright/test';
const button = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
async function onboard(p: Page, name: string) {
  await p.goto('/');
  await p.getByRole('textbox', { name: 'Tu nombre', exact: true }).fill(name);
  await button(p, 'Empezar mi cesta').click();
}
async function create(p: Page, name: string) {
  await p.getByRole('tab', { name: 'Inicio', exact: true }).click();
  await button(p, 'Pegar lista').click();
  await p.getByRole('textbox', { name: 'Nombre de la lista', exact: true }).fill(name);
  await p.getByRole('textbox', { name: 'Texto de la compra', exact: true }).fill('yogur, fruta');
  await button(p, 'Preparar lista').click();
  await button(p, 'Añadir 2 productos').click();
}
async function add(p: Page, name: string) {
  await p.getByRole('textbox', { name: 'Añadir producto', exact: true }).fill(name);
  await button(p, 'Añadir producto escrito').click();
}
test('Personal lists make no API calls; shared lists send deltas and recover offline edits', async ({
  browser,
}) => {
  const a = await browser.newContext({ locale: 'es-ES', viewport: { width: 390, height: 844 } }),
    b = await browser.newContext({ locale: 'es-ES', viewport: { width: 390, height: 844 } });
  const pa = await a.newPage(),
    pb = await b.newPage();
  const calls: string[] = [];
  const frames: string[] = [];
  pa.on('request', (r) => {
    if (r.url().includes('/api/')) calls.push(r.url());
  });
  pa.on('websocket', (ws) => ws.on('framereceived', (f) => frames.push(String(f.payload))));
  try {
    await onboard(pa, 'Ana');
    await create(pa, 'Compra nube');
    await add(pa, 'Privado');
    await pa.waitForTimeout(3000);
    expect(calls).toEqual([]);
    await button(pa, 'Opciones de la lista').click();
    await expect(pa.getByText('Solo en este dispositivo', { exact: true })).toBeVisible();
    await button(pa, 'Compartir lista').click();
    const invitation = pa.waitForResponse((r) => r.url().endsWith('/invite') && r.status() === 200);
    await button(pa, 'Usar en mis dispositivos').click();
    const data = await (await invitation).json();
    expect(data.code).toMatch(/^[a-f0-9]{32}\.[a-zA-Z0-9_-]{24}$/);
    await pa.screenshot({ path: 'artifacts/screenshots/cloud-share-es.png' });
    await button(pa, 'Cerrar ventana').click();
    await onboard(pb, 'Luis');
    await pb.goto('/#join=' + data.code);
    await button(pb, 'Unirme a la lista').click();
    await expect(pb.getByRole('checkbox', { name: 'Comprar Privado', exact: true })).toBeVisible();
    await expect.poll(() => frames.some((raw) => JSON.parse(raw).type === 'snapshot')).toBe(true);
    const idleCalls = calls.length,
      idleFrames = frames.length;
    await pa.waitForTimeout(3000);
    expect(calls.length).toBe(idleCalls);
    expect(frames.length).toBe(idleFrames);
    await Promise.all([add(pa, 'Desde Ana'), add(pb, 'Desde Luis')]);
    await expect(
      pa.getByRole('checkbox', { name: 'Comprar Desde Luis', exact: true }),
    ).toBeVisible();
    await expect(
      pb.getByRole('checkbox', { name: 'Comprar Desde Ana', exact: true }),
    ).toBeVisible();
    expect(frames.some((raw) => JSON.parse(raw).type === 'change')).toBe(true);
    await b.setOffline(true);
    await add(pb, 'Sin cobertura');
    await add(pa, 'Sigue conectado');
    await b.setOffline(false);
    await expect(
      pa.getByRole('checkbox', { name: 'Comprar Sin cobertura', exact: true }),
    ).toBeVisible();
    await expect(
      pb.getByRole('checkbox', { name: 'Comprar Sigue conectado', exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        pb.evaluate(() => JSON.parse(localStorage.getItem('cesta-state-v2')!).pending.length),
      )
      .toBe(0);
    await pb.reload();
    await button(pb, 'Abrir Compra nube').click();
    await expect(
      pb.getByRole('checkbox', { name: 'Comprar Sin cobertura', exact: true }),
    ).toBeVisible();
    const ownLists = await pb.evaluate(
      () => JSON.parse(localStorage.getItem('cesta-state-v2')!).snapshot.lists.length,
    );
    expect(ownLists, 'Joining preserves four private starter lists').toBe(5);
    await button(pa, 'Opciones de la lista').click();
    await button(pa, 'Guardar solo en este dispositivo').click();
    await button(pa, 'Guardar copia local').click();
    await expect
      .poll(() =>
        pa.evaluate(
          () => Object.keys(JSON.parse(localStorage.getItem('cesta-state-v2')!).cloud).length,
        ),
      )
      .toBe(0);
    await expect
      .poll(() =>
        pb.evaluate(
          () => Object.keys(JSON.parse(localStorage.getItem('cesta-state-v2')!).cloud).length,
        ),
      )
      .toBe(0);
    await expect(
      pa.getByRole('checkbox', { name: 'Comprar Desde Luis', exact: true }),
    ).toBeVisible();
  } finally {
    await a.close();
    await b.close();
  }
});
test('Installed web shell reopens and edits personal lists offline', async ({ page, context }) => {
  await onboard(page, 'Ana');
  await create(page, 'Compra sin Internet');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await button(page, 'Abrir Compra sin Internet').click();
  await add(page, 'Guardado offline');
  await page.reload();
  await button(page, 'Abrir Compra sin Internet').click();
  await expect(page.getByRole('checkbox', { name: 'Comprar Guardado offline', exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/cloud-offline-es.png' });
  await context.setOffline(false);
});

test('Legacy LAN data migrates to local copies without uploading personal lists', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/')) requests.push(r.url());
  });
  await page.addInitScript(() => {
    const list = {
      id: 'a'.repeat(32),
      name: 'Lista anterior',
      emoji: '🛒',
      color: 'sage',
      ownerId: 'old-owner',
      createdAt: new Date().toISOString(),
      members: [
        { id: 'old-owner', name: 'Ana', role: 'owner' },
        { id: 'other', name: 'Luis', role: 'editor' },
      ],
      items: [
        {
          id: 'b'.repeat(32),
          name: 'Arroz',
          emoji: '🍚',
          category: 'pantry',
          quantity: 1,
          unit: 'ud',
          checked: false,
          note: '',
          addedBy: 'Ana',
        },
      ],
    };
    if (!localStorage.getItem('cesta-state-v2'))
      localStorage.setItem(
        'cesta-state-v1',
        JSON.stringify({
          onboarded: true,
          snapshot: { device: { id: 'old-owner', name: 'Ana' }, lists: [list] },
          pending: [
            {
              id: 'c'.repeat(32),
              listId: list.id,
              type: 'item.increment',
              data: { id: 'b'.repeat(32), delta: 2 },
            },
          ],
          activeListIds: [list.id],
          starterListsVersion: 1,
        }),
      );
  });
  await page.goto('/');
  await button(page, 'Abrir Lista anterior').click();
  await expect(page.getByRole('checkbox', { name: 'Comprar Arroz', exact: true })).toContainText(
    '3',
  );
  await page.waitForTimeout(3000);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => !!localStorage.getItem('cesta-state-v1'))).toBe(true);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('cesta-state-v2')!).pending.length),
  ).toBe(0);
});
