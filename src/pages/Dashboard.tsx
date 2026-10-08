import { useEffect, useState } from "react";
import {
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Utensils,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
};

type Nutrition = {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  waterTarget: number;
};

type Meal = {
  _id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodName: string;
  serving: number;
  calories: number;
  protein: number;
  carbohydrates?: number;
  fat?: number;
  loggedAt: string;
};

type Activity = {
  _id: string;
  activityType: string;
  activityName: string;
  duration: number;
  caloriesBurned: number;
  loggedAt: string;
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [nutrition, setNutrition] = useState<Nutrition | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
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
              Authorization: `Bearer ${token}`,
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

        const profileResponse = await fetch(
          "http://localhost:5000/api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setNutrition(profileData.nutrition);
        }

        const mealsResponse = await fetch(
          "http://localhost:5000/api/meals",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (mealsResponse.ok) {
          const mealsData = await mealsResponse.json();
          setMeals(mealsData.meals || []);
        }

        const activitiesResponse = await fetch(
          "http://localhost:5000/api/activities",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData.activities || []);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleDeleteMeal = async (mealId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsDeleting(mealId);

      const response = await fetch(
        `http://localhost:5000/api/meals/${mealId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Unable to delete meal.");
        return;
      }

      setMeals((currentMeals) =>
        currentMeals.filter((meal) => meal._id !== mealId)
      );
    } catch (error) {
      console.error("Delete meal error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const totalCalories = meals.reduce(
    (total, meal) => total + meal.calories,
    0
  );

  const totalProtein = meals.reduce(
    (total, meal) => total + meal.protein,
    0
  );

  const totalCarbohydrates = meals.reduce(
  (total, meal) => total + (meal.carbohydrates || 0),
  0
);

const totalFat = meals.reduce(
  (total, meal) => total + (meal.fat || 0),
  0
);

  
const totalCaloriesBurned = activities.reduce(
  (total, activity) => total + activity.caloriesBurned,
  0
);

const totalActivityDuration = activities.reduce(
  (total, activity) => total + activity.duration,
  0
);

const activityCount = activities.length;
const calorieTarget = nutrition?.calorieTarget || 0;

  const calorieProgress =
    calorieTarget > 0
      ? Math.min(Math.round((totalCalories / calorieTarget) * 100), 100)
      : 0;

  const getMealTypeLabel = (mealType: Meal["mealType"]) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

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
          <button className="dashboard-nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <Link
            to="/add-meal"
            className="dashboard-nav-item"
          >
            <Utensils size={19} />
            Meals
          </Link>

          <Link
            to="/activity"
            className="dashboard-nav-item"
          >
            <Dumbbell size={19} />
            Activity
          </Link>

          <Link
            to="/progress"
            className="dashboard-nav-item"
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
              YOUR NUTRITION JOURNEY
            </p>

            <h1>
              Welcome back,{" "}
              {user?.name?.split(" ")[0] || "there"}!
            </h1>

            <p className="dashboard-subtitle">
              Let's make today a healthy one.
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

        <section className="dashboard-hero">
          <div>
            <span className="dashboard-card-label">
              TODAY'S CALORIE GOAL
            </span>

            <h2>
              {nutrition
                ? `${nutrition.calorieTarget.toLocaleString()} kcal`
                : "—"}
            </h2>

            <p>
              You've logged{" "}
              <strong>{totalCalories.toLocaleString()} kcal</strong>{" "}
              today. Keep tracking your meals to stay on target.
            </p>
          </div>

          <div className="dashboard-hero-circle">
            <span>{calorieProgress}%</span>
            <small>complete</small>
          </div>
        </section>

        <section className="dashboard-stats">
  <div className="dashboard-stat-card">
    <span>Calories</span>

    <strong>
      {totalCalories.toLocaleString()}
    </strong>

    <small>
      of {nutrition?.calorieTarget.toLocaleString() || "—"} kcal
    </small>
  </div>

  <div className="dashboard-stat-card">
    <span>Protein</span>

    <strong>
      {Math.round(totalProtein)} /{" "}
      {nutrition?.proteinTarget ?? "—"} g
    </strong>

    <small>of daily goal</small>
  </div>

  <div className="dashboard-stat-card">
    <span>Carbs</span>

    <strong>
      {Math.round(totalCarbohydrates)} g
    </strong>

    <small>today</small>
  </div>

  <div className="dashboard-stat-card">
    <span>Fat</span>

    <strong>
      {Math.round(totalFat)} g
    </strong>

    <small>today</small>
  </div>
</section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                TODAY
              </span>

              <h2>Today's meals</h2>
            </div>

            <Link
              to="/add-meal"
              className="dashboard-add-button"
            >
              + Add meal
            </Link>
          </div>

          {meals.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-icon">
                <Utensils size={24} />
              </div>

              <h3>No meals logged yet</h3>

              <p>
                Start tracking what you eat to see your daily
                nutrition progress.
              </p>

              <Link
                to="/add-meal"
                className="dashboard-primary-button"
              >
                Add your first meal
              </Link>
            </div>
          ) : (
            <div className="dashboard-meals-list">
              {meals.map((meal) => (
                <div
                  className="dashboard-meal-card"
                  key={meal._id}
                >
                  <div className="dashboard-meal-icon">
                    <Utensils size={20} />
                  </div>

                  <div className="dashboard-meal-info">
                    <span>
                      {getMealTypeLabel(meal.mealType)}
                    </span>

                    <h3>{meal.foodName}</h3>

                    <p>
                      {meal.serving} serving
                      {meal.serving !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="dashboard-meal-nutrition">
                    <strong>
                      {meal.calories.toLocaleString()} kcal
                    </strong>

                    <span>
                      {meal.protein} g protein
                    </span>

                    <span>
                      {meal.carbohydrates ?? 0} g carbs
                    </span>

                    <span>
                      {meal.fat ?? 0} g fat
                    </span>
                  </div>

                  <button
                    className="dashboard-meal-delete"
                    onClick={() =>
                      handleDeleteMeal(meal._id)
                    }
                    disabled={isDeleting === meal._id}
                    aria-label={`Delete ${meal.foodName}`}
                    title="Delete meal"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-activity-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                TODAY
              </span>

              <h2>Today's activity</h2>
            </div>

            <Link
              to="/activity"
              className="dashboard-add-button"
            >
              + Log activity
            </Link>
          </div>

          <div className="dashboard-activity-summary">
            <div className="dashboard-activity-stat">
              <div className="dashboard-activity-stat-icon">
                <Dumbbell size={20} />
              </div>

              <div>
                <strong>
                  {totalCaloriesBurned.toLocaleString()} kcal
                </strong>

                <span>Calories burned</span>
              </div>
            </div>

            <div className="dashboard-activity-stat">
              <div className="dashboard-activity-stat-icon">
                <HeartPulse size={20} />
              </div>

              <div>
                <strong>{totalActivityDuration} min</strong>

                <span>Active time</span>
              </div>
            </div>

            <div className="dashboard-activity-stat">
              <div className="dashboard-activity-stat-icon">
                <TrendingUp size={20} />
              </div>

              <div>
                <strong>{activityCount}</strong>

                <span>Activities</span>
              </div>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-icon">
                <Dumbbell size={24} />
              </div>

              <h3>No activities logged yet</h3>

              <p>
                Log your exercise and movement to keep track of
                your daily activity.
              </p>

              <Link
                to="/activity"
                className="dashboard-primary-button"
              >
                Log your first activity
              </Link>
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {activities.slice(0, 3).map((activity) => (
                <div
                  className="dashboard-activity-card"
                  key={activity._id}
                >
                  <div className="dashboard-activity-icon">
                    <Dumbbell size={20} />
                  </div>

                  <div className="dashboard-activity-info">
                    <span>{activity.activityType}</span>

                    <h3>{activity.activityName}</h3>

                    <p>{activity.duration} minutes</p>
                  </div>

                  <div className="dashboard-activity-calories">
                    <strong>
                      {activity.caloriesBurned.toLocaleString()} kcal
                    </strong>

                    <span>burned</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </section>
    </main>
  );
}

export default Dashboard;












