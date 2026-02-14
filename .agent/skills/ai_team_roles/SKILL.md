---
name: "ai_team_roles"
description: "Guidelines for assigning tasks to different AI models to optimize token usage and efficiency."
---

# AI Team Structure & Token Optimization

## 🎯 Objetivo
Maximizar eficiência e minimizar custo de tokens atribuindo cada tarefa ao modelo certo.

## 👥 Os Modelos (Funções)

| Papel | Modelo | Quando Usar | Custo |
|-------|--------|-------------|-------|
| **Arquiteto** | Opus 4 / o1 | Planejamento, debugging complexo, arquitetura | $$$$ |
| **Dev Senior** | Sonnet 4 / Opus 4 | Implementação de features, refactoring | $$$ |
| **Dev Junior** | Gemini 2.5 Flash / GPT-4o | Tarefas rotineiras, copiar padrões, testes | $$ |

---

## 🚀 Guia Prático — Como Usar no Dia a Dia

### Passo 1: Sempre comece com `/iniciar`
Isso carrega o contexto mínimo (`SUMMARY.md`, `TIMESHEET.md`, `ROADMAP.md`).

### Passo 2: Escolha o modelo pela tarefa, não pela sessão

#### Para PLANEJAR (use Opus 4 / o1):
> **Prompt exemplo:**
> ```
> Leia docs/ROADMAP.md e .agent/SUMMARY.md.
> Crie um implementation_plan.md para a tarefa F3.3 (QR Code).
> Inclua: arquivos a criar/modificar, dependências e plano de verificação.
> ```

#### Para IMPLEMENTAR (use Sonnet 4):
> **Prompt exemplo:**
> ```
> Leia .agent/SUMMARY.md e o implementation_plan.md da conversa anterior.
> Execute os itens 1 e 2 do plano. Não altere a arquitetura.
> Quando terminar, rode /atualize.
> ```

#### Para TAREFAS SIMPLES (use Gemini Flash / GPT-4o):
> **Prompt exemplo:**
> ```
> Leia .agent/SUMMARY.md.
> Crie a página /stock/entry seguindo exatamente o padrão
> de /stock/checkout (mesmo layout, componentes, estilo).
> ```

---

## 📋 Regra de Ouro: Cada Sessão = 1 Tarefa

**ANTES de começar**, defina:
1. **Qual tarefa?** → Use o ID do `ROADMAP.md` (ex: `F3.3.1`)
2. **Qual modelo?** → Veja a tabela acima
3. **Qual prompt?** → Veja os exemplos acima

**DEPOIS de terminar**, sempre execute:
- `/atualize` → Atualiza docs, commit e push

---

## 🔄 Fluxo Completo de uma Feature

```
1. [Opus 4]   /iniciar → Escolhe a próxima tarefa do ROADMAP
2. [Opus 4]   Cria implementation_plan.md → Você aprova
3. [Sonnet 4] Implementa o code seguindo o plano
4. [Sonnet 4] Verifica (build, testes)
5. [Qualquer] /atualize → Commit, push, atualiza docs
```

Para features simples (1 arquivo, sem decisão de arquitetura):
```
1. [Sonnet 4]  /iniciar → Implementa direto → /atualize
```


---

## 🐛 Fluxo de Resolução de Bugs

O workflow `/bug` é apenas a **TRIAGEM**. A resolução segue este fluxo hierárquico:

1. **Ingestão (Qualquer Modelo)**
   - Executa `/bug` para importar do arquivo diário.
   - Resultado: Bug aparece no `BUG_TRACKER.md` como "Aberto".

2. **Análise & Estratégia (Arquiteto/Opus 4)**
   - Lê o bug e os arquivos suspeitos.
   - **NÃO CORRIGE O CÓDIGO AINDA.**
   - Atualiza o `BUG_TRACKER.md` com um plano técnico detalhado na seção "Ação".
   - Cria um `implementation_plan.md` se a correção for complexa/arriscada.

3. **Execução (Dev Senior/Sonnet 4)**
   - Lê o plano do Arquiteto.
   - Aplica a correção.
   - Verifica (Build/Teste).
   - Atualiza status para "Resolvido".

---


## 📂 Documentos-Chave (Contexto Mínimo)

| Arquivo | O que contém | Quando ler |
|---------|--------------|------------|
| `SUMMARY.md` | Estado atual do projeto | **Sempre** (toda sessão) |
| `docs/ROADMAP.md` | O quê falta fazer | Ao escolher a próxima tarefa |
| `TIMESHEET.md` | Horas gastas | Ao finalizar sessão |
| `implementation_plan.md` | Como fazer a tarefa atual | Antes de implementar |

> **Dica:** Nunca peça para o modelo "ler todo o código". Aponte para 
> os 2-3 arquivos específicos que ele precisa.

---

## 🪙 Regras de Economia de Tokens

> **Lema do projeto:** *"Economia de tokens alcançando ótimos resultados"*

1. **NUNCA** fazer auditoria via navegador (abrir telas, screenshots, comparar) sem o usuário pedir explicitamente.
2. **Bugs e UX:** O usuário testa e envia a lista → o agente corrige em lote lendo só os arquivos afetados.
3. **Evitar reler arquivos** que já foram lidos na mesma sessão.
4. **Preferir comparação de código** (grep, view_file) em vez de navegação no browser.
5. **Sessões curtas e focadas:** 1 tarefa por sessão, nunca expandir o escopo sem perguntar.

---

## ⚡ Atalhos Disponíveis

| Comando | Quando usar |
|---------|-------------|
| `/iniciar` | Início de cada sessão |
| `/atualize` | Final de cada sessão (commit + docs) |
