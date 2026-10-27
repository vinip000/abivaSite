import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const DATA_FILE = path.join(__dirname, 'data', 'leads.json');
const PDF_FILE = path.join(__dirname, 'private', 'pesquisa.pdf');
const TOKEN_TTL_MS = 30 * 60 * 1000; // link de download vale 30 min

const app = express();
app.use(express.json({ limit: '20kb' }));

// ---------- persistência simples em JSON ----------
function readLeads() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function saveLead(lead) {
  const leads = readLeads();
  leads.push(lead);
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
}

// tokens de download em memória: token -> { expires, leadId }
const tokens = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [t, v] of tokens) if (v.expires < now) tokens.delete(t);
}, 60 * 1000).unref();

// ---------- validação ----------
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max = 120) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

function validate(body) {
  const d = {
    nome: clean(body.nome),
    telefone: clean(body.telefone, 25),
    email: clean(body.email).toLowerCase(),
    empresa: clean(body.empresa),
    cargo: clean(body.cargo),
    lgpd: body.lgpd === true,
  };
  const errors = {};
  if (d.nome.length < 3) errors.nome = 'Informe seu nome completo.';
  if (d.telefone.replace(/\D/g, '').length < 10) errors.telefone = 'Informe um telefone válido com DDD.';
  if (!emailRe.test(d.email)) errors.email = 'Informe um e-mail válido.';
  if (!d.empresa) errors.empresa = 'Informe sua empresa.';
  if (!d.cargo) errors.cargo = 'Informe seu cargo.';
  if (!d.lgpd) errors.lgpd = 'É necessário concordar com o uso dos dados.';
  return { d, errors };
}

// ---------- rotas ----------
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

app.post('/api/leads', leadLimiter, (req, res) => {
  const { d, errors } = validate(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const id = crypto.randomUUID();
  saveLead({
    id,
    nome: d.nome,
    telefone: d.telefone,
    email: d.email,
    empresa: d.empresa,
    cargo: d.cargo,
    consentimentoLgpd: true,
    criadoEm: new Date().toISOString(),
    ip: req.ip,
  });

  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, { expires: Date.now() + TOKEN_TTL_MS, leadId: id });
  res.status(201).json({ token });
});

app.get('/api/download', (req, res) => {
  const t = tokens.get(String(req.query.token || ''));
  if (!t || t.expires < Date.now()) {
    return res.status(403).json({ error: 'Link expirado ou inválido. Preencha o formulário novamente.' });
  }
  if (!fs.existsSync(PDF_FILE)) {
    return res.status(404).json({ error: 'Arquivo da pesquisa indisponível no momento.' });
  }
  res.download(PDF_FILE, 'ABIVA-Impacto-da-Reforma-Tributaria-SC.pdf');
});

app.get('/api/token-valido', (req, res) => {
  const t = tokens.get(String(req.query.token || ''));
  res.json({ valido: !!t && t.expires >= Date.now() });
});

// exportação dos cadastros (protegida por chave)
app.get('/api/admin/leads.csv', (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) return res.status(401).send('Não autorizado');
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const cols = ['nome', 'telefone', 'email', 'empresa', 'cargo', 'criadoEm'];
  const rows = readLeads().map((l) => cols.map((c) => esc(l[c])).join(';'));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-abiva.csv"');
  res.send('\ufeff' + [cols.join(';'), ...rows].join('\n'));
});

// ---------- front em produção ----------
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
