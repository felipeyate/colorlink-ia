const RequestView = ({ user, onLogout, onSubmitted }) => {
  const [wizardStep, setWizardStep] = React.useState(1);
  const [data, setData] = React.useState({
    tipoProyecto: "",
    ubicacion: "",
    contactoNombre: user?.nombre || "",
    telefono: user?.telefono || "",
    email: user?.email || "",
    descripcion: "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  function validateStep1() {
    const errs = {};
    if (!data.tipoProyecto) errs.tipoProyecto = "Selecciona el tipo de proyecto.";
    if (!data.ubicacion.trim()) errs.ubicacion = "Cuéntanos la ciudad o dirección.";
    return errs;
  }

  function validateStep2() {
    const errs = {};
    if (!data.contactoNombre.trim()) errs.contactoNombre = "Ingresa un nombre de contacto.";
    if (!data.telefono.trim()) errs.telefono = "Ingresa un teléfono.";
    else if (!PHONE_RE.test(data.telefono)) errs.telefono = "Revisa el número, usa solo dígitos.";
    if (!data.email.trim()) errs.email = "Ingresa un correo.";
    else if (!EMAIL_RE.test(data.email)) errs.email = "Ese correo no parece válido.";
    if (!data.descripcion.trim()) errs.descripcion = "Describe brevemente qué necesitas.";
    else if (data.descripcion.trim().length < 10)
      errs.descripcion = "Cuéntanos un poco más, al menos 10 caracteres.";
    return errs;
  }

  function handleNext(e) {
    e.preventDefault();
    const errs = validateStep1();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setWizardStep(2);
  }

  function handleBack() {
    setErrors({});
    setWizardStep(1);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // TODO: reemplazar por supabase.from('solicitudes').insert([{ ...data, user_id }])
    setTimeout(() => {
      setLoading(false);
      onSubmitted(data);
    }, 900);
  }

  return (
    <div className="form-card">
      <div className="request-top">
        <MobileHeader />
        <button className="btn-ghost" onClick={onLogout}>
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>

      <p className="card-eyebrow">Hola, {user?.nombre?.split(" ")[0] || "de nuevo"}</p>
      <h2 className="card-title">Cuéntanos tu necesidad</h2>
      <p className="card-subtitle">
        Con estos datos armamos tu solución técnica y comercial. Solo toma un
        par de minutos.
      </p>

      <div className="mini-stepper" aria-hidden="true">
        <span className={`mini-dot ${wizardStep >= 1 ? "is-on" : ""}`} />
        <span className={`mini-track ${wizardStep >= 2 ? "is-on" : ""}`} />
        <span className={`mini-dot ${wizardStep >= 2 ? "is-on" : ""}`} />
      </div>
      <p className="mini-stepper-label">Paso {wizardStep} de 2</p>

      {wizardStep === 1 && (
        <form onSubmit={handleNext} noValidate>
          <Field label="¿Qué tipo de proyecto es?" htmlFor="tipoProyecto" error={errors.tipoProyecto}>
            <Paintbrush size={17} className="input-icon" />
            <select
              id="tipoProyecto"
              value={data.tipoProyecto}
              onChange={(e) => setData({ ...data, tipoProyecto: e.target.value })}
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {TIPOS_PROYECTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Ubicación del proyecto"
            htmlFor="ubicacion"
            error={errors.ubicacion}
            hint="Ciudad, barrio o dirección aproximada."
          >
            <MapPin size={17} className="input-icon" />
            <input
              id="ubicacion"
              type="text"
              placeholder="Ej. Bogotá, Chapinero"
              value={data.ubicacion}
              onChange={(e) => setData({ ...data, ubicacion: e.target.value })}
            />
          </Field>

          <PrimaryButton type="submit">
            Continuar <ArrowRight size={18} />
          </PrimaryButton>
        </form>
      )}

      {wizardStep === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <Field label="Nombre de contacto" htmlFor="contactoNombre" error={errors.contactoNombre}>
              <User size={17} className="input-icon" />
              <input
                id="contactoNombre"
                type="text"
                value={data.contactoNombre}
                onChange={(e) => setData({ ...data, contactoNombre: e.target.value })}
              />
            </Field>

            <Field label="Teléfono" htmlFor="reqTelefono" error={errors.telefono}>
              <Phone size={17} className="input-icon" />
              <input
                id="reqTelefono"
                type="tel"
                value={data.telefono}
                onChange={(e) => setData({ ...data, telefono: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Correo de contacto" htmlFor="reqEmail" error={errors.email}>
            <Mail size={17} className="input-icon" />
            <input
              id="reqEmail"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </Field>

          <Field
            label="Cuéntanos qué necesitas"
            htmlFor="descripcion"
            error={errors.descripcion}
            hint="Por ejemplo: superficie a pintar, plazos, o cualquier detalle que ayude."
          >
            <MessageSquare size={17} className="input-icon input-icon-top" />
            <textarea
              id="descripcion"
              rows={4}
              placeholder="Describe brevemente tu necesidad…"
              value={data.descripcion}
              onChange={(e) => setData({ ...data, descripcion: e.target.value })}
            />
          </Field>

          <div className="btn-row">
            <button type="button" className="btn-secondary" onClick={handleBack}>
              <ArrowLeft size={18} /> Atrás
            </button>
            <PrimaryButton type="submit" loading={loading}>
              Enviar solicitud
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
};
