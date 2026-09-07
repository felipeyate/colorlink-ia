/* Componentes pequeños reutilizables en todos los formularios */

const Field = ({ label, htmlFor, error, children, hint }) => (
  <div className="field">
    <label htmlFor={htmlFor}>{label}</label>
    <div className={`input-wrap ${error ? "input-error" : ""}`}>{children}</div>
    {hint && !error && <span className="hint-text">{hint}</span>}
    {error && <span className="error-text">{error}</span>}
  </div>
);

const PrimaryButton = ({ children, loading, ...rest }) => (
  <button className="btn-primary" disabled={loading} {...rest}>
    {loading ? (
      <>
        <Loader2 size={18} className="spin" /> Procesando…
      </>
    ) : (
      children
    )}
  </button>
);
