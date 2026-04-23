import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
import { useError } from "../../hooks/ErrorContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showError } = useError();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/chatbot";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(form.email, form.password);
    setLoading(false);

    if (!result.status) {
      showError(result.error || "Unable to login");
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F2E3BC]/10 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-[#96BBBB]/30">
        <h1 className="text-2xl font-bold text-[#414535] mb-2">Welcome back 👋</h1>
        <p className="text-sm text-[#414535]/70 mb-6">Login to continue to your chats and notes.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#414535] mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="w-full rounded-lg border border-[#96BBBB]/40 px-3 py-2 outline-none focus:ring-2 focus:ring-[#618985]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#414535] mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              className="w-full rounded-lg border border-[#96BBBB]/40 px-3 py-2 outline-none focus:ring-2 focus:ring-[#618985]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#618985] hover:bg-[#96BBBB] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-[#414535]/80 mt-4 text-center">
          New here?{" "}
          <Link to="/register" className="text-[#618985] hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
