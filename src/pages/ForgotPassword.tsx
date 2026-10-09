import { ArrowLeft, HeartPulse, Mail } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setResetLink("");
    setError("");

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to process your request.");
        return;
      }

      setMessage(
        data.message || "If your email is registered, follow the password reset instructions."
      );

      if (data.resetToken) {
        setResetLink(
          `${window.location.origin}/reset-password/${data.resetToken}`
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </div>

      <div className="auth-container">
        <Link to="/login" className="auth-back">
          <ArrowLeft size={18} />
          Back to login
        </Link>

        <section className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <HeartPulse size={24} strokeWidth={2.5} />
            </div>

            <span className="auth-brand-name">
              Nutri<span>Fit</span>
              <small>PH</small>
            </span>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">RESET PASSWORD</span>
            <h1>Forgot your password?</h1>
            <p>
              Enter your email address and we'll help you get back into
              your account.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success" role="status">
                {message}
              </p>
            )}

            {resetLink && (
              <div className="reset-link-container">
                <p>
                  For development, use the link below to reset your password:
                </p>
                <Link to={resetLink.replace(window.location.origin, "")}>
                  Open password reset page
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset instructions"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-register">
            Remember your password?{" "}
            <Link to="/login">Log in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
