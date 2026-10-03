const PintucoCatalog = ({ onSelectProduct, onCalculateProduct }) => {
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [activeFinish, setActiveFinish] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Almacenar la presentación seleccionada por cada producto (id -> presentationId)
  const [selectedPresentations, setSelectedPresentations] = React.useState({
    viniltex_advanced: "galon",
    viniltex_acriltex: "galon",
    viniltex_banos_cocinas: "galon",
    viniltex_cero_olor: "galon",
    koraza_sol_lluvia: "galon",
    koraza_doble_vida: "galon",
    pintulux_3_en_1: "galon",
    pintulux_acualux_eco: "galon",
  });

  const finishes = ["all", "Mate", "Satinado", "Semi-Brillante", "Brillante"];

  const filteredProducts = React.useMemo(() => {
    return PINTUCO_PRODUCTS.filter((prod) => {
      // Filtro por categoría
      if (activeCategory !== "all" && prod.category !== activeCategory) {
        return false;
      }
      // Filtro por acabado
      if (activeFinish !== "all" && !prod.finish.toLowerCase().includes(activeFinish.toLowerCase())) {
        return false;
      }
      // Búsqueda por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchSub = prod.subtitle.toLowerCase().includes(q);
        const matchBadges = prod.badges.some((b) => b.toLowerCase().includes(q));
        if (!matchName && !matchSub && !matchBadges) return false;
      }
      return true;
    });
  }, [activeCategory, activeFinish, searchQuery]);

  function handlePresentationChange(productId, presId) {
    setSelectedPresentations((prev) => ({
      ...prev,
      [productId]: presId,
    }));
  }

  return (
    <section id="catalogo" className="section-block pintuco-catalog-section">
      <div className="section-header text-center">
        <span className="badge-pill">
          <Paintbrush size={14} /> Catálogo Oficial Pintuco
        </span>
        <h2 className="section-title">Portafolio Especializado de Pinturas</h2>
        <p className="section-subtitle">
          Descubre las líneas insignia de Pintuco para interiores, fachadas, maderas y metales.
          Elige la presentación ideal y cotiza con disponibilidad garantizada.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="catalog-filters-bar">
        {/* Categorías por superficie */}
        <div className="catalog-category-pills">
          {PINTUCO_CATEGORIES_FILTER.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-pill ${activeCategory === cat.id ? "is-active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Buscador de pintura */}
        <div className="catalog-search-wrap">
          <input
            type="text"
            placeholder="Buscar pintura (ej. Koraza, Cero Olor, Óxido)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="catalog-search-input"
          />
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="catalog-products-grid">
        {filteredProducts.map((prod) => {
          const currentPresId = selectedPresentations[prod.id] || prod.presentations[0].id;
          const currentPres =
            prod.presentations.find((p) => p.id === currentPresId) ||
            prod.presentations[0];

          return (
            <article key={prod.id} className="pintuco-product-card">
              <div className="product-image-container">
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  className="product-card-img"
                />
                <div className="product-badges-top">
                  {prod.badges.slice(0, 2).map((b) => (
                    <span key={b} className="product-badge-pill">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="product-card-body">
                <div className="product-category-row">
                  <span className="product-cat-tag">{prod.categoryLabel}</span>
                  <span className="product-finish-tag">Acabado: {prod.finish}</span>
                </div>

                <h3 className="product-card-title">{prod.name}</h3>
                <p className="product-card-subtitle">{prod.subtitle}</p>

                {/* Especificaciones técnicas rápidas */}
                <div className="product-tech-specs">
                  <div className="tech-spec-item">
                    <span className="tech-spec-label">Rendimiento:</span>
                    <span className="tech-spec-val">{prod.yieldPerGal} m²/gal</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="tech-spec-label">Secado:</span>
                    <span className="tech-spec-val">{prod.dryingTime}</span>
                  </div>
                  <div className="tech-spec-item">
                    <span className="tech-spec-label">Base:</span>
                    <span className="tech-spec-val">{prod.base}</span>
                  </div>
                </div>

                {/* Selector de Presentación */}
                <div className="product-presentations-wrap">
                  <span className="presentations-title">Presentación disponible:</span>
                  <div className="presentations-chips">
                    {prod.presentations.map((pres) => (
                      <button
                        key={pres.id}
                        type="button"
                        className={`presentation-chip ${
                          currentPresId === pres.id ? "is-selected" : ""
                        }`}
                        onClick={() => handlePresentationChange(prod.id, pres.id)}
                      >
                        {pres.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precio en COP de la presentación seleccionada */}
                <div className="product-price-bar">
                  <div className="price-details">
                    <span className="price-label">Precio referencia:</span>
                    <span className="price-amount">
                      ${currentPres.priceCOP.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                  <span className="price-pack-name">{currentPres.label}</span>
                </div>

                {/* Botones de acción */}
                <div className="product-actions-row">
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => onCalculateProduct && onCalculateProduct(prod)}
                    title="Calcular cuántos galones necesitas"
                  >
                    <Calculator size={15} /> Calcular
                  </button>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() =>
                      onSelectProduct && onSelectProduct(prod, currentPres)
                    }
                  >
                    Cotizar <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="catalog-empty-state">
          <p>No se encontraron pinturas con esos criterios de búsqueda.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setActiveCategory("all");
              setActiveFinish("all");
              setSearchQuery("");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
};
