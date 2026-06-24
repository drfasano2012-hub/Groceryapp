-- Nutrition Autopilot Database Schema

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  height_cm INTEGER NOT NULL,
  weight_kg NUMERIC(5,1) NOT NULL,
  goal_weight_kg NUMERIC(5,1) NOT NULL,
  goal TEXT NOT NULL CHECK (goal IN ('lose_fat', 'build_muscle', 'maintain')),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  dietary_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  foods_to_avoid TEXT[] DEFAULT '{}',
  budget_level TEXT NOT NULL DEFAULT 'moderate' CHECK (budget_level IN ('budget', 'moderate', 'premium')),
  wake_time TEXT NOT NULL DEFAULT '07:00',
  bed_time TEXT NOT NULL DEFAULT '22:00',
  meals_per_day INTEGER NOT NULL DEFAULT 4,
  workout_time TEXT,
  daily_calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plans
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  calories INTEGER NOT NULL,
  protein_g NUMERIC(5,1) NOT NULL,
  carbs_g NUMERIC(5,1) NOT NULL,
  fat_g NUMERIC(5,1) NOT NULL,
  scheduled_time TEXT NOT NULL,
  alternatives JSONB DEFAULT '[]',
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_profile_id ON meals(profile_id);
CREATE INDEX IF NOT EXISTS idx_meals_week ON meals(profile_id, week_start_date, day_of_week);

-- Daily meal logs
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_id UUID REFERENCES meals(id),
  meal_name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL,
  protein_g NUMERIC(5,1) NOT NULL,
  carbs_g NUMERIC(5,1) NOT NULL,
  fat_g NUMERIC(5,1) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_profile_date ON daily_logs(profile_id, date);

-- Grocery items
CREATE TABLE IF NOT EXISTS grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('produce', 'protein', 'dairy', 'frozen', 'pantry')),
  quantity TEXT,
  checked BOOLEAN DEFAULT FALSE,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grocery_items_profile_week ON grocery_items(profile_id, week_start_date);

-- Coach chat history
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_messages_profile ON coach_messages(profile_id, created_at DESC);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  meal_reminders BOOLEAN DEFAULT TRUE,
  protein_reminders BOOLEAN DEFAULT TRUE,
  on_track_messages BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data: Meal templates for different goals
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal TEXT NOT NULL CHECK (goal IN ('lose_fat', 'build_muscle', 'maintain', 'all')),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  calories INTEGER NOT NULL,
  protein_g NUMERIC(5,1) NOT NULL,
  carbs_g NUMERIC(5,1) NOT NULL,
  fat_g NUMERIC(5,1) NOT NULL,
  dietary_tags TEXT[] DEFAULT '{}',
  budget_level TEXT DEFAULT 'moderate'
);

-- Seed meal templates
INSERT INTO meal_templates (goal, meal_type, name, ingredients, calories, protein_g, carbs_g, fat_g, dietary_tags, budget_level) VALUES

-- BREAKFASTS - Lose Fat
('lose_fat', 'breakfast', 'Greek Yogurt Power Bowl', ARRAY['1 cup nonfat Greek yogurt', '1/2 cup blueberries', '1 tbsp honey', '2 tbsp granola', '1 tbsp chia seeds'], 320, 28, 38, 6, ARRAY['vegetarian', 'gluten-free'], 'budget'),
('lose_fat', 'breakfast', 'Veggie Egg White Scramble', ARRAY['4 egg whites', '1 whole egg', '1 cup spinach', '1/2 cup bell peppers', '1/4 cup onion', '1 slice whole wheat toast'], 280, 30, 22, 7, ARRAY['low-carb'], 'budget'),
('lose_fat', 'breakfast', 'Protein Overnight Oats', ARRAY['1/2 cup rolled oats', '1 scoop protein powder', '1/2 cup almond milk', '1/2 banana', '1 tbsp almond butter'], 390, 32, 45, 10, ARRAY['vegetarian'], 'budget'),

