import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ThemeToggle } from "../components/ThemeToggle";

export const LoginPage = () => {
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyMfa = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyMfa(mfaToken as string, code);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const brandMark = (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: "linear-gradient(145deg, var(--brand), var(--brand-ink))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        marginBottom: 2,
      }}
    >
      E
    </span>
  );

  const themeCorner = (
    <div style={{ position: "fixed", top: 20, right: 20 }}>
      <ThemeToggle />
    </div>
  );

  if (mfaToken) {
    return (
      <div className="login-shell">
        {themeCorner}
        <form className="card login-card" onSubmit={onVerifyMfa}>
          {brandMark}
          <h2 style={{ margin: 0 }}>Enter your code</h2>
          <p className="muted" style={{ margin: 0 }}>Open your authenticator app and enter the 6-digit code.</p>
          <input
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
            required
          />
          {error && <div className="error-text">{error}</div>}
          <button className="primary" type="submit" disabled={submitting || code.length !== 6}>
            {submitting ? "Verifying…" : "Verify"}
          </button>
          <button type="button" onClick={() => { setMfaToken(null); setCode(""); setError(null); }}>
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-shell">
      {themeCorner}
      <form className="card login-card" onSubmit={onSubmit}>
        {brandMark}
        <h2 style={{ margin: 0 }}>Sign in</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-text">{error}</div>}
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};
