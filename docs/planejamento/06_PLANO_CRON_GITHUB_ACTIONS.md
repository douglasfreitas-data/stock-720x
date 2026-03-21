# Plano de Implementação: Sincronização de Alta Frequência via GitHub Actions

Este documento apresenta a infraestrutura alternativa desenhada para **ultrapassar o limite de 2 Cron Jobs diários** do plano Vercel Hobby Gratuitamente, aumentando a acuracidade de estoque durante o horário comercial por meio do GitHub Actions.

## 1. O Problema da Infraestrutura Atual
O sistema **Stock 720x** hoje opera no Vercel Hobby, cuja automação é limitada:
- **Limite:** 2 Execuções diárias agendadas (Cron Jobs).
- Atuais: `06:00 UTC` e `18:00 UTC`.
- **Problema:** Um intervalo muito longo (12 horas) durante o pico de vendas comerciais deixa margem para ruptura de estoque físico x online.

## 2. A Solução Proposta: Cron Serverless Externo (GitHub Actions)
Como o repositório (`douglasfreitas-data/stock-720x`) está hospedado no GitHub, podemos usar a cota de 2.000 minutos/mês do GitHub Actions para criar um "robô" que realiza uma requisição HTTP programada para a API da Vercel. 
Como a rota `/api/sync` é protegida mediante senha (`Bearer CRON_SECRET`), a Vercel interpretará isso como uma chamada de API normal (limite quase infinito) em vez de um Cron Job proprietário da Vercel.

### 2.1 Passo a Passo da Configuração no GitHub
Para aplicar a automação, siga as etapas abaixo no próprio GitHub (Web):

1. Vá até o repositório da aplicação no GitHub.
2. Acesse a aba **"Settings"** > **"Secrets and variables"** > **"Actions"**.
3. Clique em **"New repository secret"**.
   - Name: `CRON_SECRET`
   - Secret: *(Cole a mesma senha que está cadastrada no painel da Vercel)*
4. Adicione outra secret para a URL.
   - Name: `PRODUCTION_URL`
   - Secret: `https://seu-dominio-na-vercel.vercel.app`

### 2.2 Criação do Arquivo de Rotina (`.yml`)
Basta criar um arquivo no caminho raiz do código: `.github/workflows/sync-cron.yml` com o seguinte conteúdo:

```yaml
name: "High-Frequency Sync (Nuvemshop)"

on:
  schedule:
    # Roda a cada 2 horas, apenas nos dias de semana (Seg-Sex), durante horário comercial
    # "0 10,12,14,16,18,20,22 * * 1-5" (Horários UTC. Ajuste para BRT deduzindo 3h)
    - cron: '0 11,13,15,17,19,21 * * 1-6'
  workflow_dispatch: # Permite apertar um botão e rodar manualmente no GitHub

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Acordar a Vercel e Sincronizar
        run: |
          curl -X GET "${{ secrets.PRODUCTION_URL }}/api/sync" \\
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 2.3 Cálculo de Custo e Viabilidade (Tudo Gratuito)
- **Minutos fornecidos pelo GitHub (Free):** 2.000 min/mês (em repositórios privados).
- **Consumo do Curl:** Cada execução leva cerca de ~5 a 10 segundos.
- **Requisições por dia:** Se rodar a cada 2 horas no horário comercial, teremos cerca de 6 a 8 execuções diárias = 1 minuto/dia.
- **Consumo Total Mensal:** ~30 Minutos.
- **Sobra:** ~1970 minutos por mês sobrando.
- **Restrição Vercel:** O limite de requests HTTP serverless na Vercel Free é 100.000 por dia. O GitHub baterá ali apenas 8 vezes a mais por dia, passando perfeitamente despercebido pela precificação de Crons.

## 3. Considerações e Alertas (Próximos Passos)
Quando se decidir pela implementação, tome as seguintes precauções:
1. Revise o arquivo `vercel.json` e **delete as crons nativas da Vercel** para evitar choque de chamadas no mesmo minuto que o GitHub Actions.
2. Não diminua o gatilho para menos de "1 em 1 hora". Consultar o servidor da Nuvemshop repetidamente em curtos espaços de tempo (ex: 5 em 5 min) fará a Nuvemshop lançar um erro `HTTP 429 Too Many Requests` (limitação de taxa).
3. A página "Logs do Sistema" continuará exibindo e medindo tudo normalmente, pois o log é injetado no final da requisição no banco de dados, não importando quem chamou a URL.
