import { useState } from "react";
import { login, register } from "../api";

export default function AuthPage({ onAuth }) {
  const [view, setView] = useState("home"); // "home", "login", "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (view === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const goTo = (v) => { setView(v); setError(null); setForm({ name: "", email: "", password: "" }); };

  if (view === "home") {
    return (
      <div className="app-layout">
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="navbar-brand">💰 Expense Tracker</div>
            <div className="navbar-right">
              <button className="btn-outline-sm" onClick={() => goTo("login")}>Sign In</button>
              <button className="btn-solid-sm" onClick={() => goTo("register")}>Get Started</button>
            </div>
          </div>
        </nav>

        <main className="landing">
          <section className="hero">
            <h1>Take Control of<br />Your <span className="highlight">Finances</span></h1>
            <p className="hero-sub">Track every rupee, understand your spending habits, and make smarter financial decisions — all in one simple tool.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => goTo("register")}>Start Tracking Free →</button>
              <button className="btn-ghost" onClick={() => goTo("login")}>I have an account</button>
            </div>
          </section>

          <section className="features">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Record Expenses</h3>
              <p>Quickly log expenses with amount, category, description, and date. Built for speed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Filter & Sort</h3>
              <p>Find what you need — filter by category, sort by date or amount, paginated for clarity.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Instant Insights</h3>
              <p>See totals and per-category breakdowns at a glance. Know where your money goes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your data is yours. Encrypted passwords, JWT auth, and per-user data isolation.</p>
            </div>
          </section>

          <section className="cta-section">
            <h2>Ready to take control?</h2>
            <p>Join now and start understanding your spending in minutes.</p>
            <button className="btn-primary" onClick={() => goTo("register")}>Create Free Account</button>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} Expense Tracker — Built with ❤️</p>
            <p>Contact us at <a href="mailto:contact@fenmo.ai">contact@fenmo.ai</a> · <a href="https://fenmo.ai" target="_blank" rel="noopener noreferrer">fenmo.ai</a></p>
          </div>
        </footer>
      </div>
    );
  }

  const isLogin = view === "login";

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-inner">
          <button className="navbar-brand navbar-brand-btn" onClick={() => goTo("home")}>💰 Expense Tracker</button>
        </div>
      </nav>
      <main className="container auth-container">
        <div className="auth-card">
          <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
          <p className="auth-subtitle">{isLogin ? "Sign in to manage your expenses" : "Start tracking your spending today"}</p>
          {error && <p className="error" role="alert">{error}</p>}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                Name
                <input type="text" value={form.name} onChange={update("name")} required placeholder="Your name" />
              </label>
            )}
            <label>
              Email
              <input type="email" value={form.email} onChange={update("email")} required placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={update("password")} required minLength={6} placeholder="Min 6 characters" />
            </label>
            <button type="submit" disabled={loading}>{loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</button>
          </form>
          <p className="auth-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="link-btn" onClick={() => goTo(isLogin ? "register" : "login")}>
              {isLogin ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} Expense Tracker — Built with ❤️</p>
          <p>Contact us at <a href="mailto:contact@fenmo.ai">contact@fenmo.ai</a> · <a href="https://fenmo.ai" target="_blank" rel="noopener noreferrer">fenmo.ai</a></p>
        </div>
      </footer>
    </div>
  );
}
