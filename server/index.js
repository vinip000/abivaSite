<<<<<<< HEAD
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { MongoClient } from 'mongodb';
=======
import express from 'express';
import rateLimit from 'express-rate-limit';
>>>>>>> origin/main
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
<<<<<<< HEAD
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'abiva';
const PDF_FILE = path.join(__dirname, 'private', 'pesquisa.pdf');
const TOKEN_TTL_MS = 30 * 60 * 1000; // link de download vale 30 min

if (!MONGODB_URI) {
  console.error('Defina MONGODB_URI no arquivo .env (veja .env.example).');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // atrás de proxy/hospedagem: IP correto para o rate limit
app.use(express.json({ limit: '20kb' }));

// ---------- MongoDB ----------
const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
let leadsCol;
let tokensCol;

async function connectDb() {
  await client.connect();
  const db = client.db(DB_NAME);
  leadsCol = db.collection('leads');
  tokensCol = db.collection('download_tokens');
  await leadsCol.createIndex({ email: 1 });
  await leadsCol.createIndex({ criadoEm: -1 });
  // o Mongo apaga tokens expirados sozinho (checagem a cada ~60 s)
  await tokensCol.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
  console.log(`MongoDB conectado (banco "${DB_NAME}")`);
}

async function tokenValido(token) {
  if (!token) return null;
  const t = await tokensCol.findOne({ _id: token });
  return t && t.expiraEm > new Date() ? t : null;
}
=======
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
>>>>>>> origin/main

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

<<<<<<< HEAD
app.post('/api/leads', leadLimiter, async (req, res) => {
  const { d, errors } = validate(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  try {
    const { insertedId } = await leadsCol.insertOne({
      nome: d.nome,
      telefone: d.telefone,
      email: d.email,
      empresa: d.empresa,
      cargo: d.cargo,
      consentimentoLgpd: true,
      criadoEm: new Date(),
      ip: req.ip,
    });

    const token = crypto.randomBytes(24).toString('hex');
    await tokensCol.insertOne({
      _id: token,
      leadId: insertedId,
      expiraEm: new Date(Date.now() + TOKEN_TTL_MS),
    });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ error: 'Não foi possível registrar seu cadastro agora. Tente novamente.' });
  }
});

app.get('/api/download', async (req, res) => {
  try {
    const t = await tokenValido(String(req.query.token || ''));
    if (!t) {
      return res.status(403).json({ error: 'Link expirado ou inválido. Preencha o formulário novamente.' });
    }
    if (!fs.existsSync(PDF_FILE)) {
      return res.status(404).json({ error: 'Arquivo da pesquisa indisponível no momento.' });
    }
    res.download(PDF_FILE, 'ABIVA-Impacto-da-Reforma-Tributaria-SC.pdf');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar o download.' });
  }
});

app.get('/api/token-valido', async (req, res) => {
  try {
    res.json({ valido: !!(await tokenValido(String(req.query.token || ''))) });
  } catch {
    res.json({ valido: true }); // se a checagem falhar, deixa o download decidir
  }
});

// exportação dos cadastros (protegida por chave)
app.get('/api/admin/leads.csv', async (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) return res.status(401).send('Não autorizado');
  try {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cols = ['nome', 'telefone', 'email', 'empresa', 'cargo', 'criadoEm'];
    const leads = await leadsCol.find({}).sort({ criadoEm: -1 }).toArray();
    const rows = leads.map((l) =>
      cols.map((c) => esc(c === 'criadoEm' ? new Date(l[c]).toISOString() : l[c])).join(';')
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads-abiva.csv"');
    res.send('\ufeff' + [cols.join(';'), ...rows].join('\n'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao exportar');
  }
=======
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
>>>>>>> origin/main
});

// ---------- front em produção ----------
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

<<<<<<< HEAD
connectDb()
  .then(() => app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Falha ao conectar no MongoDB:', err.message);
    process.exit(1);
  });
=======
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
>>>>>>> origin/main
