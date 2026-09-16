const Navbar = ({ user, currentView, onNavigate, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onNavigate("home")}>
          <div className="brand-mark small">
            <Paintbrush size={18} strokeWidth={2.4} />
          </div>
          <div className="navbar-brand-titles">
            <span className="navbar-brand-name">COLORLINK</span>
            <span className="navbar-brand-sub">Reto Pintuco</span>
          </div>
        </div>

        <nav className={`navbar-links ${mobileMenuOpen ? "is-open" : ""}`}>
          <a
            href="#ambientes"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate("home");
              setTimeout(() => {
                const el = document.getElementById("ambientes");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Ambientes
          </a>
          <a
            href="#colores"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate("home");
              setTimeout(() => {
                const el = document.getElementById("colores");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Colores
          </a>
          <a
            href="#proyectos"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate("home");
              setTimeout(() => {
                const el = document.getElementById("proyectos");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Proyectos
          </a>

          <div className="navbar-mobile-actions">
            {user ? (
              <>
                <span className="navbar-user-tag">Hola, {user.nombre.split(" ")[0]}</span>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={15} /> Salir
                </button>
              </>
            ) : (
              <button
                className="btn-secondary btn-sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("login");
                }}
              >
                <User size={15} /> Iniciar Sesión
              </button>
            )}
            <button
              className="btn-primary btn-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate("request");
              }}
            >
              Solicitar Cotización
            </button>
          </div>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-menu">
              <span className="navbar-user-tag">Hola, {user.nombre.split(" ")[0]}</span>
              <button className="btn-ghost" onClick={onLogout} title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn-secondary btn-sm"
              onClick={() => onNavigate("login")}
            >
              <User size={15} /> Iniciar Sesión
            </button>
          )}
          <button
            className="btn-primary btn-sm"
            onClick={() => onNavigate("request")}
          >
            Cotizar Proyecto <ArrowRight size={15} />
          </button>

          <button
            className="navbar-burger"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};