-- BREAKFASTS - Build Muscle
('build_muscle', 'breakfast', 'Power Breakfast Scramble', ARRAY['4 whole eggs', '4 oz ground turkey', '1 cup sweet potato hash', '1/2 avocado', '2 slices whole wheat toast'], 680, 52, 55, 22, ARRAY['high-protein'], 'moderate'),
('build_muscle', 'breakfast', 'Muscle Oatmeal', ARRAY['1.5 cup rolled oats', '2 scoops protein powder', '1 banana', '2 tbsp peanut butter', '1 cup whole milk'], 750, 55, 85, 18, ARRAY['vegetarian', 'high-protein'], 'budget'),
('build_muscle', 'breakfast', 'Steak & Eggs', ARRAY['6 oz sirloin steak', '3 whole eggs', '1 cup roasted potatoes', '1 tbsp butter', 'Salt and pepper'], 720, 62, 40, 30, ARRAY['high-protein', 'gluten-free'], 'premium'),

-- BREAKFASTS - Maintain
('maintain', 'breakfast', 'Avocado Toast with Eggs', ARRAY['2 slices sourdough bread', '1/2 avocado', '2 eggs', 'Red pepper flakes', 'Everything bagel seasoning'], 450, 20, 42, 22, ARRAY['vegetarian'], 'moderate'),
('maintain', 'breakfast', 'Smoothie Bowl', ARRAY['1 cup frozen açaí', '1/2 cup frozen berries', '1/2 banana', '1/4 cup granola', '1 tbsp coconut flakes', '1 tbsp hemp seeds'], 420, 12, 65, 14, ARRAY['vegan', 'gluten-free'], 'moderate'),

-- LUNCHES - Lose Fat
('lose_fat', 'lunch', 'Turkey Lettuce Wrap', ARRAY['4 oz sliced turkey breast', '2 large romaine leaves', '1/4 cup cucumber', '2 tbsp hummus', 'Dijon mustard'], 280, 32, 18, 8, ARRAY['low-carb', 'dairy-free'], 'budget'),
('lose_fat', 'lunch', 'Tuna Salad Bowl', ARRAY['5 oz canned tuna', '2 cups mixed greens', '1/2 cup cherry tomatoes', '1/4 avocado', '2 tbsp olive oil', 'Lemon juice'], 350, 38, 12, 16, ARRAY['low-carb', 'gluten-free', 'dairy-free'], 'budget'),
('lose_fat', 'lunch', 'Chicken Caesar Salad', ARRAY['5 oz grilled chicken breast', '2 cups romaine', '2 tbsp light Caesar dressing', '2 tbsp parmesan', '4 whole grain croutons'], 380, 42, 15, 14, ARRAY['low-carb'], 'moderate'),
('lose_fat', 'lunch', 'Turkey Wrap', ARRAY['8 oz turkey breast', '1 whole wheat wrap', '1 cup mixed greens', '2 tbsp hummus', '1/2 tomato', '1/4 avocado'], 420, 40, 32, 12, ARRAY['dairy-free'], 'budget'),

-- LUNCHES - Build Muscle
('build_muscle', 'lunch', 'Chicken Rice Bowl', ARRAY['8 oz grilled chicken breast', '1.5 cup white rice', '1 cup broccoli', '2 tbsp soy sauce', '1 tbsp sesame oil', '1 tbsp sesame seeds'], 650, 60, 68, 14, ARRAY['dairy-free', 'high-protein'], 'budget'),
('build_muscle', 'lunch', 'Steak Salad', ARRAY['8 oz flank steak', '3 cups arugula', '1/2 cup cherry tomatoes', '1/4 cup feta cheese', '3 tbsp balsamic vinaigrette'], 580, 55, 18, 28, ARRAY['gluten-free', 'high-protein'], 'premium'),
('build_muscle', 'lunch', 'Chipotle Burrito Bowl', ARRAY['8 oz chicken', '1 cup white rice', '1 cup black beans', '2 tbsp cheese', '1/4 cup guacamole', '2 tbsp salsa', '1/4 cup sour cream'], 720, 58, 72, 22, ARRAY['gluten-free', 'high-protein'], 'moderate'),
('build_muscle', 'lunch', 'Salmon Brown Rice Bowl', ARRAY['7 oz salmon fillet', '1.5 cup brown rice', '1 cup edamame', 'Teriyaki sauce', '1 tsp sesame seeds', 'Green onions'], 680, 55, 65, 18, ARRAY['dairy-free', 'high-protein'], 'premium'),

