# GitHub Secrets Configuration

Vá em **Settings > Secrets and variables > Actions > New repository secret** e adicione:

## Obrigatórios para CI/CD

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `NEXTAUTH_SECRET` | Chave secreta NextAuth (32+ chars) | `abcdefghijklmnopqrstuvwxyz1234567890AB` |
| `NEXTAUTH_URL` | URL da aplicação | `https://seu-dominio.vercel.app` |

## Stripe (para pagamentos)

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `STRIPE_SECRET_KEY` | Chave secreta Stripe | `sk_live_...` ou `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe | `pk_live_...` ou `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret (para produção) | `whsec_...` |

## Vercel Deploy (opcional - para auto-deploy)

| Secret | Descrição | Onde encontrar |
|--------|-----------|----------------|
| `VERCEL_TOKEN` | Token de acesso Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | ID da organização | `vercel inspect <deploy-url>` |
| `VERCEL_PROJECT_ID` | ID do projeto | `vercel inspect <deploy-url>` |

## Notificações (opcional)

| Secret | Descrição |
|--------|-----------|
| `SLACK_WEBHOOK_URL` | Webhook do Slack para alertas |
| `DISCORD_WEBHOOK_URL` | Webhook do Discord para alertas |

---

## Como gerar NEXTAUTH_SECRET

```bash
# Opção 1: OpenSSL (Linux/Mac/Git Bash)
openssl rand -base64 32

# Opção 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opção 3: PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } -as [byte[]]))
```

---

## Como obter Vercel IDs

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy manual inicial (cria o projeto)
vercel --prod

# 4. Ver IDs
vercel inspect <url-do-deploy>
# Procure por "Organization ID" e "Project ID"
```

---

## Configurar Stripe Webhook (Produção)

1. No Stripe Dashboard: **Developers > Webhooks > Add endpoint**
2. URL: `https://seu-dominio.vercel.app/api/webhooks/stripe`
3. Eventos: 
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copie **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Verificar se tudo funcionou

Após adicionar os secrets, faça um push para `main`:

```bash
git add .
git commit -m "chore: add GitHub Actions CI/CD"
git push origin main
```

Vá em **Actions** no GitHub e veja o pipeline rodando ✅