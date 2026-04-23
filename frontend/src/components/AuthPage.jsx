import { useState } from "react";
import { login, register } from "../api";

export default function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
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

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">💰 Expense Tracker</div>
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
            <button type="button" className="link-btn" onClick={() => { setIsLogin(!isLogin); setError(null); }}>
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
