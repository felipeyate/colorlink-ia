const InfiniteMarquee = ({ onSelectSlide }) => {
  // Duplicamos los elementos para que el scroll continuo sea 100% fluido e imperceptible
  const slides = [...MARQUEE_SLIDES, ...MARQUEE_SLIDES];

  return (
    <section className="marquee-wrapper" aria-label="Galería continua de acabados e inspiración">
      <div className="marquee-header-strip">
        <span className="badge-pill">
          <Sparkles size={14} /> Inspiración Pintuco & Tendencias
        </span>
        <span className="marquee-header-desc">
          Explora acabados de alto rendimiento, tecnología bajo olor y colores exclusivos
        </span>
      </div>

      <div className="marquee-container">
        <div className="marquee-fade-left" aria-hidden="true" />
        <div className="marquee-track">
          {slides.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="marquee-card"
              onClick={() => onSelectSlide && onSelectSlide(item)}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="marquee-image"
              />
              <div className="marquee-overlay">
                <span className="marquee-tag">{item.tag}</span>
                <h4 className="marquee-title">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
        <div className="marquee-fade-right" aria-hidden="true" />
      </div>
    </section>
  );
};
