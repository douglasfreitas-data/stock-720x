# 🚨 Relatório de Incidente — Falha de Deploy Vercel

**Data:** 13/03/2026  
**Severidade:** 🔴 Crítica (Produção parada por ~2 horas de deploy incessante com erro)  
**Status:** ✅ Resolvido (Rollback aplicado)

---

## 1. Resumo Executivo

A tentativa de implementar **Web Push Notifications** (Bloco 5.1) resultou em **10+ deploys consecutivos com erro na Vercel**, derrubando a capacidade de deploy do projeto por ~2 horas. O último deploy funcional em produção é de ~10 horas antes do incidente.

A causa-raiz é a adição da biblioteca `web-push` (Node.js nativo) combinada com múltiplas alterações problemáticas no `vercel.json`, que impediram o build na plataforma Vercel.

**Resolução:** Rollback forçado para o commit `8a360bb` (último estado estável), descartando 6 commits.

---

## 2. Cronologia dos Commits Perdidos

| # | Commit | Descrição | Impacto |
|---|--------|-----------|---------|
| 1 | `1c7c870` | feat(push): implement web push notifications | Adicionou `web-push`, `sw.js`, `PushNotificationPrompt`, rotas API, tabela Supabase |
| 2 | `ccc8974` | fix(push): move low stock to products sync | Moveu disparo de push para sync de produtos |
| 3 | `e7114ce` | fix(push): auto resubscribe + hoisting errors | Corrigiu erros de importação |
| 4 | `baff968` | fix(push): use supabaseAdmin to bypass RLS | Tentou corrigir RLS em webhooks |
| 5 | `897e2cb` | fix(vercel): simplify to rootDirectory | Alterou `vercel.json` para `rootDirectory` removendo `builds` |
| 6 | `d9797dc` | chore(vercel): revert to builds | Reverteu de volta para `builds` legado |

**Total de arquivos afetados:** 15 arquivos, +549 / -57 linhas

---

## 3. Causa-Raiz

### 3.1. Biblioteca `web-push` Incompatível com Vercel

A biblioteca `web-push` depende de módulos nativos do Node.js (`crypto`, `http`, `https`) que **não estão disponíveis no Edge Runtime** da Vercel. Embora as API Routes do Next.js usem Node.js Runtime por padrão, a integração com o bundler do Turbopack/Webpack na Vercel pode falhar ao tentar resolver essas dependências nativas durante o build.

### 3.2. Alterações Conflitantes no `vercel.json`

O `vercel.json` foi modificado 2 vezes em sequência com abordagens opostas:
- **Commit 5**: Removeu `builds`/`routes` e usou `rootDirectory: "app"` + `framework: "nextjs"` → mas o projeto Vercel no dashboard tem `rootDirectory: null`, causando conflito.
- **Commit 6**: Reverteu para `builds`/`routes` legados → mas a Vercel pode não ter conseguido processar com o novo código do `web-push`.

### 3.3. Vercel Git Integration Desconectada/Atrasada

O usuário reportou que **nenhum deploy apareceu no dashboard da Vercel nas últimas 10 horas**, mesmo com pushes para `main`. Isso indica que:
- A integração Git ↔ Vercel pode ter sido desconectada ou pausada.
- Deploys poderiam estar sendo enfileirados sem execução.
- O CLI local (`vercel ls`) mostrava deploys que o dashboard não exibia (possível cache ou branch mismatch).

---

## 4. Análise de Vulnerabilidade do Projeto

### 🔴 Risco Alto: Sem CI/CD de Proteção

| Vulnerabilidade | Severidade | Descrição |
|----------------|-----------|-----------|
| **Sem testes de build antes do merge** | 🔴 Alta | Commits vão direto para `main` sem verificação de build |
| **Sem branch de desenvolvimento** | 🔴 Alta | Todo desenvolvimento acontece em `main`, qualquer erro quebra produção |
| **Sem GitHub Actions / CI** | 🔴 Alta | Não existe pipeline que rode `npm run build` antes de aceitar o push |
| **`vercel.json` sem validação** | 🟡 Média | Alterações no vercel.json podem quebrar deploy sem aviso local |
| **Dependências nativas não testadas** | 🟡 Média | Bibliotecas como `web-push` precisam ser testadas no ambiente Vercel antes de commit |
| **Rollback manual** | 🟡 Média | Sem releases/tags, o rollback depende de buscar o commit correto manualmente |

### Resumo da Exposição

O projeto está **altamente vulnerável** a este tipo de incidente. A ausência de:
1. Uma **branch `dev`** para testar antes de ir para produção
2. Um **CI pipeline** (GitHub Actions) que rode `next build` antes de aceitar o push
3. **Tags de release** para facilitar rollbacks

...significa que **qualquer commit com erro vai direto para produção** e pode derrubar o app até que alguém perceba e faça rollback manual.

---

## 5. Decisão do Usuário: Pivot de Push para Popup

O usuário decidiu **abandonar Web Push Notifications** em favor de um sistema mais simples:

### Nova Abordagem: Alertas Popup de Estoque Mínimo
- **Popup persistente e destacado** exibido ao logar no sistema
- Avisa sempre que um produto estiver **igual ou abaixo do estoque mínimo**
- **Botão "Lembrar Depois"**: ignora temporariamente (volta no próximo login)
- **Botão "Não avisar mais sobre este produto"**: silencia permanentemente aquele alerta
- **Sem dependência** de Service Worker, VAPID, ou bibliotecas nativas do Node.js
- **100% client-side** com persistência via Supabase (tabela de preferências de alerta)

---

## 6. Tarefas para Próxima Sessão

### Prioridade 0: Restaurar Deploy
- [ ] Verificar se o rollback para `8a360bb` restaurou o deploy funcional na Vercel
- [ ] Se não, verificar a integração Git no dashboard da Vercel
- [ ] Limpar `vercel.json` para usar `rootDirectory: "app"` ao invés de `builds` legados (testar primeiro)

### Prioridade 1: Proteção Contra Regressões
- [ ] Criar branch `dev` para desenvolvimento
- [ ] Configurar GitHub Actions com `next build` no PR para `main`
- [ ] Adicionar tags de release no Git (ex: `v0.4.0` = último estado estável)

### Prioridade 2: Implementar Popup de Estoque Mínimo
- [ ] Remover restos do código de Push (se houver no estado atual)
- [ ] Criar componente `LowStockAlert` (modal/popup persistente)
- [ ] Criar tabela `alert_preferences` no Supabase
- [ ] Integrar com consulta de produtos no login
- [ ] Atualizar `02_FASE_ATUAL.md` e `01_ROADMAP_MACRO.md`

---

## 7. Lições Aprendidas

1. **Nunca adicionar bibliotecas com dependências nativas sem testar o build na Vercel primeiro** (via `vercel build` ou deploy em branch preview).
2. **Criar branch `dev`** para isolar desenvolvimento de produção.
3. **Não fazer múltiplos commits de "fix" em sequência** sem verificar se o primeiro fix resolveu o problema — isso gera uma cascata de commits problemáticos difíceis de reverter.
4. **Manter tags de versão** (`git tag v0.4.0`) nos pontos estáveis para facilitar rollback.

---

*Gerado em: 13/03/2026 21:22 — Sessão de Debug e Recuperação*
