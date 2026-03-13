import { test, expect } from '@playwright/test';

// Como o login depende de credenciais reais/banco,
// o smoke test da home (/) normalmente falha sem autenticação.
// Para testar a home E2E complexa precisaríamos de fixtures de login bypass.
// Mas podemos testar se o build dos recursos estáticos e assets da home estrutural existem.

test.describe('PDV Interface Shell', () => {
    test('should have essential layout elements when accessing login', async ({ page }) => {
        await page.goto('/login');
        
        // Verifica se a marca "Stock 720x" carrega na tela de login
        await expect(page.locator('h1', { hasText: 'Stock 720x' })).toBeVisible();
    });

    // Esse teste falhará propositalmente caso o ambiente de teste
    // não logue o usuário, pois será redirecionado.
    // É um placeholder configurado com .skip para ser reativado
    // quando implementarmos login dinâmico no E2E (auth setup).
    test.skip('should render the main PDV dashboard if authenticated', async ({ page }) => {
        await page.goto('/');
        
        // Verifica o Header Global (Logo + Cart)
        await expect(page.locator('.header .logo')).toBeVisible();
        await expect(page.locator('.header-menu a[href="/cart"]')).toBeVisible();
        
        // Verifica grid de navegação principal
        await expect(page.locator('.menu-grid')).toBeVisible();
        await expect(page.locator('text=Nova Venda')).toBeVisible();
    });
});
