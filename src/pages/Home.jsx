import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark, PartnerLogos } from '../components/Logos.jsx';
import {
  IconUser, IconPhone, IconMail, IconBuilding, IconBriefcase, IconLock,
  IconArrow, IconChart, IconDoc, IconPeople, IconTarget,
} from '../components/Icons.jsx';

const FIELDS = [
  { name: 'nome', placeholder: 'Nome completo', type: 'text', icon: IconUser, autoComplete: 'name' },
  { name: 'telefone', placeholder: 'Telefone', type: 'tel', icon: IconPhone, autoComplete: 'tel' },
  { name: 'email', placeholder: 'E-mail corporativo', type: 'email', icon: IconMail, autoComplete: 'email' },
  { name: 'empresa', placeholder: 'Empresa', type: 'text', icon: IconBuilding, autoComplete: 'organization' },
  { name: 'cargo', placeholder: 'Cargo', type: 'text', icon: IconBriefcase, autoComplete: 'organization-title' },
];

const TEMAS = [
  { icon: IconChart, texto: 'Cenários e impactos para o setor' },
  { icon: IconDoc, texto: 'Desafios regulatórios e de transição' },
  { icon: IconPeople, texto: 'Oportunidades para as empresas' },
  { icon: IconTarget, texto: 'Recomendações para maior competitividade' },
];

function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function Home() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ nome: '', telefone: '', email: '', empresa: '', cargo: '', lgpd: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({
      ...v,
      [name]: type === 'checkbox' ? checked : name === 'telefone' ? maskPhone(value) : value,
    }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setServerError(data.error || 'Não foi possível enviar. Tente novamente.');
        return;
      }
      sessionStorage.setItem('abiva_token', data.token);
      navigate('/download');
    } catch {
      setServerError('Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="hero" id="topo">
        <div className="hero-shape" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-text">
            <BrandMark />
            <span className="eyebrow">Pesquisa exclusiva</span>
            <h1>
              O Impacto da <strong>Reforma Tributária</strong>
              <span> nas empresas de Santa Catarina</span>
            </h1>
            <div className="bar" />
            <p>
              Um estudo da ABIVA, realizado pela UNIVALI com apoio da ASTRA, que analisa os principais
              impactos da Reforma Tributária para as empresas importadoras de Santa Catarina.
            </p>
          </div>

          <form className="card form-card" onSubmit={onSubmit} noValidate>
            <h2>Acesse a pesquisa completa</h2>
            <p className="muted">Preencha seus dados para receber o estudo exclusivo da ABIVA.</p>

            {FIELDS.map(({ name, placeholder, type, icon: Icon, autoComplete }) => (
              <div className="field" key={name}>
                <div className={`input-wrap ${errors[name] ? 'has-error' : ''}`}>
                  <Icon />
                  <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    autoComplete={autoComplete}
                    value={values[name]}
                    onChange={onChange}
                    required
                  />
                </div>
                {errors[name] && <small className="error">{errors[name]}</small>}
              </div>
            ))}

            <label className="check">
              <input type="checkbox" name="lgpd" checked={values.lgpd} onChange={onChange} />
              <span>Concordo com o uso dos meus dados conforme a LGPD e a Política de Privacidade da ABIVA.</span>
            </label>
            {errors.lgpd && <small className="error">{errors.lgpd}</small>}

            {serverError && <div className="alert">{serverError}</div>}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'ENVIANDO...' : <>ENVIAR <IconArrow /></>}
            </button>

            <p className="privacy">
              <IconLock />
              <span>
                Seus dados estão seguros. Utilizamos suas informações apenas para fins institucionais da ABIVA,
                conforme nossa Política de Privacidade.
              </span>
            </p>
          </form>
        </div>
      </header>

      <section className="temas">
        <div className="container">
          <h2>Principais temas analisados</h2>
          <ul className="temas-grid">
            {TEMAS.map(({ icon: Icon, texto }) => (
              <li key={texto}>
                <Icon />
                <span>{texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="papel">
        <div className="container papel-inner">
          <h2>O papel da ABIVA</h2>
          <div className="bar" />
          <p>
            A ABIVA atua como um think tank setorial, produzindo conhecimento, articulando o diálogo com o poder
            público e defendendo um ambiente regulatório justo, que contribua para a competitividade das empresas
            e o desenvolvimento do comércio exterior em Santa Catarina e no Brasil.
          </p>
          <a className="btn btn-inline" href="#topo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            QUERO RECEBER A PESQUISA <IconArrow />
          </a>
        </div>
      </section>

      <footer className="rodape">
        <div className="container">
          <span className="rodape-label">Realização e apoio</span>
          <PartnerLogos />
        </div>
      </footer>
    </>
  );
}
