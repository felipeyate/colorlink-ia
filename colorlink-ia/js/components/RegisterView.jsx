const RegisterView = ({ onSwitch, onRegistered }) => {
  const [data, setData] = React.useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = React.useState({});
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function validate() {
    const errs = {};
    if (!data.nombre.trim()) errs.nombre = "Ingresa tu nombre completo.";
    if (!data.email.trim()) errs.email = "Ingresa tu correo.";
    else if (!EMAIL_RE.test(data.email)) errs.email = "Ese correo no parece válido.";
    if (!data.telefono.trim()) errs.telefono = "Ingresa un teléfono de contacto.";
    else if (!PHONE_RE.test(data.telefono)) errs.telefono = "Revisa el número, usa solo dígitos.";
    if (!data.password) errs.password = "Crea una contraseña.";
    else if (data.password.length < 8) errs.password = "Mínimo 8 caracteres.";
    if (data.confirm !== data.password) errs.confirm = "Las contraseñas no coinciden.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // TODO: reemplazar por supabase.auth.signUp({ email, password, options: { data: {...} } })
    setTimeout(() => {
      setLoading(false);
      onRegistered({
        nombre: data.nombre,
        empresa: data.empresa,
        email: data.email,
        telefono: data.telefono,
      });
    }, 800);
  }

  return (
    <div className="form-card">
      <MobileHeader />
      <p className="card-eyebrow">Primera vez aquí</p>
      <h2 className="card-title">Crea tu cuenta</h2>
      <p className="card-subtitle">
        Con tu cuenta puedes radicar solicitudes y darles seguimiento.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Nombre completo" htmlFor="reg-nombre" error={errors.nombre}>
          <User size={17} className="input-icon" />
          <input
            id="reg-nombre"
            type="text"
            autoComplete="name"
            placeholder="Ej. Laura Gómez"
            value={data.nombre}
            onChange={(e) => setData({ ...data, nombre: e.target.value })}
          />
        </Field>

        <Field label="Empresa (opcional)" htmlFor="reg-empresa">
          <Building2 size={17} className="input-icon" />
          <input
            id="reg-empresa"
            type="text"
            autoComplete="organization"
            placeholder="Ej. Constructora Andina"
            value={data.empresa}
            onChange={(e) => setData({ ...data, empresa: e.target.value })}
          />
        </Field>

        <div className="field-row">
          <Field label="Correo electrónico" htmlFor="reg-email" error={errors.email}>
            <Mail size={17} className="input-icon" />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@empresa.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </Field>

          <Field label="Teléfono" htmlFor="reg-telefono" error={errors.telefono}>
            <Phone size={17} className="input-icon" />
            <input
              id="reg-telefono"
              type="tel"
              autoComplete="tel"
              placeholder="300 123 4567"
              value={data.telefono}
              onChange={(e) => setData({ ...data, telefono: e.target.value })}
            />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Contraseña" htmlFor="reg-password" error={errors.password}>
            <Lock size={17} className="input-icon" />
            <input
              id="reg-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </Field>

          <Field label="Confirmar contraseña" htmlFor="reg-confirm" error={errors.confirm}>
            <Lock size={17} className="input-icon" />
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={data.confirm}
              onChange={(e) => setData({ ...data, confirm: e.target.value })}
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </Field>
        </div>

        <PrimaryButton type="submit" loading={loading}>
          <UserPlus size={18} /> Crear cuenta
        </PrimaryButton>
      </form>

      <p className="switch-text">
        ¿Ya tienes cuenta?{" "}
        <button className="btn-link" onClick={onSwitch}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
};
