function calculateCalories(profile) {
  const {
    age,
    sex,
    height,
    weight,
    activityLevel,
    goal,
  } = profile;

  // Mifflin-St Jeor equation
  let bmr;

  if (sex === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const activityMultiplier =
    activityMultipliers[activityLevel] || 1.2;

  const tdee = bmr * activityMultiplier;

  let calorieTarget = tdee;

  if (goal === "lose") {
    calorieTarget = tdee - 500;
  } else if (goal === "gain") {
    calorieTarget = tdee + 300;
  }

  // Daily protein target
  let proteinPerKg = 1.6;

  if (goal === "lose") {
    proteinPerKg = 1.8;
  } else if (goal === "gain") {
    proteinPerKg = 1.7;
  }

  const proteinTarget = Math.round(weight * proteinPerKg);

  // Daily water target
  const waterTarget = Number((weight * 0.035).toFixed(1));

  // Keep calorie target within a reasonable range.
  calorieTarget = Math.max(1200, Math.round(calorieTarget));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    proteinTarget,
    waterTarget,
  };
}

module.exports = calculateCalories;