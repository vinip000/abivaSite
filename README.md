<<<<<<< HEAD
# abivaSite – Landing da Pesquisa ABIVA (Vite + React + Express + MongoDB)

Fluxo: o usuário preenche o formulário → `POST /api/leads` salva o cadastro no MongoDB → é redirecionado para `/download`, onde baixa a pesquisa via link temporário (30 min).

## Configuração
1. Copie `.env.example` para `.env` e preencha:
   - `MONGODB_URI`: string de conexão do Atlas (Database → Connect → Drivers). Troque `<senha>` pela senha do usuário do banco.
   - `ADMIN_KEY`: chave para exportar os cadastros.
2. No Atlas, em **Network Access**, libere o IP de onde o servidor vai rodar (para testar na sua máquina, adicione o seu IP).
3. Rode:
=======
# ABIVA – Landing da Pesquisa (Vite + React + Express)

Fluxo: o usuário preenche o formulário → `POST /api/leads` salva o cadastro → é redirecionado para `/download`, onde baixa a pesquisa via link temporário (30 min).

## Rodar
>>>>>>> origin/main
```bash
npm install
npm run dev          # front em http://localhost:5173 + API em :3001
```

## Produção
```bash
npm run build
<<<<<<< HEAD
npm start            # serve dist/ + API (defina as variáveis de ambiente no servidor)
```

## Dados
- Banco `abiva` (ou o nome em `MONGODB_DB`), coleções:
  - `leads`: nome, telefone, email, empresa, cargo, consentimentoLgpd, criadoEm, ip
  - `download_tokens`: links de download temporários (expiram sozinhos via índice TTL)
- Exportar em CSV: `/api/admin/leads.csv?key=SUA_CHAVE`

## Importante
- **Substitua o PDF**: coloque o arquivo real em `server/private/pesquisa.pdf` (hoje é um exemplo). A pasta `private` não é pública; o download só funciona com token.
- **Nunca** suba o arquivo `.env` para o GitHub (já está no `.gitignore`).
- Logos em `public/imagens/` (`logo1` ABIVA, `logo2` ASTRA, `logo3` UNIVALI); fotos de fundo `porto-por-do-sol.jpg` e `porto-dia.jpg`.
=======
ADMIN_KEY=sua-chave npm start   # serve dist/ + API na porta 3001
```

## Importante
- **Substitua o PDF**: coloque o arquivo real em `server/private/pesquisa.pdf` (hoje é um exemplo). A pasta `private` não é pública; o download só funciona com token.
- **Cadastros** ficam em `server/data/leads.json`. Exporte em CSV: `/api/admin/leads.csv?key=SUA_CHAVE` (defina `ADMIN_KEY`, veja `.env.example`).
- **Logos**: `public/imagens/logo1.png` (ABIVA), `logo2.png` (ASTRA), `logo3.png` (UNIVALI).
# abivaSite
>>>>>>> origin/main
