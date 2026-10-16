import { type Page } from '@playwright/test';

// Feature-specific tutorial coverage lives in verify-tutorial-ui.mjs. Other flows
// intentionally skip it while still going through the real first-run screen.
export async function skipTutorial(page: Page) {
  const guide = page.getByRole('button', { name: /^(Omitir tutorial|Skip tutorial)$/ });
  await guide
    .or(page.getByRole('textbox', { name: /^(Tu nombre|Your name)$/ }))
    .or(page.getByRole('tab', { name: /^(Inicio|Home)$/ }))
    .or(page.getByRole('dialog'))
    .first()
    .waitFor();
  if (await guide.isVisible()) await guide.click();
}
