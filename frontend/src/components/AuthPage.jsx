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
    <div className="container">
      <h1>💰 Expense Tracker</h1>
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {error && <p className="error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Name
              <input type="text" value={form.name} onChange={update("name")} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={update("email")} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Please wait..." : isLogin ? "Login" : "Register"}</button>
        </form>
        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" className="link-btn" onClick={() => { setIsLogin(!isLogin); setError(null); }}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
