const PaintCalculator = ({
  initialProduct,
  onApplyCalculation,
}) => {
  const [selectedProductId, setSelectedProductId] = React.useState(
    initialProduct?.id || PINTUCO_PRODUCTS[0].id
  );
  const [calcMode, setCalcMode] = React.useState("dimensions"); // 'dimensions' | 'area'
  const [areaM2, setAreaM2] = React.useState(35);
  
  // Medidas por muros
  const [lengthM, setLengthM] = React.useState(5);
  const [widthM, setWidthM] = React.useState(4);
  const [heightM, setHeightM] = React.useState(2.5);
  const [doors, setDoors] = React.useState(1);
  const [windows, setWindows] = React.useState(1);
  const [includeCeiling, setIncludeCeiling] = React.useState(false);

  // Parámetros de aplicación
  const [coats, setCoats] = React.useState(2);
  const [surfaceType, setSurfaceType] = React.useState("recoat"); // 'recoat' (1.0) | 'new_porous' (1.2)

  // Producto activo
  const activeProduct = React.useMemo(() => {
    return (
      PINTUCO_PRODUCTS.find((p) => p.id === selectedProductId) ||
      PINTUCO_PRODUCTS[0]
    );
  }, [selectedProductId]);

  // Si cambia initialProduct externamente
  React.useEffect(() => {
    if (initialProduct?.id) {
      setSelectedProductId(initialProduct.id);
    }
  }, [initialProduct]);

  // Cálculo del área neta
  const netArea = React.useMemo(() => {
    if (calcMode === "area") {
      return Math.max(1, Number(areaM2) || 0);
    }
    // Muros perimetrales = 2 * (L + W) * H
    const wallArea = 2 * (Number(lengthM) + Number(widthM)) * Number(heightM);
    const ceilingArea = includeCeiling ? Number(lengthM) * Number(widthM) : 0;
    const doorDeduction = Number(doors) * 2.0; // 2 m2 por puerta
    const windowDeduction = Number(windows) * 1.5; // 1.5 m2 por ventana
    const total = wallArea + ceilingArea - (doorDeduction + windowDeduction);
    return Math.max(1, Math.round(total * 10) / 10);
  }, [calcMode, areaM2, lengthM, widthM, heightM, doors, windows, includeCeiling]);

  // Cálculo de galones y envases sugeridos
  const calculation = React.useMemo(() => {
    const yieldPerGal = activeProduct.yieldPerGal || 35; // a 2 manos
    // Rendimiento ajustado por mano
    const singleCoatYield = yieldPerGal * 2; 
    const surfaceFactor = surfaceType === "new_porous" ? 1.2 : 1.0;
    
    // Fórmula Pintuco
    const rawGallons = (netArea * Number(coats) * surfaceFactor) / singleCoatYield;
    const gallonsNeeded = Math.round(rawGallons * 10) / 10;
    
    // Sugerencia de envases
    let cunetes = 0;
    let galones = 0;
    let cuartos = 0;

    let remGal = gallonsNeeded;
    if (remGal >= 4.5 && activeProduct.presentations.some((p) => p.id === "cunete")) {
      cunetes = Math.floor(remGal / 5);
      remGal = remGal % 5;
      if (remGal >= 3.8) {
        cunetes += 1;
        remGal = 0;
      }
    }

    if (remGal > 0) {
      galones = Math.floor(remGal);
      const frac = remGal - galones;
      if (frac > 0.6) {
        galones += 1;
      } else if (frac > 0.1 && activeProduct.presentations.some((p) => p.id === "cuarto")) {
        cuartos = Math.ceil(frac / 0.25);
      } else if (frac > 0.1) {
        galones += 1;
      }
    }

    // Si todo quedó en 0 por ser muy pequeño
    if (cunetes === 0 && galones === 0 && cuartos === 0) {
      galones = 1;
    }

    // Estimación económica en COP
    const priceGal = activeProduct.presentations.find((p) => p.id === "galon")?.priceCOP || 79900;
    const priceCun = activeProduct.presentations.find((p) => p.id === "cunete")?.priceCOP || priceGal * 4.6;
    const priceCuar = activeProduct.presentations.find((p) => p.id === "cuarto")?.priceCOP || priceGal * 0.35;

    const estimatedCOP = Math.round(cunetes * priceCun + galones * priceGal + cuartos * priceCuar);

    // Texto descriptivo de envases
    const packagesText = [
      cunetes > 0 ? `${cunetes} Cuñete${cunetes > 1 ? "s" : ""} (5 Gal)` : "",
      galones > 0 ? `${galones} Galón${galones > 1 ? "es" : ""}` : "",
      cuartos > 0 ? `${cuartos} Cuarto${cuartos > 1 ? "s" : ""} (1/4 Gal)` : "",
    ].filter(Boolean).join(" + ");

    return {
      product: activeProduct,
      netArea,
      coats,
      gallonsNeeded,
      packagesText,
      cunetes,
      galones,
      cuartos,
      estimatedCOP,
    };
  }, [netArea, coats, surfaceType, activeProduct]);

  function handleApply() {
    if (onApplyCalculation) {
      onApplyCalculation(calculation);
    }
  }

  return (
    <section id="calculadora" className="section-block paint-calc-section">
      <div className="section-header text-center">
        <span className="badge-pill">
          <Calculator size={14} /> Fórmula Oficial Pintuco
        </span>
        <h2 className="section-title">Calculadora de Pintura Inteligente</h2>
        <p className="section-subtitle">
          Calcula la cantidad exacta de pintura requerida para tu proyecto según la
          ficha técnica de cada línea Pintuco. Evita compras excesivas o faltantes.
        </p>
      </div>

      <div className="calc-card-grid">
        {/* Panel Izquierdo: Parámetros y Dimensiones */}
        <div className="calc-inputs-card">
          {/* Selector de Producto */}
          <div className="calc-field-group">
            <label className="calc-label" htmlFor="calc-product-select">
              1. Selecciona la pintura Pintuco:
            </label>
            <div className="input-wrap">
              <Paintbrush size={17} className="input-icon" />
              <select
                id="calc-product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {PINTUCO_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.categoryLabel} · Rend: {prod.yieldPerGal} m²/gal)
                  </option>
                ))}
              </select>
            </div>
            <span className="hint-text">
              Rendimiento técnico oficial: <strong>{activeProduct.yieldPerGal} m² por galón</strong> a 2 manos.
            </span>
          </div>

          {/* Selector de Modo */}
          <div className="calc-field-group">
            <label className="calc-label">2. ¿Cómo prefieres ingresar el área?</label>
            <div className="calc-tabs">
              <button
                type="button"
                className={`calc-tab ${calcMode === "dimensions" ? "is-active" : ""}`}
                onClick={() => setCalcMode("dimensions")}
              >
                Medidas de muros (Largo × Alto)
              </button>
              <button
                type="button"
                className={`calc-tab ${calcMode === "area" ? "is-active" : ""}`}
                onClick={() => setCalcMode("area")}
              >
                Área directa en m²
              </button>
            </div>
          </div>

          {/* Modo Dimensiones */}
          {calcMode === "dimensions" ? (
            <div className="calc-dimensions-box">
              <div className="dimensions-row">
                <div className="dim-input-group">
                  <label htmlFor="dim-length">Largo (m)</label>
                  <input
                    id="dim-length"
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={lengthM}
                    onChange={(e) => setLengthM(e.target.value)}
                  />
                </div>
                <div className="dim-input-group">
                  <label htmlFor="dim-width">Ancho (m)</label>
                  <input
                    id="dim-width"
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={widthM}
                    onChange={(e) => setWidthM(e.target.value)}
                  />
                </div>
                <div className="dim-input-group">
                  <label htmlFor="dim-height">Altura (m)</label>
                  <input
                    id="dim-height"
                    type="number"
                    min="1.5"
                    max="10"
                    step="0.1"
                    value={heightM}
                    onChange={(e) => setHeightM(e.target.value)}
                  />
                </div>
              </div>

              {/* Deducción de puertas y ventanas */}
              <div className="deductions-box">
                <span className="deductions-title">Descuento de aberturas:</span>
                <div className="deductions-counters">
                  <div className="counter-item">
                    <span>Puertas (2 m² c/u):</span>
                    <div className="counter-ctrls">
                      <button
                        type="button"
                        onClick={() => setDoors((d) => Math.max(0, d - 1))}
                        className="btn-counter"
                      >
                        -
                      </button>
                      <span className="counter-val">{doors}</span>
                      <button
                        type="button"
                        onClick={() => setDoors((d) => d + 1)}
                        className="btn-counter"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="counter-item">
                    <span>Ventanas (1.5 m² c/u):</span>
                    <div className="counter-ctrls">
                      <button
                        type="button"
                        onClick={() => setWindows((w) => Math.max(0, w - 1))}
                        className="btn-counter"
                      >
                        -
                      </button>
                      <span className="counter-val">{windows}</span>
                      <button
                        type="button"
                        onClick={() => setWindows((w) => w + 1)}
                        className="btn-counter"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeCeiling}
                    onChange={(e) => setIncludeCeiling(e.target.checked)}
                  />
                  <span>¿Incluir también el techo / cielo raso?</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="calc-direct-area-box">
              <label htmlFor="direct-area-input">Área a pintar aproximada (m²):</label>
              <div className="slider-group">
                <input
                  id="direct-area-input"
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={areaM2}
                  onChange={(e) => setAreaM2(e.target.value)}
                  className="calc-range-slider"
                />
                <span className="slider-display">{areaM2} m²</span>
              </div>
            </div>
          )}

          {/* Opciones avanzadas: Manos y Tipo de Superficie */}
          <div className="calc-options-row">
            <div className="calc-option">
              <label htmlFor="select-coats">Número de manos:</label>
              <select
                id="select-coats"
                value={coats}
                onChange={(e) => setCoats(Number(e.target.value))}
              >
                <option value={1}>1 mano (retoque superficial)</option>
                <option value={2}>2 manos (recomendado Pintuco)</option>
                <option value={3}>3 manos (cambio drástico de color)</option>
              </select>
            </div>

            <div className="calc-option">
              <label htmlFor="select-surface">Estado de la superficie:</label>
              <select
                id="select-surface"
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value)}
              >
                <option value="recoat">Repinte sobre muro en buen estado</option>
                <option value="new_porous">Muro nuevo, rústico o muy poroso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Resultado y Presupuesto Técnico */}
        <div className="calc-result-card">
          <div className="result-header">
            <span className="result-badge">Resultado Técnico</span>
            <h3 className="result-product-name">{activeProduct.name}</h3>
            <p className="result-product-cat">{activeProduct.categoryLabel} · {activeProduct.finish}</p>
          </div>

          <div className="result-metrics">
            <div className="metric-box">
              <span className="metric-label">Área Neta</span>
              <span className="metric-value">{calculation.netArea} m²</span>
            </div>
            <div className="metric-box highlight">
              <span className="metric-label">Galones Estimados</span>
              <span className="metric-value">{calculation.gallonsNeeded} Gal</span>
            </div>
          </div>

          <div className="result-packaging">
            <span className="packaging-label">Presentación recomendada de compra:</span>
            <div className="packaging-box">
              <PackageSearch size={20} className="pack-icon" />
              <span className="packaging-value">{calculation.packagesText}</span>
            </div>
          </div>

          <div className="result-investment">
            <span className="investment-label">Inversión estimada en pintura:</span>
            <span className="investment-value">
              ${calculation.estimatedCOP.toLocaleString("es-CO")} COP
            </span>
            <span className="investment-tax">*Precios de referencia oficiales Pintuco (IVA incluido)</span>
          </div>

          <button
            type="button"
            className="btn-primary btn-block"
            onClick={handleApply}
          >
            Aplicar este cálculo a mi cotización <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
};
