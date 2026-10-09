import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

function ProfileSetup() {
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            age: Number(age),
            sex,
            height: Number(height),
            weight: Number(weight),
            activityLevel,
            goal,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to save your profile.");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Profile setup error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="profile-setup-page">
      <section className="profile-setup-card">
        <div className="profile-setup-heading">
          <span>LET'S GET STARTED</span>

          <h1>Build your nutrition profile.</h1>

          <p>
            Tell us a little about yourself so NutriFit-PH can
            personalize your nutrition goals.
          </p>
        </div>

        <form
          className="profile-setup-form"
          onSubmit={handleSubmit}
        >
          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="age">Age</label>

              <input
                id="age"
                type="number"
                placeholder="e.g. 25"
                min="13"
                max="100"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sex">Sex</label>

              <select
                id="sex"
                value={sex}
                onChange={(event) => setSex(event.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>

              <input
                id="height"
                type="number"
                placeholder="e.g. 170"
                min="100"
                max="250"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>

              <input
                id="weight"
                type="number"
                placeholder="e.g. 70"
                min="30"
                max="300"
                step="0.1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="activityLevel">
              Activity level
            </label>

            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(event) =>
                setActivityLevel(event.target.value)
              }
              required
            >
              <option value="">Select your usual activity</option>

              <option value="sedentary">
                Sedentary — little or no exercise
              </option>

              <option value="light">
                Lightly active — exercise 1–3 days/week
              </option>

              <option value="moderate">
                Moderately active — exercise 3–5 days/week
              </option>

              <option value="active">
                Active — exercise 6–7 days/week
              </option>

              <option value="very_active">
                Very active — intense exercise or physical job
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goal">What's your goal?</label>

            <select
              id="goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              required
            >
              <option value="">Select your goal</option>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain my weight</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="profile-setup-submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Saving profile..."
              : "Continue to my dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}


export default ProfileSetup;
