import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type Food = {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  isFilipino: boolean;
};

function AddMeal() {
  const navigate = useNavigate();

  const [mealType, setMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [serving, setServing] = useState("1");

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbohydrates, setCarbohydrates] = useState("");
  const [fat, setFat] = useState("");

  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchFoods = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!foodName.trim()) {
        setFoods([]);
        setShowResults(false);
        return;
      }

      try {
        setIsSearching(true);

        const response = await fetch(
          `http://localhost:5000/api/foods?search=${encodeURIComponent(
            foodName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setFoods([]);
          return;
        }

        setFoods(data.foods || []);
        setShowResults(true);
      } catch (error) {
        console.error("Food search error:", error);
        setFoods([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeout = setTimeout(searchFoods, 300);

    return () => clearTimeout(timeout);
  }, [foodName, navigate]);

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setFoodName(food.name);
    setServing("1");

    setCalories(String(food.calories));
    setProtein(String(food.protein));
    setCarbohydrates(String(food.carbohydrates));
    setFat(String(food.fat));

    setShowResults(false);
  };

  const handleServingChange = (value: string) => {
    setServing(value);

    if (!selectedFood || !value) {
      return;
    }

    const servingMultiplier = Number(value);

    if (Number.isNaN(servingMultiplier)) {
      return;
    }

    setCalories(
      String(
        Math.round(selectedFood.calories * servingMultiplier)
      )
    );

    setProtein(
      String(
        Number(
          (selectedFood.protein * servingMultiplier).toFixed(1)
        )
      )
    );

    setCarbohydrates(
      String(
        Number(
          (
            selectedFood.carbohydrates * servingMultiplier
          ).toFixed(1)
        )
      )
    );

    setFat(
      String(
        Number(
          (selectedFood.fat * servingMultiplier).toFixed(1)
        )
      )
    );
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

    if (!selectedFood) {
      setError("Please select a food from the search results.");
      return;
    }

    const servingAmount = Number(serving);

    if (Number.isNaN(servingAmount) || servingAmount <= 0) {
      setError("Serving must be greater than 0.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/meals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            foodId: selectedFood._id,
            mealType,
            serving: servingAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to add meal.");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Add meal error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="add-meal-page">
      <section className="add-meal-card">
        <div className="add-meal-heading">
          <span>MEAL TRACKING</span>

          <h1>Add a meal.</h1>

          <p>
            Log what you ate today to keep your nutrition
            progress on track.
          </p>
        </div>

        <form
          className="add-meal-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="mealType">Meal type</label>

            <select
              id="mealType"
              value={mealType}
              onChange={(event) =>
                setMealType(event.target.value)
              }
              required
            >
              <option value="">Select meal type</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="form-group food-search-group">
            <label htmlFor="foodName">Food</label>

            <input
              id="foodName"
              type="text"
              placeholder="Search Filipino food..."
              value={foodName}
              onChange={(event) => {
                setFoodName(event.target.value);
                setSelectedFood(null);
              }}
              onFocus={() => {
                if (foods.length > 0) {
                  setShowResults(true);
                }
              }}
              autoComplete="off"
              required
            />

            {isSearching && (
              <small className="food-search-status">
                Searching foods...
              </small>
            )}

            {showResults &&
              !isSearching &&
              foods.length > 0 && (
                <div className="food-search-results">
                  {foods.map((food) => (
                    <button
                      type="button"
                      className="food-search-result"
                      key={food._id}
                      onClick={() => handleFoodSelect(food)}
                    >
                      <div>
                        <strong>{food.name}</strong>

                        <span>
                          {food.category} ·{" "}
                          {food.servingSize}{" "}
                          {food.servingUnit}
                        </span>
                      </div>

                      <div className="food-search-nutrition">
                        <strong>
                          {food.calories} kcal
                        </strong>

                        <span>
                          {food.protein}g protein
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            {showResults &&
              !isSearching &&
              foodName.trim() &&
              foods.length === 0 && (
                <small className="food-search-status">
                  No matching food found.
                </small>
              )}
          </div>

          {selectedFood && (
            <div className="selected-food-card">
              <div>
                <span>SELECTED FOOD</span>
                <strong>{selectedFood.name}</strong>
              </div>

              <div>
                <span>PER SERVING</span>
                <strong>
                  {selectedFood.calories} kcal ·{" "}
                  {selectedFood.protein}g protein
                </strong>
              </div>
            </div>
          )}

          <div className="add-meal-grid">
            <div className="form-group">
              <label htmlFor="serving">Serving</label>

              <input
                id="serving"
                type="number"
                min="0.1"
                step="0.1"
                value={serving}
                onChange={(event) =>
                  handleServingChange(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="calories">Calories</label>

              <input
                id="calories"
                type="number"
                min="0"
                value={calories}
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="protein">Protein (g)</label>

              <input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                value={protein}
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="carbohydrates">
                Carbohydrates (g)
              </label>

              <input
                id="carbohydrates"
                type="number"
                min="0"
                step="0.1"
                value={carbohydrates}
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fat">Fat (g)</label>

              <input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                value={fat}
                readOnly
                required
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="add-meal-actions">
            <button
              type="button"
              className="add-meal-cancel"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-meal-submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving meal..." : "Save meal"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AddMeal;