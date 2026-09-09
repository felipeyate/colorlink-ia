const App = () => {
  const [view, setView] = React.useState("login"); // login | register | request | success
  const [user, setUser] = React.useState(null);
  const [lastRequest, setLastRequest] = React.useState(null);

  // Verificar si hay una sesión activa en Supabase al cargar la app
  React.useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          nombre: meta.nombre || session.user.email.split("@")[0],
          email: session.user.email,
          telefono: meta.telefono || "",
          empresa: meta.empresa || "",
        });
        setView("request");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          nombre: meta.nombre || session.user.email.split("@")[0],
          email: session.user.email,
          telefono: meta.telefono || "",
          empresa: meta.empresa || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  const { activeIndex, completedIndex } = React.useMemo(() => {
    if (view === "success") return { activeIndex: 1, completedIndex: 0 };
    return { activeIndex: 0, completedIndex: -1 };
  }, [view]);

  function handleLoggedIn(u) {
    setUser(u);
    setView("request");
  }

  function handleRegistered(u) {
    setUser(u);
    setView("request");
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setLastRequest(null);
    setView("login");
  }

  function handleSubmitted(data) {
    setLastRequest(data);
    setView("success");
  }

  function handleNewRequest() {
    setLastRequest(null);
    setView("request");
  }

  return (
    <div className="app-root">
      <div className="shell">
        <BrandPanel activeIndex={activeIndex} completedIndex={completedIndex} />

        <main className="right-panel">
          {view === "login" && (
            <LoginView onSwitch={() => setView("register")} onLoggedIn={handleLoggedIn} />
          )}
          {view === "register" && (
            <RegisterView onSwitch={() => setView("login")} onRegistered={handleRegistered} />
          )}
          {view === "request" && (
            <RequestView user={user} onLogout={handleLogout} onSubmitted={handleSubmitted} />
          )}
          {view === "success" && lastRequest && (
            <SuccessView data={lastRequest} onNewRequest={handleNewRequest} onLogout={handleLogout} />
          )}
        </main>
      </div>
    </div>
  );
};

const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);
