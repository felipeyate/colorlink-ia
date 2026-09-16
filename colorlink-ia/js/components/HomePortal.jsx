const HomePortal = ({ onStartQuote, onSelectRoom, onSelectColor }) => {
  return (
    <div className="home-portal-root">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Portal Oficial de Clientes · Pintuco
          </div>

          <h1 className="hero-title">
            De una necesidad de pintura a una{" "}
            <span className="highlight-text">solución técnica y comercial</span>
          </h1>

          <p className="hero-subtitle">
            Elige tu ambiente, explora la paleta de colores con tecnología bajo olor
            y cotiza tu proyecto con asesoría experta y disponibilidad garantizada.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary btn-lg"
              onClick={() => onStartQuote()}
            >
              Radicar Solicitud <ArrowRight size={18} />
            </button>
            <a href="#colores" className="btn-secondary btn-lg">
              <Palette size={18} /> Explorar Colores
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">+1.400</span>
              <span className="stat-label">Colores preparados</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">Bajo Olor</span>
              <span className="stat-label">Tecnología saludable</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">5 Años</span>
              <span className="stat-label">Garantía Koraza</span>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee de Inspiración */}
      <InfiniteMarquee
        onSelectSlide={(slide) => {
          // Si el usuario hace clic en una diapositiva, se le sugiere empezar
          onStartQuote();
        }}
      />

      {/* Shop by Room: Categorías por Espacio */}
      <ShopByRoom onSelectRoom={onSelectRoom} />

      {/* Color Palette Picker: Explorador y Simulador de Color */}
      <ColorPalettePicker
        onApplyColorToRequest={(color) => {
          onSelectColor(color);
        }}
      />

      {/* Proyectos de Nuestros Clientes */}
      <CustomerProjects onStartProject={() => onStartQuote()} />

      {/* Footer del Portal */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-mark small">
              <Paintbrush size={16} strokeWidth={2.4} />
            </div>
            <span className="footer-title">COLORLINK</span>
            <span className="footer-desc">· Reto Transversal Pintuco (Electiva IV)</span>
          </div>
          <p className="footer-copy">
            Desarrollado para conectar clientes, soluciones técnicas y calidad en un solo lugar.
          </p>
        </div>
      </footer>
    </div>
  );
};
