const App = () => {
  const [view, setView] = React.useState("login"); // login | register | request | success
  const [user, setUser] = React.useState(null);
  const [lastRequest, setLastRequest] = React.useState(null);

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

  function handleLogout() {
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
