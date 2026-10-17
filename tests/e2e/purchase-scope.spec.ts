import { skipTutorial } from './tutorial-helper';
import { test, expect } from '@playwright/test';
for (const language of ['es', 'en'] as const)
  test(`Saved lists and Home shops stay independent (${language})`, async ({ browser }) => {
    const context = await browser.newContext({
      locale: language === 'es' ? 'es-ES' : 'en-GB',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const t = (es: string, en: string) => (language === 'es' ? es : en);
    const button = (es: string, en = es) =>
      page.getByRole('button', { name: t(es, en), exact: true });
    const tab = (es: string, en: string) => page.getByRole('tab', { name: t(es, en), exact: true });
    const add = async (name: string) => {
      await page
        .getByRole('textbox', { name: t('Añadir producto', 'Add product'), exact: true })
        .fill(name);
      await button('Añadir producto escrito', 'Add typed product').click();
    };
    try {
      await page.goto('/');
      await skipTutorial(page);
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
      await page
        .getByRole('checkbox', { name: t('Comprar Habitual', 'Buy Habitual'), exact: true })
        .click();
      await tab('Listas', 'Lists').click();
      await button('Abrir Semanal', 'Open Semanal').click();
      await expect(button('Producto Extra puntual', 'Product Extra puntual')).toHaveCount(0);
      await expect(page.getByRole('checkbox')).toHaveCount(0);
      await tab('Inicio', 'Home').click();
      await button('Abrir Semanal', 'Open Semanal').click();
      await button('Opciones de la lista', 'List options').click();
      await button('Actualizar lista', 'Update saved list').click();
      await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(1);
      await button('Quitar del inicio', 'Remove from home').click();
      await expect(button('Abrir Semanal', 'Open Semanal')).toHaveCount(0);
      await tab('Listas', 'Lists').click();
      await button('Abrir Semanal', 'Open Semanal').click();
      await expect(button('Producto Extra puntual', 'Product Extra puntual')).toBeVisible();
      await button('Añadir al inicio', 'Add to home').click();
      await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);
      await page.reload();
      await button('Abrir Semanal', 'Open Semanal').click();
      const pending = page.getByRole('checkbox', { checked: false });
      while (await pending.count()) await pending.first().click();
      await button('Terminar compra', 'Finish shop').click();
      await tab('Listas', 'Lists').click();
      await expect(button('Abrir Semanal', 'Open Semanal')).toBeVisible();
    } finally {
      await context.close();
    }
  });

test('Upgrade from 1.3 keeps shopping progress and creates a separate reusable saved list once', async ({page}) => {
  const calls:string[]=[];
  page.on('request',r=>{if(r.url().includes('/api/'))calls.push(r.url());});
  await page.addInitScript(()=>{
    if(localStorage.getItem('upgrade-fixture'))return;
    localStorage.setItem('upgrade-fixture','1');
    const product={emoji:'🍎',category:'fresh',unit:'ud',quantity:2,note:'Madura',addedBy:'Ana'};
    localStorage.setItem('cesta-state-v2',JSON.stringify({onboarded:true,tutorialSeen:true,language:'es',starterListsVersion:1,activeListIds:['old'],selectedId:'old',pending:[],cloud:{},sequence:0,favorites:[],customProducts:[],snapshot:{device:{id:'old-device',name:'Ana'},lists:[{id:'old',name:'Anterior',emoji:'🛒',color:'sage',ownerId:'old-device',members:[{id:'old-device',name:'Ana',role:'owner'}],createdAt:'2026-10-16',items:[{...product,id:'regular',name:'Habitual',checked:true},{...product,id:'extra',name:'Extra',checked:false,oneTime:true}]}]}}));
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Abrir Anterior',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Desmarcar Habitual',exact:true})).toBeVisible();
  const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cesta-state-v2')!));
  await expect.poll(async()=>(await read()).purchasesVersion).toBe(1);
  const data=await read(), source=data.snapshot.lists.find((l:any)=>l.id===data.purchaseSources.old);
  expect(source.id).not.toBe('old'); expect(source.items).toHaveLength(1); expect(source.items[0]).toMatchObject({name:'Habitual',quantity:2,note:'Madura',checked:false});
  await page.reload(); expect((await read()).snapshot.lists).toHaveLength(2);
  expect(calls).toEqual([]);
});
