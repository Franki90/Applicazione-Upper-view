import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminLogin, fetchAnalytics, fetchPendingOffers, moderateOffer, runReminderJobs } from "./api";
import { AdminAnalytics, PendingOffer } from "./types";

const formatDate = (value?: string | null) => (value ? value.slice(0, 10) : "-");

function App() {
  const [email, setEmail] = useState("admin@ticino.market");
  const [password, setPassword] = useState("Pass12345");
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>([]);

  const cards = useMemo(
    () => [
      { key: "users", label: "Users", value: analytics?.users ?? 0 },
      { key: "vendors", label: "Vendors", value: analytics?.vendors ?? 0 },
      { key: "offers", label: "Offers", value: analytics?.offers ?? 0 },
      { key: "coupons", label: "Coupons", value: analytics?.coupons ?? 0 },
      { key: "pushDevices", label: "Push Devices", value: analytics?.pushDevices ?? 0 }
    ],
    [analytics]
  );

  const loadDashboard = async (activeToken: string) => {
    const [analyticsData, offersData] = await Promise.all([
      fetchAnalytics(activeToken),
      fetchPendingOffers(activeToken)
    ]);

    setAnalytics(analyticsData);
    setPendingOffers(offersData);
  };

  useEffect(() => {
    if (!token) return;

    void loadDashboard(token).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard");
    });
  }, [token]);

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = await adminLogin(email, password);
      if (auth.user.role !== "ADMIN") {
        setError("Access denied. Admin role required.");
        setLoading(false);
        return;
      }

      setToken(auth.token);
      setName(auth.user.name);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onModerate = async (offerId: string, status: "APPROVED" | "REJECTED") => {
    if (!token) return;
    setError(null);

    try {
      await moderateOffer(token, offerId, status);
      await loadDashboard(token);
    } catch (moderateError) {
      setError(moderateError instanceof Error ? moderateError.message : "Moderation failed");
    }
  };

  const onRunReminders = async () => {
    if (!token) return;
    setError(null);

    try {
      await runReminderJobs(token);
    } catch (jobError) {
      setError(jobError instanceof Error ? jobError.message : "Reminder jobs failed");
    }
  };

  if (!token) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1>Ticino Admin Panel</h1>
          <p>Moderation, analytics, and notification operations.</p>

          <form onSubmit={onLogin} className="auth-form">
            <label>
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {error ? <div className="error">{error}</div> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <h1>Welcome, {name}</h1>
          <p>Swiss Ticino marketplace control center.</p>
        </div>
        <div className="topbar-actions">
          <button onClick={onRunReminders}>Run Reminder Jobs</button>
          <button onClick={() => setToken(null)} className="secondary">
            Logout
          </button>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <section className="stats-grid">
        {cards.map((card) => (
          <article key={card.key} className="stat-card">
            <h3>{card.label}</h3>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Pending Offers</h2>
          <span>{pendingOffers.length} items</span>
        </div>

        <div className="offer-list">
          {pendingOffers.map((offer) => (
            <article key={offer.id} className="offer-card">
              <div className="offer-head">
                <h3>{offer.title}</h3>
                <span>{offer.category}</span>
              </div>
              <p>{offer.description}</p>
              <div className="meta">
                <span>Vendor: {offer.vendor.businessName}</span>
                <span>City: {offer.city}</span>
                <span>Valid: {formatDate(offer.endDate ?? offer.validUntil)}</span>
              </div>
              <div className="actions">
                <button onClick={() => onModerate(offer.id, "APPROVED")}>Approve</button>
                <button onClick={() => onModerate(offer.id, "REJECTED")} className="danger">
                  Reject
                </button>
              </div>
            </article>
          ))}
          {pendingOffers.length === 0 ? <p>No pending offers.</p> : null}
        </div>
      </section>
    </main>
  );
}

export default App;