-- LUNCHES - Maintain
('maintain', 'lunch', 'Mediterranean Bowl', ARRAY['1/2 cup chickpeas', '1/2 cup quinoa', '1/4 cup cucumber', '1/4 cup tomatoes', '2 tbsp feta', '2 tbsp tzatziki', 'Kalamata olives'], 480, 22, 58, 16, ARRAY['vegetarian', 'gluten-free'], 'moderate'),
('maintain', 'lunch', 'BLT Sandwich', ARRAY['3 slices turkey bacon', '2 slices whole wheat bread', '1/4 avocado', 'Tomato', 'Lettuce', '1 tbsp mayo'], 450, 24, 38, 20, ARRAY['dairy-free'], 'budget'),

-- DINNERS - Lose Fat
('lose_fat', 'dinner', 'Baked Salmon with Asparagus', ARRAY['6 oz salmon fillet', '1 bunch asparagus', '1 cup cauliflower rice', '1 tbsp olive oil', 'Garlic', 'Lemon'], 420, 42, 18, 18, ARRAY['low-carb', 'gluten-free', 'dairy-free'], 'premium'),
('lose_fat', 'dinner', 'Grilled Chicken & Veggies', ARRAY['6 oz chicken breast', '1 cup zucchini', '1 cup bell peppers', '1/2 cup onion', '1 tbsp olive oil', 'Italian herbs'], 360, 42, 20, 10, ARRAY['low-carb', 'gluten-free', 'dairy-free'], 'budget'),
('lose_fat', 'dinner', 'Turkey Meatballs with Zucchini Noodles', ARRAY['5 oz ground turkey meatballs', '2 cups zucchini noodles', '1/2 cup marinara sauce', '2 tbsp parmesan'], 380, 38, 22, 12, ARRAY['low-carb'], 'budget'),
('lose_fat', 'dinner', 'Shrimp Stir Fry', ARRAY['6 oz shrimp', '2 cups mixed vegetables', '1/2 cup cauliflower rice', '2 tbsp low-sodium soy sauce', '1 tsp sesame oil', '2 cloves garlic'], 320, 36, 20, 8, ARRAY['low-carb', 'gluten-free', 'dairy-free'], 'moderate'),

-- DINNERS - Build Muscle
('build_muscle', 'dinner', 'Beef Stir Fry with Rice', ARRAY['8 oz lean beef', '1.5 cup white rice', '2 cups broccoli and snap peas', '3 tbsp teriyaki sauce', '1 tsp sesame oil'], 720, 58, 78, 16, ARRAY['dairy-free', 'high-protein'], 'moderate'),
('build_muscle', 'dinner', 'Grilled Chicken Pasta', ARRAY['7 oz chicken breast', '2 cup whole wheat pasta', '1/2 cup marinara', '2 tbsp parmesan', '1 cup spinach', '1 tbsp olive oil'], 780, 62, 88, 16, ARRAY['high-protein'], 'budget'),
('build_muscle', 'dinner', 'Salmon with Sweet Potato', ARRAY['7 oz salmon', '1 large sweet potato', '1 cup brussels sprouts', '1 tbsp olive oil', 'Garlic', 'Herbs'], 680, 52, 65, 22, ARRAY['gluten-free', 'dairy-free', 'high-protein'], 'premium'),
('build_muscle', 'dinner', 'Turkey Chili', ARRAY['6 oz ground turkey', '1 cup kidney beans', '1 cup diced tomatoes', '1/2 cup corn', '1/4 cup onion', 'Chili spices', '1 cup white rice'], 650, 55, 72, 14, ARRAY['dairy-free', 'high-protein'], 'budget'),

