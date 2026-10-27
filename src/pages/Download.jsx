import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandMark, PartnerLogos } from '../components/Logos.jsx';
import { IconCheck, IconDownload } from '../components/Icons.jsx';

export default function Download() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('abiva_token');
  const [status, setStatus] = useState('checking'); // checking | ok | expired

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    fetch(`/api/token-valido?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setStatus(d.valido ? 'ok' : 'expired'))
      .catch(() => setStatus('ok')); // se a checagem falhar, deixa tentar o download
  }, [token, navigate]);

  if (!token || status === 'checking') return null;

  return (
    <div className="download-page">
      <div className="hero-shape" aria-hidden="true" />
      <main className="container download-wrap">
        <BrandMark />

        <div className="card download-card">
          {status === 'ok' ? (
            <>
              <div className="success"><IconCheck /></div>
              <h1>Cadastro realizado com sucesso!</h1>
              <p className="muted">
                Obrigado pelo interesse. Sua pesquisa <strong>“O Impacto da Reforma Tributária nas empresas de
                Santa Catarina”</strong> está pronta para download.
              </p>
              <a className="btn" href={`/api/download?token=${encodeURIComponent(token)}`}>
                <IconDownload /> BAIXAR A PESQUISA COMPLETA
              </a>
              <small className="muted">O link de download fica disponível por 30 minutos.</small>
            </>
          ) : (
            <>
              <h1>Link expirado</h1>
              <p className="muted">Por segurança, o link de download expirou. Preencha o formulário novamente.</p>
              <Link className="btn" to="/" onClick={() => sessionStorage.removeItem('abiva_token')}>
                VOLTAR AO FORMULÁRIO
              </Link>
            </>
          )}
        </div>

        <div className="download-logos">
          <span className="rodape-label">Realização e apoio</span>
          <PartnerLogos />
        </div>
      </main>
    </div>
  );
}
