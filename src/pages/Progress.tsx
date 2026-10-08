import { useEffect, useState } from "react";
import {
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type HistoryDay = {
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  mealCount: number;
};

type Nutrition = {
  calorieTarget: number;
  proteinTarget: number;
};

type User = {
  id: string;
  name: string;
  email: string;
};

function Progress() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [nutrition, setNutrition] = useState<Nutrition | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const authResponse = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (!authResponse.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const authData = await authResponse.json();
        setUser(authData.user);

        const historyResponse = await fetch(
          "http://localhost:5000/api/meals/history?days=7",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const profileResponse = await fetch(
          "http://localhost:5000/api/profile",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const historyData = await historyResponse.json();
        const profileData = await profileResponse.json();

        if (!historyResponse.ok) {
          setError(
            historyData.message || "Unable to load progress data."
          );
          return;
        }

        if (!profileResponse.ok) {
          setError(
            profileData.message || "Unable to load nutrition targets."
          );
          return;
        }

        setHistory(historyData.history || []);
        setNutrition(profileData.nutrition || null);
      } catch (err) {
        console.error("Load progress error:", err);
        setError("Unable to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <aside className="dashboard-sidebar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-mark">
              <HeartPulse size={22} />
            </div>

            <span>
              Nutri<span>Fit</span>
              <small>PH</small>
            </span>
          </div>
        </aside>

        <section className="dashboard-content">
          <p>Loading your progress...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <aside className="dashboard-sidebar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-mark">
              <HeartPulse size={22} />
            </div>

            <span>
              Nutri<span>Fit</span>
              <small>PH</small>
            </span>
          </div>
        </aside>

        <section className="dashboard-content">
          <h1>Progress</h1>

          <p>{error}</p>

          <button
            className="progress-back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </button>
        </section>
      </main>
    );
  }

  const totalCalories = history.reduce(
    (total, day) => total + day.calories,
    0
  );

  const totalProtein = history.reduce(
    (total, day) => total + day.protein,
    0
  );

  const totalCarbohydrates = history.reduce(
    (total, day) => total + day.carbohydrates,
    0
  );

  const totalFat = history.reduce(
    (total, day) => total + day.fat,
    0
  );

  const today = history[history.length - 1];

  const todayCalories = today?.calories || 0;
  const todayProtein = today?.protein || 0;

  const calorieTarget = nutrition?.calorieTarget || 0;
  const proteinTarget = nutrition?.proteinTarget || 0;

  const calorieProgress =
    calorieTarget > 0
      ? Math.min(
          Math.round((todayCalories / calorieTarget) * 100),
          100
        )
      : 0;

  const proteinProgress =
    proteinTarget > 0
      ? Math.min(
          Math.round((todayProtein / proteinTarget) * 100),
          100
        )
      : 0;

  const chartMaximum = Math.max(
    calorieTarget,
    ...history.map((day) => day.calories),
    1
  );

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="dashboard-logo-mark">
            <HeartPulse size={22} />
          </div>

          <span>
            Nutri<span>Fit</span>
            <small>PH</small>
          </span>
        </div>

        <nav className="dashboard-nav">
          <Link
            to="/dashboard"
            className="dashboard-nav-item"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/add-meal"
            className="dashboard-nav-item"
          >
            <Utensils size={19} />
            Meals
          </Link>

          <button className="dashboard-nav-item">
            <Dumbbell size={19} />
            Activity
          </button>

          <Link
            to="/progress"
            className="dashboard-nav-item active"
          >
            <TrendingUp size={19} />
            Progress
          </Link>
        </nav>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          Log out
        </button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              YOUR PROGRESS
            </p>

            <h1>Nutrition trends.</h1>

            <p className="dashboard-subtitle">
              See how your nutrition has been tracking over the last 7 days.
            </p>
          </div>

          <div className="dashboard-profile">
            <div className="dashboard-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        <section className="progress-today-card">
          <div className="progress-today-main">
            <span className="dashboard-card-label">
              TODAY'S PROGRESS
            </span>

            <h2>
              {todayCalories.toLocaleString()}{" "}
              <small>
                / {calorieTarget.toLocaleString()} kcal
              </small>
            </h2>

            <p>
              You've completed{" "}
              <strong>{calorieProgress}%</strong> of your
              daily calorie goal.
            </p>

            <div className="progress-today-track">
              <div
                className="progress-today-fill"
                style={{
                  width: `${calorieProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="progress-today-circle">
            <span>{calorieProgress}%</span>
            <small>complete</small>
          </div>
        </section>

        <section className="dashboard-stats progress-summary">
          <div className="dashboard-stat-card">
            <span>Calories</span>

            <strong>
              {totalCalories.toLocaleString()}
            </strong>

            <small>7-day total</small>
          </div>

          <div className="dashboard-stat-card">
            <span>Protein</span>

            <strong>
              {totalProtein.toFixed(1)}g
            </strong>

            <small>7-day total</small>
          </div>

          <div className="dashboard-stat-card">
            <span>Carbs</span>

            <strong>
              {totalCarbohydrates.toFixed(1)}g
            </strong>

            <small>7-day total</small>
          </div>

          <div className="dashboard-stat-card">
            <span>Fat</span>

            <strong>
              {totalFat.toFixed(1)}g
            </strong>

            <small>7-day total</small>
          </div>
        </section>

        <section className="dashboard-section progress-chart-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                CALORIE INTAKE
              </span>

              <h2>Last 7 days</h2>

              <p>
                Daily goal:{" "}
                {calorieTarget.toLocaleString()} kcal
              </p>
            </div>
          </div>

          <div className="calorie-chart">
            <div className="calorie-chart-grid">
              <div className="calorie-goal-line">
                <span>
                  {calorieTarget.toLocaleString()} kcal goal
                </span>
              </div>

              <div className="calorie-bars">
                {history.map((day) => {
                  const barHeight =
                    day.calories === 0
                      ? 0
                      : Math.max(
                          8,
                          (day.calories / chartMaximum) * 100
                        );

                  return (
                    <div
                      className="calorie-bar-column"
                      key={day.date}
                    >
                      <div className="calorie-bar-value">
                        {day.calories > 0
                          ? day.calories
                          : ""}
                      </div>

                      <div className="calorie-bar-area">
                        <div
                          className="calorie-bar"
                          style={{
                            height: `${barHeight}%`,
                          }}
                        />
                      </div>

                      <strong>
                        {formatDate(day.date)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                PROTEIN INTAKE
              </span>

              <h2>Daily protein</h2>

              <p>
                Daily goal: {proteinTarget}g
              </p>
            </div>

            <div className="progress-protein-today">
              <strong>{todayProtein}g</strong>
              <span>{proteinProgress}% today</span>
            </div>
          </div>

          <div className="protein-list">
            {history.map((day) => {
              const percentage =
                proteinTarget > 0
                  ? Math.min(
                      (day.protein / proteinTarget) * 100,
                      100
                    )
                  : 0;

              return (
                <div
                  className="protein-day"
                  key={day.date}
                >
                  <div className="protein-day-header">
                    <strong>
                      {formatDate(day.date)}
                    </strong>

                    <span>
                      {day.protein}g / {proteinTarget}g
                    </span>
                  </div>

                  <div className="protein-progress-track">
                    <div
                      className="protein-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Progress;
