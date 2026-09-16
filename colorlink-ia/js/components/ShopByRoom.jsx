const ShopByRoom = ({ onSelectRoom }) => {
  const iconMap = {
    Sofa: Sofa,
    Bed: Bed,
    Bath: Bath,
    HomeIcon: HomeIcon,
    Layers: Layers,
  };

  return (
    <section id="ambientes" className="section-block shop-room-section">
      <div className="section-header text-center">
        <span className="badge-pill">
          <Layers size={14} /> Soluciones Pintuco por Espacio
        </span>
        <h2 className="section-title">Encuentra la pintura ideal para cada superficie</h2>
        <p className="section-subtitle">
          Cada espacio tiene requerimientos técnicos únicos de humedad, luz y tráfico.
          Selecciona tu ambiente para recibir la formulación exacta recomendada por Pintuco.
        </p>
      </div>

      <div className="room-cards-grid">
        {ROOM_CATEGORIES.map((room) => {
          const IconComp = iconMap[room.iconName] || Sofa;
          return (
            <div key={room.id} className="room-card">
              <div className="room-card-top">
                <div className="room-card-icon">
                  <IconComp size={24} />
                </div>
                <span className="room-badge">{room.badge}</span>
              </div>

              <h3 className="room-card-title">{room.name}</h3>
              <p className="room-card-desc">{room.desc}</p>

              <div className="room-pintuco-spec">
                <span className="spec-label">Línea recomendada:</span>
                <span className="spec-value">{room.pintucoLine}</span>
                <span className="spec-finish">Acabado: {room.finish}</span>
              </div>

              <button
                type="button"
                className="btn-room-select"
                onClick={() => onSelectRoom && onSelectRoom(room)}
              >
                Elegir este ambiente <ArrowRight size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
