import { test, expect } from '@playwright/test'

test('login page loads', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 5000 })
})

test('help page renders', async ({ page }) => {
  await page.goto('/help', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('text=Help').first()).toBeVisible({ timeout: 5000 })
})


