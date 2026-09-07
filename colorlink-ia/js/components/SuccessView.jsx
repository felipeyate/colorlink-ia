const SuccessView = ({ data, onNewRequest, onLogout }) => (
  <div className="form-card success-card">
    <div className="request-top">
      <MobileHeader />
      <button className="btn-ghost" onClick={onLogout}>
        <LogOut size={15} /> Cerrar sesión
      </button>
    </div>

    <div className="success-icon">
      <CheckCircle2 size={30} />
    </div>
    <p className="card-eyebrow">Solicitud recibida</p>
    <h2 className="card-title">Gracias, {data.contactoNombre.split(" ")[0]}.</h2>
    <p className="card-subtitle">
      Ya registramos tu necesidad para <strong>{data.tipoProyecto}</strong> en{" "}
      <strong>{data.ubicacion}</strong>. Nuestro equipo empezará a armar tu
      solución técnica y te contactará a {data.email}.
    </p>

    <div className="summary-box">
      <p className="summary-title">Resumen de tu solicitud</p>
      <dl>
        <div>
          <dt>Tipo de proyecto</dt>
          <dd>{data.tipoProyecto}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{data.ubicacion}</dd>
        </div>
        <div>
          <dt>Contacto</dt>
          <dd>
            {data.contactoNombre} · {data.telefono}
          </dd>
        </div>
        <div>
          <dt>Descripción</dt>
          <dd>{data.descripcion}</dd>
        </div>
      </dl>
    </div>

    <button className="btn-primary" onClick={onNewRequest}>
      <RotateCcw size={18} /> Enviar otra solicitud
    </button>
  </div>
);
