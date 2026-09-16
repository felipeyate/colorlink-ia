const LoginView = ({ onSwitch, onLoggedIn, onGoHome }) => {
  const [data, setData] = React.useState({ email: "", password: "" });
  const [errors, setErrors] = React.useState({});
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState("");

  function validate() {
    const errs = {};
    if (!data.email.trim()) errs.email = "Ingresa tu correo.";
    else if (!EMAIL_RE.test(data.email)) errs.email = "Ese correo no parece válido.";
    if (!data.password) errs.password = "Ingresa tu contraseña.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    try {
      if (supabase) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password,
        });

        if (error) throw error;

        const meta = authData.user?.user_metadata || {};
        onLoggedIn({
          id: authData.user.id,
          nombre: meta.nombre || data.email.split("@")[0],
          email: authData.user.email,
          telefono: meta.telefono || "",
          empresa: meta.empresa || "",
        });
      } else {
        // Modo sin conexión o simulación
        const nombre = data.email.split("@")[0];
        onLoggedIn({
          nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
          email: data.email,
          telefono: "",
          empresa: "",
        });
      }
    } catch (err) {
      console.error("Error en login:", err);
      let msg = "Error al iniciar sesión. Verifica tus datos.";
      if (err.message?.includes("Invalid login credentials")) {
        msg = "Correo o contraseña incorrectos.";
      } else if (err.message) {
        msg = err.message;
      }
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <div className="request-top">
        {onGoHome && (
          <button type="button" className="btn-ghost" onClick={onGoHome}>
            <ArrowLeft size={15} /> Volver al portal
          </button>
        )}
        <MobileHeader />
      </div>
      <p className="card-eyebrow">Bienvenido de nuevo</p>
      <h2 className="card-title">Inicia sesión</h2>
      <p className="card-subtitle">
        Ingresa a tu cuenta para radicar o continuar una solicitud.
      </p>

      {formError && <div className="form-banner">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Correo electrónico" htmlFor="login-email" error={errors.email}>
          <Mail size={17} className="input-icon" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@empresa.com"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </Field>

        <Field label="Contraseña" htmlFor="login-password" error={errors.password}>
          <Lock size={17} className="input-icon" />
          <input
            id="login-password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
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

        <PrimaryButton type="submit" loading={loading}>
          <LogIn size={18} /> Iniciar sesión
        </PrimaryButton>
      </form>

      <p className="switch-text">
        ¿Aún no tienes cuenta?{" "}
        <button className="btn-link" onClick={onSwitch}>
          Crear una cuenta
        </button>
      </p>
    </div>
  );
};
