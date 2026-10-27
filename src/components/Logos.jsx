// As logos originais têm fundo claro; o "mix-blend-mode: multiply" no CSS
// faz o fundo branco/cinza sumir sobre superfícies claras.
export function PartnerLogos({ className = '' }) {
  return (
    <div className={`partner-logos ${className}`}>
      <img src="/imagens/logo1.png" alt="ABIVA - Aliança Brasileira dos Importadores Varejistas e Atacadistas" />
      <span className="divider" />
      <img src="/imagens/logo3.png" alt="UNIVALI" />
      <span className="divider" />
      <img src="/imagens/logo2.png" alt="ASTRA - Associação das Tradings de Santa Catarina" />
    </div>
  );
}

export function BrandMark({ dark = false }) {
  return (
    <div className={`brand ${dark ? 'brand-dark' : ''}`}>
      <img src="/imagens/logo1.png" alt="ABIVA" className="brand-logo" />
      <span className="brand-sub">
        Aliança Brasileira dos<br />Importadores Varejistas<br />e Atacadistas
      </span>
    </div>
  );
}
