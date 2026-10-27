# ABIVA – Landing da Pesquisa (Vite + React + Express)

Fluxo: o usuário preenche o formulário → `POST /api/leads` salva o cadastro → é redirecionado para `/download`, onde baixa a pesquisa via link temporário (30 min).

## Rodar
```bash
npm install
npm run dev          # front em http://localhost:5173 + API em :3001
```

## Produção
```bash
npm run build
ADMIN_KEY=sua-chave npm start   # serve dist/ + API na porta 3001
```

## Importante
- **Substitua o PDF**: coloque o arquivo real em `server/private/pesquisa.pdf` (hoje é um exemplo). A pasta `private` não é pública; o download só funciona com token.
- **Cadastros** ficam em `server/data/leads.json`. Exporte em CSV: `/api/admin/leads.csv?key=SUA_CHAVE` (defina `ADMIN_KEY`, veja `.env.example`).
- **Logos**: `public/imagens/logo1.png` (ABIVA), `logo2.png` (ASTRA), `logo3.png` (UNIVALI).
# abivaSite
