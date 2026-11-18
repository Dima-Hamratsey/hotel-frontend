import { test, expect, type Page } from '@playwright/test';

const SHOTS = 'e2e/screenshots';

function iso(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Збирає помилки консолі та JS-винятки, щоб тест упав, якщо щось зламалося. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    // Помилки HTTP логуються нижче разом з URL, тут їх пропускаємо.
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) {
      errors.push(`console: ${m.text()}`);
    }
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.request().method()} ${r.url()}`);
  });
  return errors;
}

async function shot(page: Page, name: string) {
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SHOTS}/${test.info().project.name}/${name}.png`, fullPage: true });
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login/);
}

test.describe('Публічна частина', () => {
  test('головна, каталог, фільтри, номер, послуги @mobile', async ({ page }) => {
    const errors = trackErrors(page);

    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await shot(page, '01-home');

    await page.goto('/rooms');
    await expect(page.locator('a[href^="/rooms/"]').first()).toBeVisible();
    await shot(page, '02-catalog');

    await page.goto(`/rooms?guests=3&check_in=${iso(40)}&check_out=${iso(43)}&sort=price_desc`);
    await shot(page, '03-catalog-filtered');

    await page.goto('/rooms/9');
    await expect(page.locator('h1')).toBeVisible();
    await shot(page, '04-room');

    await page.goto('/services');
    await shot(page, '05-services');

    await page.goto('/login');
    await shot(page, '06-login');
    await page.goto('/register');
    await shot(page, '07-register');

    await page.goto('/no-such-page');
    await shot(page, '08-404');

    expect(errors).toEqual([]);
  });
});

test.describe('Клієнт', () => {
  test('бронювання, кабінет, продовження, скасування @mobile', async ({ page }) => {
    const errors = trackErrors(page);
    await login(page, 'client@hotel.ua', 'client123');

    // Випадкові дати далеко в майбутньому, щоб повторні прогони не конфліктували.
    const offset = 120 + Math.floor(Math.random() * 400);
    await page.goto('/rooms/5');
    const dates = page.locator('.booking-panel input[type="date"]');
    await dates.nth(0).fill(iso(offset));
    await dates.nth(1).fill(iso(offset + 3));
    await page.locator('.booking-panel input[type="checkbox"]').first().check();
    await expect(page.locator('.booking-panel')).toContainText('₴');
    await page.waitForTimeout(800); // debounce розрахунку
    await shot(page, '10-room-quote');

    await page.getByRole('button', { name: 'Забронювати' }).click();
    await page.waitForURL(/cabinet/, { timeout: 10_000 }).catch(() => undefined);
    await shot(page, '11-after-booking');

    await page.goto('/cabinet');
    await expect(page.getByText('Скасувати').first()).toBeVisible();
    await shot(page, '12-cabinet');

    // Продовження
    await page.getByRole('button', { name: 'Продовжити' }).first().click();
    await expect(page.locator('.modal')).toBeVisible();
    await shot(page, '13-extend-modal');
    await page.keyboard.press('Escape');

    // Скасування (діалог підтвердження)
    await page.getByRole('button', { name: 'Скасувати' }).first().click();
    await shot(page, '14-cancel-confirm');
    await page.keyboard.press('Escape');

    expect(errors).toEqual([]);
  });
});

test.describe('Адмін', () => {
  test('усі сторінки адмінки @mobile', async ({ page }) => {
    const errors = trackErrors(page);
    await login(page, 'admin@hotel.ua', 'admin123');

    const pages: [string, string][] = [
      ['/admin', '20-dashboard'],
      ['/admin/reports', '21-reports'],
      ['/admin/bookings', '22-bookings'],
      ['/admin/users', '23-users'],
      ['/admin/rooms', '24-rooms'],
      ['/admin/categories', '25-categories'],
      ['/admin/amenities', '26-amenities'],
      ['/admin/services', '27-services'],
      ['/admin/settings', '28-settings'],
    ];
    for (const [url, name] of pages) {
      await page.goto(url);
      await page.waitForTimeout(500); // анімації графіків
      await shot(page, name);
    }

    // Форма редагування номера
    await page.goto('/admin/rooms');
    await page.getByRole('button', { name: /Редагувати/ }).first().click();
    await expect(page.locator('.modal')).toBeVisible();
    await shot(page, '29-room-edit-modal');

    expect(errors).toEqual([]);
  });
});
