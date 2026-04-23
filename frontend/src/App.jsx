import { useState, useEffect, useCallback } from "react";
import { fetchExpenses, isLoggedIn, getUser, logout } from "./api";
import AuthPage from "./components/AuthPage";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Filters from "./components/Filters";
import Summary from "./components/Summary";
import Pagination from "./components/Pagination";
import Toast from "./components/Toast";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">💰 Expense Tracker</div>
        <div className="navbar-right">
          <span className="navbar-user">👤 {user?.name}</span>
          <button className="btn-outline-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} Expense Tracker — Built with ❤️</p>
        <p>Contact us at <a href="mailto:contact@fenmo.ai">contact@fenmo.ai</a> · <a href="https://fenmo.ai" target="_blank" rel="noopener noreferrer">fenmo.ai</a></p>
      </div>
    </footer>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses({ category: category || undefined, sort: sort || undefined, page });
      setExpenses(data.expenses);
      setTotalPages(data.totalPages);
    } catch {
      setError("Failed to load expenses. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [category, sort, page]);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const handleCategoryChange = (c) => { setCategory(c); setPage(0); };
  const handleSortChange = (s) => { setSort(s); setPage(0); };
  const handleCreated = () => { setPage(0); load(); };
  const handleCreateError = (msg) => setToast(msg);

  if (!authed) return <AuthPage onAuth={() => setAuthed(true)} />;

  const user = getUser();

  return (
    <div className="app-layout">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Navbar user={user} onLogout={() => { logout(); setAuthed(false); }} />
      <main className="container">
        <div className="section-card">
          <ExpenseForm onCreated={handleCreated} onError={handleCreateError} />
        </div>
        <div className="section-card">
          <h2 className="section-title">📊 Your Expenses</h2>
          <Filters category={category} sort={sort} onCategoryChange={handleCategoryChange} onSortChange={handleSortChange} />
          {error && <p className="error" role="alert">{error}</p>}
          <Summary expenses={expenses} />
          <ExpenseList expenses={expenses} loading={loading} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
