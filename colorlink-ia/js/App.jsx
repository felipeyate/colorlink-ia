const App = () => {
  const [view, setView] = React.useState("home"); // home | login | register | request | success
  const [user, setUser] = React.useState(null);
  const [lastRequest, setLastRequest] = React.useState(null);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);

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
    setView("home");
  }

  function handleSubmitted(data) {
    setLastRequest(data);
    setView("success");
  }

  function handleNewRequest() {
    setLastRequest(null);
    setView("request");
  }

  function handleSelectRoomFromHome(room) {
    setSelectedRoom(room);
    setView("request");
  }

  function handleSelectColorFromHome(color) {
    setSelectedColor(color);
    setView("request");
  }

  return (
    <div className="app-root">
      {view === "home" ? (
        <div className="portal-wrapper">
          <Navbar
            user={user}
            currentView={view}
            onNavigate={setView}
            onLogout={handleLogout}
          />
          <main>
            <HomePortal
              onStartQuote={() => setView("request")}
              onSelectRoom={handleSelectRoomFromHome}
              onSelectColor={handleSelectColorFromHome}
            />
          </main>
        </div>
      ) : (
        <div className="shell">
          <BrandPanel activeIndex={activeIndex} completedIndex={completedIndex} />

          <main className="right-panel">
            {view === "login" && (
              <LoginView
                onSwitch={() => setView("register")}
                onLoggedIn={handleLoggedIn}
                onGoHome={() => setView("home")}
              />
            )}
            {view === "register" && (
              <RegisterView
                onSwitch={() => setView("login")}
                onRegistered={handleRegistered}
                onGoHome={() => setView("home")}
              />
            )}
            {view === "request" && (
              <RequestView
                user={user}
                onLogout={handleLogout}
                onSubmitted={handleSubmitted}
                onGoHome={() => setView("home")}
                initialRoom={selectedRoom}
                initialColor={selectedColor}
              />
            )}
            {view === "success" && lastRequest && (
              <SuccessView
                data={lastRequest}
                onNewRequest={handleNewRequest}
                onLogout={handleLogout}
                onGoHome={() => setView("home")}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);
