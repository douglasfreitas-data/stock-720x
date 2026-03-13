import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
        // Tenta acessar página protegida
        await page.goto('/');
        
        // Deve redirecionar para a página de login
        await expect(page).toHaveURL(/.*\/login/);
        
        // Deve mostrar o formulário de login
        await expect(page.locator('form input[type="email"]')).toBeVisible();
        await expect(page.locator('form input[type="password"]')).toBeVisible();
    });

    test('should allow user to navigate to register page', async ({ page }) => {
        await page.goto('/login');
        
        // Clica no link de cadastro
        await page.click('text=Cadastre-se');
        
        // Verifica se foi para a página de registro
        await expect(page).toHaveURL(/.*\/register/);
        await expect(page.locator('h1', { hasText: 'Criar Conta' })).toBeVisible();
    });
});
