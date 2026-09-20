import Icon from './Icon';

// Recriado literalmente de design_files/js/components.jsx — FeatureStrip
export default function FeatureStrip() {
  return (
    <div className="container">
      <div className="feature-strip">
        <div className="feature">
          <div className="feature-icon">
            <Icon name="shield" size={22} />
          </div>
          <div className="feature-text">
            <div className="feature-title">Certificado de Autenticidade</div>
            <div className="feature-sub">Emitido para cada peça</div>
          </div>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <Icon name="truck" size={22} />
          </div>
          <div className="feature-text">
            <div className="feature-title">Envio Seguro e Rastreado</div>
            <div className="feature-sub">Frete grátis acima de R$ 500</div>
          </div>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <Icon name="refresh" size={22} />
          </div>
          <div className="feature-text">
            <div className="feature-title">7 Dias para Devolução</div>
            <div className="feature-sub">Direito de arrependimento</div>
          </div>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <Icon name="award" size={22} />
          </div>
          <div className="feature-text">
            <div className="feature-title">Curadoria Especializada</div>
            <div className="feature-sub">Dr. Sergio Costa · 27 anos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
