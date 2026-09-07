const BrandPanel = ({ activeIndex, completedIndex }) => (
  <aside className="left-panel">
    <div className="brand">
      <div className="brand-mark">
        <Paintbrush size={20} strokeWidth={2.4} />
      </div>
      <div>
        <p className="brand-eyebrow">Portal de clientes</p>
        <h1 className="brand-name">COLORLINK</h1>
      </div>
    </div>

    <p className="brand-tagline">
      De una necesidad de pintura a una solución técnica, comercial y
      operativa — en un solo lugar.
    </p>

    <ol className="thread">
      {STEPS.map((step, i) => {
        const isDone = i <= completedIndex;
        const isActive = i === activeIndex;
        const Icon = step.icon;
        return (
          <li
            key={step.label}
            className={`thread-node ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
          >
            <div className="thread-marker">
              <span className="thread-dot">
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </span>
              {i < STEPS.length - 1 && <span className="thread-line" />}
            </div>
            <div className="thread-copy">
              <p className="thread-label">{step.label}</p>
              {isActive && <p className="thread-desc">{step.desc}</p>}
            </div>
          </li>
        );
      })}
    </ol>

    <p className="brand-foot">Reto transversal · Pintuco</p>
  </aside>
);
