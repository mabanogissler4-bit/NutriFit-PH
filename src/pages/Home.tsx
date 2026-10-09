import "./Home.css";
import { Activity, ArrowRight, HeartPulse, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-mark">
            <HeartPulse size={22} strokeWidth={2.5} />
          </div>

          <span className="brand-name">
            Nutri<span>Fit</span>
            <small>PH</small>
          </span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="login-button">
            Log in
          </Link>

          <Link to="/register" className="signup-button">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <Activity size={16} />
              <span>Your health. Your journey.</span>
            </div>

            <h1>
              Eat better.
              <br />
              <span>Live stronger.</span>
            </h1>

            <p>
              NutriFit-PH helps you understand your nutrition, track your
              fitness, and build healthier habits using food and information
              that make sense for Filipinos.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="primary-button">
                Start your journey
                <ArrowRight size={18} />
              </Link>

              <a href="#features" className="secondary-button">
                Explore NutriFit
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>01</strong>
                <span>Track nutrition</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Stay active</span>
              </div>

              <div>
                <strong>03</strong>
                <span>See progress</span>
              </div>
            </div>
          </div>

          {/* Reactor visual */}
          <div className="hero-visual">
            <div className="reactor-glow" />

            <div className="reactor">
              <div className="reactor-ring reactor-ring-outer" />
              <div className="reactor-ring reactor-ring-middle" />

              <div className="reactor-fluid fluid-one" />
              <div className="reactor-fluid fluid-two" />
              <div className="reactor-fluid fluid-three" />

              <div className="reactor-core">
                <HeartPulse size={46} strokeWidth={1.7} />
              </div>
            </div>

            <div className="floating-card nutrition-card">
              <Utensils size={18} />

              <div>
                <strong>Nutrition</strong>
                <span>Balanced & personalized</span>
              </div>
            </div>

            <div className="floating-card fitness-card">
              <Activity size={18} />

              <div>
                <strong>Fitness</strong>
                <span>Progress every day</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features" id="features">
          <div className="section-heading">
            <span>WHY NUTRIFIT-PH</span>
            <h2>Everything you need to build better habits.</h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon nutrition-icon">
                <Utensils size={22} />
              </div>

              <h3>Nutrition tracking</h3>

              <p>
                Understand what you're eating and make smarter food choices
                without complicated tracking.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon fitness-icon">
                <Activity size={22} />
              </div>

              <h3>Fitness tracking</h3>

              <p>
                Keep your activity, goals, and progress in one simple place.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon health-icon">
                <HeartPulse size={22} />
              </div>

              <h3>Personalized goals</h3>

              <p>
                Build a health plan around your own body, lifestyle, and goals.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
