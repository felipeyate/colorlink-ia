const ColorPalettePicker = ({ selectedColor, onSelectColor, onApplyColorToRequest }) => {
  const [activeFamily, setActiveFamily] = React.useState("all");
  const [activeColor, setActiveColor] = React.useState(
    selectedColor || COLOR_SWATCHES[0]
  );
  const [customHex, setCustomHex] = React.useState("#27cbd2");

  const filteredSwatches = React.useMemo(() => {
    if (activeFamily === "all") return COLOR_SWATCHES;
    return COLOR_SWATCHES.filter((s) => s.family === activeFamily);
  }, [activeFamily]);

  function handleSwatchClick(swatch) {
    setActiveColor(swatch);
    if (onSelectColor) onSelectColor(swatch);
  }

  function handleCustomColorChange(e) {
    const val = e.target.value;
    setCustomHex(val);
    const customSwatch = {
      id: "custom",
      name: "Tono Personalizado",
      hex: val,
      family: "custom",
      code: "CUSTOM-01",
      desc: "Color personalizado seleccionado a tu medida.",
    };
    setActiveColor(customSwatch);
    if (onSelectColor) onSelectColor(customSwatch);
  }

  return (
    <section id="colores" className="section-block color-picker-section">
      <div className="section-header text-center">
        <span className="badge-pill">
          <Palette size={14} /> Paleta Brisa Marina & Tendencias
        </span>
        <h2 className="section-title">Elige el tono perfecto para tu espacio</h2>
        <p className="section-subtitle">
          Explora nuestra selección cromática de alta cobertura o prueba tu propio color.
          Previsualiza cómo luce aplicado en un ambiente real antes de cotizar.
        </p>
      </div>

      {/* Filtro por familias */}
      <div className="color-family-pills">
        {COLOR_FAMILIES.map((fam) => (
          <button
            key={fam.id}
            type="button"
            className={`family-pill ${activeFamily === fam.id ? "is-active" : ""}`}
            onClick={() => setActiveFamily(fam.id)}
          >
            {fam.label}
          </button>
        ))}
      </div>

      {/* Grid del Color Explorer y Preview en vivo */}
      <div className="color-explorer-grid">
        {/* Columna Izquierda: Swatches */}
        <div className="swatches-panel">
          <div className="swatches-grid">
            {filteredSwatches.map((swatch) => {
              const isSelected = activeColor.id === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  className={`swatch-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSwatchClick(swatch)}
                  title={`${swatch.name} (${swatch.code})`}
                >
                  <span
                    className="swatch-circle"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && <Check size={16} className="swatch-check" />}
                  </span>
                  <span className="swatch-name">{swatch.name}</span>
                  <span className="swatch-code">{swatch.code}</span>
                </button>
              );
            })}
          </div>

          {/* Selector de color libre (Custom Color Picker) */}
          <div className="custom-color-box">
            <div className="custom-color-info">
              <span className="custom-color-title">¿Buscas otro tono exacto?</span>
              <span className="custom-color-desc">Abre el selector de color libre</span>
            </div>
            <label className="custom-color-btn" style={{ backgroundColor: customHex }}>
              <input
                type="color"
                value={customHex}
                onChange={handleCustomColorChange}
                className="sr-only"
              />
              <Paintbrush size={15} /> Personalizar
            </label>
          </div>
        </div>

        {/* Columna Derecha: Mockup Interactivo de la Habitación */}
        <div className="room-preview-panel">
          <div className="room-mockup-card">
            <div className="mockup-viewport">
              {/* Pared con el color activo dinámico */}
              <div
                className="mockup-wall"
                style={{ backgroundColor: activeColor.hex }}
              >
                <div className="wall-shadow" />
                <div className="wall-artwork">
                  <div className="art-frame" />
                </div>
              </div>

              {/* Suelo y muebles vectoriales superpuestos */}
              <div className="mockup-floor">
                <div className="floor-sofa">
                  <Sofa size={72} strokeWidth={1.4} />
                </div>
                <div className="floor-lamp" />
                <div className="floor-plant" />
              </div>
            </div>

            {/* Ficha del color seleccionado */}
            <div className="selected-color-bar">
              <div className="selected-color-badge-group">
                <span
                  className="color-indicator-dot"
                  style={{ backgroundColor: activeColor.hex }}
                />
                <div>
                  <h4 className="selected-color-name">{activeColor.name}</h4>
                  <p className="selected-color-details">
                    Código: <strong>{activeColor.code}</strong> · Hex: {activeColor.hex}
                  </p>
                </div>
              </div>

              <p className="selected-color-desc">{activeColor.desc}</p>

              <button
                type="button"
                className="btn-primary btn-block"
                onClick={() => onApplyColorToRequest && onApplyColorToRequest(activeColor)}
              >
                Cotizar con este color <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