-- DINNERS - Maintain
('maintain', 'dinner', 'Sheet Pan Lemon Chicken', ARRAY['6 oz chicken thigh', '1 cup roasted potatoes', '1 cup green beans', '2 tbsp olive oil', 'Lemon', 'Rosemary', 'Garlic'], 550, 42, 45, 22, ARRAY['gluten-free', 'dairy-free'], 'moderate'),
('maintain', 'dinner', 'Shrimp Tacos', ARRAY['6 oz shrimp', '2 corn tortillas', '1/4 cup cabbage slaw', '2 tbsp avocado crema', '1/4 cup pico de gallo', 'Lime'], 480, 36, 48, 16, ARRAY['gluten-free', 'dairy-free'], 'moderate'),

-- SNACKS - Lose Fat
('lose_fat', 'snack', 'Protein Shake', ARRAY['1 scoop whey protein', '1 cup almond milk', '1/2 cup ice'], 160, 25, 8, 3, ARRAY['low-carb', 'gluten-free'], 'budget'),
('lose_fat', 'snack', 'Celery with Almond Butter', ARRAY['4 stalks celery', '2 tbsp almond butter'], 200, 7, 10, 16, ARRAY['vegan', 'gluten-free', 'low-carb'], 'budget'),
('lose_fat', 'snack', 'Hard Boiled Eggs', ARRAY['2 hard boiled eggs', 'Salt and pepper', 'Hot sauce'], 140, 12, 1, 10, ARRAY['low-carb', 'gluten-free', 'dairy-free'], 'budget'),
('lose_fat', 'snack', 'Cottage Cheese & Berries', ARRAY['3/4 cup low-fat cottage cheese', '1/2 cup strawberries'], 180, 22, 14, 3, ARRAY['vegetarian', 'gluten-free', 'low-carb'], 'budget'),

-- SNACKS - Build Muscle
('build_muscle', 'snack', 'Mass Gainer Shake', ARRAY['2 scoops protein powder', '1 cup whole milk', '1 banana', '2 tbsp peanut butter', '1/4 cup oats'], 620, 48, 72, 16, ARRAY['vegetarian', 'high-protein'], 'moderate'),
('build_muscle', 'snack', 'Greek Yogurt Parfait', ARRAY['1.5 cup full-fat Greek yogurt', '1/4 cup granola', '1/2 cup mixed berries', '1 tbsp honey'], 380, 28, 48, 10, ARRAY['vegetarian', 'high-protein'], 'moderate'),
('build_muscle', 'snack', 'Peanut Butter Rice Cakes', ARRAY['3 rice cakes', '3 tbsp peanut butter', '1 banana'], 380, 14, 52, 14, ARRAY['vegan', 'gluten-free'], 'budget'),

-- SNACKS - Maintain
('maintain', 'snack', 'Apple with Peanut Butter', ARRAY['1 medium apple', '2 tbsp natural peanut butter'], 250, 7, 30, 14, ARRAY['vegan', 'gluten-free'], 'budget'),
('maintain', 'snack', 'Trail Mix', ARRAY['1/4 cup almonds', '2 tbsp dried cranberries', '2 tbsp dark chocolate chips', '2 tbsp pumpkin seeds'], 280, 8, 26, 18, ARRAY['vegan', 'gluten-free'], 'budget'),
('maintain', 'snack', 'Hummus & Veggies', ARRAY['4 tbsp hummus', '1 cup carrot sticks', '1 cup cucumber slices', '1/2 cup bell pepper strips'], 200, 7, 28, 8, ARRAY['vegan', 'gluten-free'], 'budget');
