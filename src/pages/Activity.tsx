import { FormEvent, useEffect, useState } from "react";
import {
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type ActivityRecord = {
  _id: string;
  activityType: string;
  activityName: string;
  duration: number;
  caloriesBurned: number;
  loggedAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

const activityLabels: Record<string, string> = {
  walking: "Walking",
  running: "Running",
  cycling: "Cycling",
  swimming: "Swimming",
  gym: "Gym",
  sports: "Sports",
  home_workout: "Home workout",
  other: "Other",
};

function Activity() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadActivities = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const [authResponse, activityResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: "Bearer " + token,
            },
          }),
          fetch("http://localhost:5000/api/activities", {
            headers: {
              Authorization: "Bearer " + token,
            },
          }),
        ]);

      if (!authResponse.ok || !activityResponse.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const authData = await authResponse.json();
      const activityData = await activityResponse.json();

      setUser(authData.user);
      setActivities(activityData.activities || []);
    } catch (err) {
      console.error("Load activities error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const durationAmount = Number(duration);
    const caloriesAmount = Number(caloriesBurned);

    if (!activityType || !activityName.trim()) {
      setError("Please complete the activity details.");
      return;
    }

    if (
      Number.isNaN(durationAmount) ||
      durationAmount <= 0
    ) {
      setError("Duration must be greater than 0.");
      return;
    }

    if (
      Number.isNaN(caloriesAmount) ||
      caloriesAmount < 0
    ) {
      setError("Calories burned cannot be negative.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            activityType,
            activityName: activityName.trim(),
            duration: durationAmount,
            caloriesBurned: caloriesAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to save activity."
        );
        return;
      }

      setActivities((currentActivities) => [
        data.activity,
        ...currentActivities,
      ]);

      setActivityType("");
      setActivityName("");
      setDuration("");
      setCaloriesBurned("");
    } catch (err) {
      console.error("Save activity error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (activityId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/activities/${activityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to delete activity."
        );
        return;
      }

      setActivities((currentActivities) =>
        currentActivities.filter(
          (activity) => activity._id !== activityId
        )
      );
    } catch (err) {
      console.error("Delete activity error:", err);
      setError("Unable to connect to the server.");
    }
  };

  const totalCaloriesBurned = activities.reduce(
    (total, activity) =>
      total + activity.caloriesBurned,
    0
  );

  const totalDuration = activities.reduce(
    (total, activity) =>
      total + activity.duration,
    0
  );

  return (
    <main className="dashboard-page activity-page">
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

          <Link
            to="/activity"
            className="dashboard-nav-item active"
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
              ACTIVITY TRACKING
            </p>

            <h1>Move your body.</h1>

            <p className="dashboard-subtitle">
              Log your workouts and activities to keep track
              of calories burned.
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

        <section className="activity-summary">
          <div className="activity-summary-card">
            <span>TODAY'S CALORIES BURNED</span>

            <strong>
              {totalCaloriesBurned.toLocaleString()}
            </strong>

            <small>kcal</small>
          </div>

          <div className="activity-summary-card">
            <span>TOTAL ACTIVITY TIME</span>

            <strong>{totalDuration}</strong>

            <small>minutes</small>
          </div>

          <div className="activity-summary-card">
            <span>ACTIVITIES</span>

            <strong>{activities.length}</strong>

            <small>logged today</small>
          </div>
        </section>

        <section className="activity-layout">
          <div className="activity-form-card">
            <div className="activity-card-heading">
              <span>LOG ACTIVITY</span>

              <h2>Add an activity.</h2>

              <p>
                Record your exercise or movement for today.
              </p>
            </div>

            <form
              className="activity-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="activityType">
                  Activity type
                </label>

                <select
                  id="activityType"
                  value={activityType}
                  onChange={(event) =>
                    setActivityType(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select activity type
                  </option>

                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="swimming">Swimming</option>
                  <option value="gym">Gym</option>
                  <option value="sports">Sports</option>
                  <option value="home_workout">
                    Home workout
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="activityName">
                  Activity name
                </label>

                <input
                  id="activityName"
                  type="text"
                  placeholder="e.g. Morning run"
                  value={activityName}
                  onChange={(event) =>
                    setActivityName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="activity-form-grid">
                <div className="form-group">
                  <label htmlFor="duration">
                    Duration
                  </label>

                  <input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="30"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                    required
                  />

                  <small>minutes</small>
                </div>

                <div className="form-group">
                  <label htmlFor="caloriesBurned">
                    Calories burned
                  </label>

                  <input
                    id="caloriesBurned"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="250"
                    value={caloriesBurned}
                    onChange={(event) =>
                      setCaloriesBurned(
                        event.target.value
                      )
                    }
                    required
                  />

                  <small>kcal</small>
                </div>
              </div>

              {error && (
                <p className="auth-error">{error}</p>
              )}

              <button
                type="submit"
                className="activity-submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving activity..."
                  : "Save activity"}
              </button>
            </form>
          </div>

          <div className="activity-list-card">
            <div className="activity-card-heading">
              <span>TODAY</span>

              <h2>Today's activity.</h2>

              <p>
                Your logged movement for today.
              </p>
            </div>

            {isLoading ? (
              <p className="activity-empty">
                Loading activities...
              </p>
            ) : activities.length === 0 ? (
              <div className="activity-empty">
                <Dumbbell size={32} />

                <strong>
                  No activities logged yet.
                </strong>

                <span>
                  Add your first activity to start tracking
                  your movement.
                </span>
              </div>
            ) : (
              <div className="activity-list">
                {activities.map((activity) => (
                  <article
                    className="activity-item"
                    key={activity._id}
                  >
                    <div className="activity-item-icon">
                      <Dumbbell size={19} />
                    </div>

                    <div className="activity-item-main">
                      <strong>
                        {activity.activityName}
                      </strong>

                      <span>
                        {activityLabels[
                          activity.activityType
                        ] || activity.activityType}
                        {" · "}
                        {activity.duration} min
                      </span>
                    </div>

                    <div className="activity-item-calories">
                      <strong>
                        {activity.caloriesBurned}
                      </strong>

                      <span>kcal</span>
                    </div>

                    <button
                      type="button"
                      className="activity-delete"
                      onClick={() =>
                        handleDelete(activity._id)
                      }
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Activity;
