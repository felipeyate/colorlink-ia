const CustomerProjects = ({ onStartProject }) => {
  return (
    <section id="proyectos" className="section-block customer-projects-section">
      <div className="section-header text-center">
        <span className="badge-pill">
          <Sparkles size={14} /> Inspiración Real
        </span>
        <h2 className="section-title">Proyectos de nuestros clientes</h2>
        <p className="section-subtitle">
          Resultados comprobados en hogares, apartamentos y fachadas de todo el país.
          Conoce cómo la tecnología Pintuco transformó cada espacio.
        </p>
      </div>

      <div className="projects-grid">
        {CUSTOMER_PROJECTS.map((proj) => (
          <article key={proj.id} className="project-card">
            <div className="project-image-wrap">
              <img
                src={proj.image}
                alt={proj.title}
                loading="lazy"
                className="project-image"
              />
              <span className="project-city-badge">{proj.city}</span>
            </div>

            <div className="project-body">
              <span className="project-room-tag">{proj.room}</span>
              <h3 className="project-title">{proj.title}</h3>

              <div className="project-specs">
                <div className="project-spec-item">
                  <span className="spec-label">Pintura:</span>
                  <span className="spec-text">{proj.pintucoProduct}</span>
                </div>
                <div className="project-spec-item">
                  <span className="spec-label">Color:</span>
                  <span className="project-color-applied">
                    <span
                      className="project-swatch-dot"
                      style={{ backgroundColor: proj.colorHex }}
                    />
                    {proj.colorName}
                  </span>
                </div>
              </div>

              <blockquote className="project-review">
                “{proj.review}”
              </blockquote>

              <p className="project-client">{proj.client}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="project-cta-banner">
        <div className="cta-banner-content">
          <h3 className="cta-banner-title">¿Tienes un proyecto en mente?</h3>
          <p className="cta-banner-desc">
            Radica tu solicitud en menos de 2 minutos y recibe asesoría técnica personalizada de Pintuco.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onStartProject && onStartProject()}
        >
          Iniciar mi cotización <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};
