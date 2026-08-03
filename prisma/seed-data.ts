/**
 * Данные для seed. КБЖУ ингредиентов — на 100 г сырого продукта;
 * калорийность блюд считается из ингредиентов при заливке, вручную не задаётся.
 */

export type SeedIngredient = {
  key: string
  name: string
  nameEn: string
  kcalPer100g: number
  proteinPer100g: number
  fatPer100g: number
  carbsPer100g: number
}

export type SeedMeal = {
  name: string
  nameEn: string
  description: string
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  prepTimeMinutes: number
  tags: string[]
  ingredients: { key: string; grams: number }[]
}

export const ingredients: SeedIngredient[] = [
  // Мясо, птица, рыба, яйца
  { key: 'chicken-breast', name: 'Куриная грудка', nameEn: 'Chicken breast', kcalPer100g: 165, proteinPer100g: 31, fatPer100g: 3.6, carbsPer100g: 0 },
  { key: 'chicken-thigh', name: 'Куриное бедро', nameEn: 'Chicken thigh', kcalPer100g: 209, proteinPer100g: 26, fatPer100g: 11, carbsPer100g: 0 },
  { key: 'turkey-fillet', name: 'Индейка, филе', nameEn: 'Turkey fillet', kcalPer100g: 157, proteinPer100g: 29, fatPer100g: 4, carbsPer100g: 0 },
  { key: 'beef-lean', name: 'Говядина нежирная', nameEn: 'Lean beef', kcalPer100g: 187, proteinPer100g: 26, fatPer100g: 9, carbsPer100g: 0 },
  { key: 'pork-lean', name: 'Свинина нежирная', nameEn: 'Lean pork', kcalPer100g: 212, proteinPer100g: 25, fatPer100g: 12, carbsPer100g: 0 },
  { key: 'salmon', name: 'Лосось', nameEn: 'Salmon', kcalPer100g: 208, proteinPer100g: 20, fatPer100g: 13, carbsPer100g: 0 },
  { key: 'cod', name: 'Треска', nameEn: 'Cod', kcalPer100g: 82, proteinPer100g: 18, fatPer100g: 0.7, carbsPer100g: 0 },
  { key: 'pollock', name: 'Минтай', nameEn: 'Pollock', kcalPer100g: 72, proteinPer100g: 16, fatPer100g: 0.9, carbsPer100g: 0 },
  { key: 'tuna-canned', name: 'Тунец в собственном соку', nameEn: 'Canned tuna', kcalPer100g: 96, proteinPer100g: 22, fatPer100g: 0.8, carbsPer100g: 0 },
  { key: 'shrimp', name: 'Креветки', nameEn: 'Shrimp', kcalPer100g: 99, proteinPer100g: 21, fatPer100g: 1.2, carbsPer100g: 0.2 },
  { key: 'egg', name: 'Яйцо куриное', nameEn: 'Egg', kcalPer100g: 143, proteinPer100g: 13, fatPer100g: 10, carbsPer100g: 0.7 },
  { key: 'egg-white', name: 'Яичный белок', nameEn: 'Egg white', kcalPer100g: 52, proteinPer100g: 11, fatPer100g: 0.2, carbsPer100g: 0.7 },

  // Молочное
  { key: 'cottage-cheese-5', name: 'Творог 5%', nameEn: 'Cottage cheese 5%', kcalPer100g: 121, proteinPer100g: 17, fatPer100g: 5, carbsPer100g: 1.8 },
  { key: 'cottage-cheese-0', name: 'Творог обезжиренный', nameEn: 'Cottage cheese, non-fat', kcalPer100g: 71, proteinPer100g: 16, fatPer100g: 0.6, carbsPer100g: 1.3 },
  { key: 'greek-yogurt', name: 'Греческий йогурт 2%', nameEn: 'Greek yogurt 2%', kcalPer100g: 73, proteinPer100g: 9, fatPer100g: 2, carbsPer100g: 4 },
  { key: 'kefir-1', name: 'Кефир 1%', nameEn: 'Kefir 1%', kcalPer100g: 40, proteinPer100g: 3, fatPer100g: 1, carbsPer100g: 4 },
  { key: 'milk-2-5', name: 'Молоко 2.5%', nameEn: 'Milk 2.5%', kcalPer100g: 52, proteinPer100g: 2.8, fatPer100g: 2.5, carbsPer100g: 4.7 },
  { key: 'soy-milk', name: 'Соевое молоко', nameEn: 'Soy milk', kcalPer100g: 54, proteinPer100g: 3.3, fatPer100g: 1.8, carbsPer100g: 6 },
  { key: 'hard-cheese', name: 'Сыр твёрдый', nameEn: 'Hard cheese', kcalPer100g: 364, proteinPer100g: 25, fatPer100g: 29, carbsPer100g: 1.3 },
  { key: 'feta-cheese', name: 'Фета', nameEn: 'Feta', kcalPer100g: 264, proteinPer100g: 14, fatPer100g: 21, carbsPer100g: 4 },
  { key: 'mozzarella', name: 'Моцарелла', nameEn: 'Mozzarella', kcalPer100g: 280, proteinPer100g: 22, fatPer100g: 21, carbsPer100g: 2.2 },
  { key: 'sour-cream-15', name: 'Сметана 15%', nameEn: 'Sour cream 15%', kcalPer100g: 158, proteinPer100g: 2.6, fatPer100g: 15, carbsPer100g: 3 },
  { key: 'butter', name: 'Масло сливочное', nameEn: 'Butter', kcalPer100g: 748, proteinPer100g: 0.5, fatPer100g: 82, carbsPer100g: 0.8 },

  // Крупы, мучное
  { key: 'buckwheat', name: 'Гречка (сухая)', nameEn: 'Buckwheat, dry', kcalPer100g: 343, proteinPer100g: 13, fatPer100g: 3.4, carbsPer100g: 62 },
  { key: 'rice-white', name: 'Рис белый (сухой)', nameEn: 'White rice, dry', kcalPer100g: 344, proteinPer100g: 6.7, fatPer100g: 0.7, carbsPer100g: 78 },
  { key: 'rice-brown', name: 'Рис бурый (сухой)', nameEn: 'Brown rice, dry', kcalPer100g: 337, proteinPer100g: 7.4, fatPer100g: 2.8, carbsPer100g: 72 },
  { key: 'oats', name: 'Овсяные хлопья', nameEn: 'Rolled oats', kcalPer100g: 366, proteinPer100g: 12, fatPer100g: 6.5, carbsPer100g: 62 },
  { key: 'oat-bran', name: 'Овсяные отруби', nameEn: 'Oat bran', kcalPer100g: 246, proteinPer100g: 17, fatPer100g: 7, carbsPer100g: 50 },
  { key: 'quinoa', name: 'Киноа (сухая)', nameEn: 'Quinoa, dry', kcalPer100g: 368, proteinPer100g: 14, fatPer100g: 6, carbsPer100g: 64 },
  { key: 'pearl-barley', name: 'Перловка (сухая)', nameEn: 'Pearl barley, dry', kcalPer100g: 352, proteinPer100g: 9.9, fatPer100g: 1.2, carbsPer100g: 78 },
  { key: 'millet', name: 'Пшено (сухое)', nameEn: 'Millet, dry', kcalPer100g: 348, proteinPer100g: 11, fatPer100g: 3.3, carbsPer100g: 69 },
  { key: 'bulgur', name: 'Булгур (сухой)', nameEn: 'Bulgur, dry', kcalPer100g: 342, proteinPer100g: 12, fatPer100g: 1.3, carbsPer100g: 76 },
  { key: 'pasta-durum', name: 'Паста из твёрдых сортов', nameEn: 'Durum pasta, dry', kcalPer100g: 350, proteinPer100g: 12, fatPer100g: 1.3, carbsPer100g: 71 },
  { key: 'bread-rye', name: 'Хлеб ржаной', nameEn: 'Rye bread', kcalPer100g: 210, proteinPer100g: 6.6, fatPer100g: 1.2, carbsPer100g: 41 },
  { key: 'bread-wholegrain', name: 'Хлеб цельнозерновой', nameEn: 'Wholegrain bread', kcalPer100g: 247, proteinPer100g: 13, fatPer100g: 3.4, carbsPer100g: 41 },
  { key: 'wholegrain-flour', name: 'Мука цельнозерновая', nameEn: 'Wholegrain flour', kcalPer100g: 340, proteinPer100g: 13, fatPer100g: 2.5, carbsPer100g: 62 },

  // Картофель, бобовые, соя
  { key: 'potato', name: 'Картофель', nameEn: 'Potato', kcalPer100g: 77, proteinPer100g: 2, fatPer100g: 0.1, carbsPer100g: 17 },
  { key: 'sweet-potato', name: 'Батат', nameEn: 'Sweet potato', kcalPer100g: 86, proteinPer100g: 1.6, fatPer100g: 0.1, carbsPer100g: 20 },
  { key: 'lentils-dry', name: 'Чечевица (сухая)', nameEn: 'Lentils, dry', kcalPer100g: 352, proteinPer100g: 25, fatPer100g: 1.1, carbsPer100g: 63 },
  { key: 'chickpeas-dry', name: 'Нут (сухой)', nameEn: 'Chickpeas, dry', kcalPer100g: 364, proteinPer100g: 19, fatPer100g: 6, carbsPer100g: 61 },
  { key: 'red-beans-canned', name: 'Фасоль красная консервированная', nameEn: 'Canned red beans', kcalPer100g: 99, proteinPer100g: 7, fatPer100g: 0.5, carbsPer100g: 17 },
  { key: 'green-peas', name: 'Зелёный горошек', nameEn: 'Green peas', kcalPer100g: 81, proteinPer100g: 5, fatPer100g: 0.4, carbsPer100g: 14 },
  { key: 'tofu', name: 'Тофу', nameEn: 'Tofu', kcalPer100g: 76, proteinPer100g: 8, fatPer100g: 4.8, carbsPer100g: 1.9 },

  // Овощи
  { key: 'tomato', name: 'Помидор', nameEn: 'Tomato', kcalPer100g: 18, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 3.9 },
  { key: 'cucumber', name: 'Огурец', nameEn: 'Cucumber', kcalPer100g: 15, proteinPer100g: 0.7, fatPer100g: 0.1, carbsPer100g: 3.6 },
  { key: 'bell-pepper', name: 'Болгарский перец', nameEn: 'Bell pepper', kcalPer100g: 27, proteinPer100g: 1, fatPer100g: 0.3, carbsPer100g: 6 },
  { key: 'broccoli', name: 'Брокколи', nameEn: 'Broccoli', kcalPer100g: 34, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 7 },
  { key: 'cauliflower', name: 'Цветная капуста', nameEn: 'Cauliflower', kcalPer100g: 25, proteinPer100g: 1.9, fatPer100g: 0.3, carbsPer100g: 5 },
  { key: 'zucchini', name: 'Кабачок', nameEn: 'Zucchini', kcalPer100g: 17, proteinPer100g: 1.2, fatPer100g: 0.3, carbsPer100g: 3.1 },
  { key: 'carrot', name: 'Морковь', nameEn: 'Carrot', kcalPer100g: 41, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 10 },
  { key: 'beetroot', name: 'Свёкла', nameEn: 'Beetroot', kcalPer100g: 43, proteinPer100g: 1.6, fatPer100g: 0.2, carbsPer100g: 10 },
  { key: 'cabbage', name: 'Капуста белокочанная', nameEn: 'White cabbage', kcalPer100g: 25, proteinPer100g: 1.3, fatPer100g: 0.1, carbsPer100g: 6 },
  { key: 'onion', name: 'Лук репчатый', nameEn: 'Onion', kcalPer100g: 40, proteinPer100g: 1.1, fatPer100g: 0.1, carbsPer100g: 9 },
  { key: 'garlic', name: 'Чеснок', nameEn: 'Garlic', kcalPer100g: 149, proteinPer100g: 6.4, fatPer100g: 0.5, carbsPer100g: 33 },
  { key: 'spinach', name: 'Шпинат', nameEn: 'Spinach', kcalPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.4, carbsPer100g: 3.6 },
  { key: 'lettuce', name: 'Салат листовой', nameEn: 'Lettuce', kcalPer100g: 15, proteinPer100g: 1.4, fatPer100g: 0.2, carbsPer100g: 2.9 },
  { key: 'green-beans', name: 'Зелёная фасоль', nameEn: 'Green beans', kcalPer100g: 31, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 7 },
  { key: 'mushrooms', name: 'Шампиньоны', nameEn: 'Mushrooms', kcalPer100g: 22, proteinPer100g: 3.1, fatPer100g: 0.3, carbsPer100g: 3.3 },
  { key: 'pumpkin', name: 'Тыква', nameEn: 'Pumpkin', kcalPer100g: 26, proteinPer100g: 1, fatPer100g: 0.1, carbsPer100g: 6.5 },
  { key: 'eggplant', name: 'Баклажан', nameEn: 'Eggplant', kcalPer100g: 25, proteinPer100g: 1, fatPer100g: 0.2, carbsPer100g: 6 },
  { key: 'celery-stalk', name: 'Стебель сельдерея', nameEn: 'Celery stalk', kcalPer100g: 16, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 3 },

  // Фрукты
  { key: 'apple', name: 'Яблоко', nameEn: 'Apple', kcalPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 14 },
  { key: 'banana', name: 'Банан', nameEn: 'Banana', kcalPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 23 },
  { key: 'orange', name: 'Апельсин', nameEn: 'Orange', kcalPer100g: 47, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 12 },
  { key: 'berries-mixed', name: 'Ягоды ассорти', nameEn: 'Mixed berries', kcalPer100g: 50, proteinPer100g: 0.9, fatPer100g: 0.4, carbsPer100g: 11 },
  { key: 'lemon', name: 'Лимон', nameEn: 'Lemon', kcalPer100g: 29, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 9 },
  { key: 'avocado', name: 'Авокадо', nameEn: 'Avocado', kcalPer100g: 160, proteinPer100g: 2, fatPer100g: 15, carbsPer100g: 9 },
  { key: 'dried-apricots', name: 'Курага', nameEn: 'Dried apricots', kcalPer100g: 241, proteinPer100g: 3.4, fatPer100g: 0.5, carbsPer100g: 63 },
  { key: 'raisins', name: 'Изюм', nameEn: 'Raisins', kcalPer100g: 299, proteinPer100g: 3.1, fatPer100g: 0.5, carbsPer100g: 79 },

  // Жиры, орехи, семена
  { key: 'olive-oil', name: 'Оливковое масло', nameEn: 'Olive oil', kcalPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0 },
  { key: 'sunflower-oil', name: 'Подсолнечное масло', nameEn: 'Sunflower oil', kcalPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0 },
  { key: 'walnuts', name: 'Грецкий орех', nameEn: 'Walnuts', kcalPer100g: 654, proteinPer100g: 15, fatPer100g: 65, carbsPer100g: 14 },
  { key: 'almonds', name: 'Миндаль', nameEn: 'Almonds', kcalPer100g: 579, proteinPer100g: 21, fatPer100g: 50, carbsPer100g: 22 },
  { key: 'peanut-butter', name: 'Паста арахисовая', nameEn: 'Peanut butter', kcalPer100g: 588, proteinPer100g: 25, fatPer100g: 50, carbsPer100g: 20 },
  { key: 'sunflower-seeds', name: 'Семечки подсолнечные', nameEn: 'Sunflower seeds', kcalPer100g: 584, proteinPer100g: 21, fatPer100g: 51, carbsPer100g: 20 },
  { key: 'flax-seeds', name: 'Семена льна', nameEn: 'Flax seeds', kcalPer100g: 534, proteinPer100g: 18, fatPer100g: 42, carbsPer100g: 29 },
  { key: 'chia-seeds', name: 'Семена чиа', nameEn: 'Chia seeds', kcalPer100g: 486, proteinPer100g: 17, fatPer100g: 31, carbsPer100g: 42 },

  // Прочее
  { key: 'honey', name: 'Мёд', nameEn: 'Honey', kcalPer100g: 304, proteinPer100g: 0.3, fatPer100g: 0, carbsPer100g: 82 },
  { key: 'dark-chocolate-70', name: 'Шоколад тёмный 70%', nameEn: 'Dark chocolate 70%', kcalPer100g: 598, proteinPer100g: 7.8, fatPer100g: 43, carbsPer100g: 46 },
  { key: 'cocoa-powder', name: 'Какао-порошок', nameEn: 'Cocoa powder', kcalPer100g: 228, proteinPer100g: 20, fatPer100g: 14, carbsPer100g: 58 },
  { key: 'protein-powder-whey', name: 'Протеин сывороточный', nameEn: 'Whey protein', kcalPer100g: 375, proteinPer100g: 75, fatPer100g: 5, carbsPer100g: 8 },
  { key: 'tomato-paste', name: 'Томатная паста', nameEn: 'Tomato paste', kcalPer100g: 82, proteinPer100g: 4.3, fatPer100g: 0.5, carbsPer100g: 19 },
  { key: 'soy-sauce', name: 'Соевый соус', nameEn: 'Soy sauce', kcalPer100g: 53, proteinPer100g: 8, fatPer100g: 0.1, carbsPer100g: 4.9 },
  { key: 'dill', name: 'Укроп', nameEn: 'Dill', kcalPer100g: 43, proteinPer100g: 3.5, fatPer100g: 1.1, carbsPer100g: 7 },
  { key: 'parsley', name: 'Петрушка', nameEn: 'Parsley', kcalPer100g: 36, proteinPer100g: 3, fatPer100g: 0.8, carbsPer100g: 6 },
]

export const meals: SeedMeal[] = [
  // ---------- Завтраки ----------
  { name: 'Овсянка на молоке с бананом', nameEn: 'Oatmeal with milk and banana', description: 'Хлопья варятся на молоке, банан добавляется в конце.', type: 'BREAKFAST', prepTimeMinutes: 12, tags: ['vegetarian', 'nut-free'], ingredients: [{ key: 'oats', grams: 60 }, { key: 'milk-2-5', grams: 200 }, { key: 'banana', grams: 100 }] },
  { name: 'Творог с ягодами и мёдом', nameEn: 'Cottage cheese with berries and honey', description: 'Творог смешивается с ягодами, сверху ложка мёда.', type: 'BREAKFAST', prepTimeMinutes: 5, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'cottage-cheese-5', grams: 180 }, { key: 'berries-mixed', grams: 80 }, { key: 'honey', grams: 12 }] },
  { name: 'Сырники запечённые', nameEn: 'Baked cottage cheese pancakes', description: 'Творог с яйцом и мукой запекается в духовке без масла.', type: 'BREAKFAST', prepTimeMinutes: 30, tags: ['vegetarian', 'nut-free', 'high-protein'], ingredients: [{ key: 'cottage-cheese-5', grams: 200 }, { key: 'egg', grams: 50 }, { key: 'wholegrain-flour', grams: 30 }, { key: 'honey', grams: 10 }] },
  { name: 'Омлет с помидорами и шпинатом', nameEn: 'Omelette with tomato and spinach', description: 'Яйца взбиваются и жарятся с овощами на капле масла.', type: 'BREAKFAST', prepTimeMinutes: 12, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'egg', grams: 150 }, { key: 'tomato', grams: 100 }, { key: 'spinach', grams: 50 }, { key: 'olive-oil', grams: 5 }] },
  { name: 'Гречка с яйцом и зеленью', nameEn: 'Buckwheat with egg and herbs', description: 'Отварная гречка подаётся с яйцом и укропом.', type: 'BREAKFAST', prepTimeMinutes: 20, tags: ['vegetarian', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'buckwheat', grams: 70 }, { key: 'egg', grams: 100 }, { key: 'dill', grams: 10 }] },
  { name: 'Тост с авокадо и яйцом', nameEn: 'Avocado toast with egg', description: 'Цельнозерновой хлеб с пастой из авокадо и яйцом пашот.', type: 'BREAKFAST', prepTimeMinutes: 15, tags: ['vegetarian', 'nut-free'], ingredients: [{ key: 'bread-wholegrain', grams: 60 }, { key: 'avocado', grams: 70 }, { key: 'egg', grams: 50 }, { key: 'lemon', grams: 5 }] },
  { name: 'Овсяноблин с творогом', nameEn: 'Oat pancake with cottage cheese', description: 'Хлопья с яйцом обжариваются блином, внутрь — творог.', type: 'BREAKFAST', prepTimeMinutes: 15, tags: ['vegetarian', 'nut-free', 'high-protein'], ingredients: [{ key: 'oats', grams: 40 }, { key: 'egg', grams: 100 }, { key: 'cottage-cheese-0', grams: 100 }] },
  { name: 'Пшённая каша с тыквой', nameEn: 'Millet porridge with pumpkin', description: 'Пшено разваривается с тыквой на молоке.', type: 'BREAKFAST', prepTimeMinutes: 30, tags: ['vegetarian', 'gluten-free', 'nut-free'], ingredients: [{ key: 'millet', grams: 60 }, { key: 'pumpkin', grams: 150 }, { key: 'milk-2-5', grams: 150 }] },
  { name: 'Греческий йогурт с грецким орехом', nameEn: 'Greek yogurt with walnuts', description: 'Йогурт с орехами и мёдом, без готовки.', type: 'BREAKFAST', prepTimeMinutes: 3, tags: ['vegetarian', 'gluten-free', 'high-protein'], ingredients: [{ key: 'greek-yogurt', grams: 200 }, { key: 'walnuts', grams: 20 }, { key: 'honey', grams: 10 }] },
  { name: 'Каша из киноа с яблоком', nameEn: 'Quinoa porridge with apple', description: 'Киноа варится на соевом молоке с яблоком и корицей.', type: 'BREAKFAST', prepTimeMinutes: 22, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'quinoa', grams: 60 }, { key: 'soy-milk', grams: 180 }, { key: 'apple', grams: 100 }] },
  { name: 'Протеиновые панкейки', nameEn: 'Protein pancakes', description: 'Овсяная мука с протеином и яйцом обжаривается небольшими блинами.', type: 'BREAKFAST', prepTimeMinutes: 18, tags: ['vegetarian', 'nut-free', 'high-protein'], ingredients: [{ key: 'oats', grams: 50 }, { key: 'protein-powder-whey', grams: 25 }, { key: 'egg', grams: 50 }, { key: 'milk-2-5', grams: 100 }] },
  { name: 'Яичница с грибами', nameEn: 'Fried eggs with mushrooms', description: 'Шампиньоны обжариваются, сверху выпускаются яйца.', type: 'BREAKFAST', prepTimeMinutes: 15, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'egg', grams: 150 }, { key: 'mushrooms', grams: 120 }, { key: 'onion', grams: 30 }, { key: 'olive-oil', grams: 6 }] },
  { name: 'Смузи-боул с ягодами и чиа', nameEn: 'Berry chia smoothie bowl', description: 'Банан с ягодами взбивается с йогуртом, сверху чиа.', type: 'BREAKFAST', prepTimeMinutes: 8, tags: ['vegetarian', 'gluten-free', 'nut-free'], ingredients: [{ key: 'banana', grams: 100 }, { key: 'berries-mixed', grams: 100 }, { key: 'greek-yogurt', grams: 120 }, { key: 'chia-seeds', grams: 12 }] },
  { name: 'Скрэмбл из тофу с овощами', nameEn: 'Tofu scramble with vegetables', description: 'Тофу разминается и тушится с перцем и шпинатом.', type: 'BREAKFAST', prepTimeMinutes: 15, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free', 'low-carb'], ingredients: [{ key: 'tofu', grams: 200 }, { key: 'bell-pepper', grams: 80 }, { key: 'spinach', grams: 60 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Овсянка с семенами льна и яблоком', nameEn: 'Oatmeal with flax and apple', description: 'Хлопья заливаются кипятком, добавляются лён и яблоко.', type: 'BREAKFAST', prepTimeMinutes: 10, tags: ['vegetarian', 'vegan', 'lactose-free', 'nut-free'], ingredients: [{ key: 'oats', grams: 60 }, { key: 'flax-seeds', grams: 12 }, { key: 'apple', grams: 120 }] },
  { name: 'Творожная запеканка с изюмом', nameEn: 'Cottage cheese bake with raisins', description: 'Творог с яйцом и изюмом запекается до румяной корочки.', type: 'BREAKFAST', prepTimeMinutes: 40, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'cottage-cheese-5', grams: 200 }, { key: 'egg', grams: 50 }, { key: 'raisins', grams: 25 }] },
  { name: 'Бутерброд с тунцом на ржаном', nameEn: 'Rye sandwich with tuna', description: 'Ржаной хлеб с тунцом, огурцом и зеленью.', type: 'BREAKFAST', prepTimeMinutes: 7, tags: ['lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'bread-rye', grams: 70 }, { key: 'tuna-canned', grams: 100 }, { key: 'cucumber', grams: 60 }, { key: 'parsley', grams: 8 }] },
  { name: 'Кефир с отрубями и ягодами', nameEn: 'Kefir with oat bran and berries', description: 'Отруби заливаются кефиром, добавляются ягоды.', type: 'BREAKFAST', prepTimeMinutes: 5, tags: ['vegetarian', 'nut-free'], ingredients: [{ key: 'kefir-1', grams: 250 }, { key: 'oat-bran', grams: 30 }, { key: 'berries-mixed', grams: 80 }] },

  // ---------- Обеды ----------
  { name: 'Борщ с говядиной', nameEn: 'Borscht with beef', description: 'Свёкла, капуста и картофель варятся на говяжьем бульоне, подаётся со сметаной.', type: 'LUNCH', prepTimeMinutes: 75, tags: ['gluten-free', 'nut-free'], ingredients: [{ key: 'beef-lean', grams: 120 }, { key: 'beetroot', grams: 100 }, { key: 'cabbage', grams: 100 }, { key: 'potato', grams: 100 }, { key: 'carrot', grams: 50 }, { key: 'sour-cream-15', grams: 25 }] },
  { name: 'Щи с курицей', nameEn: 'Cabbage soup with chicken', description: 'Капуста и овощи варятся на курином бульоне.', type: 'LUNCH', prepTimeMinutes: 50, tags: ['gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'chicken-thigh', grams: 120 }, { key: 'cabbage', grams: 150 }, { key: 'potato', grams: 100 }, { key: 'carrot', grams: 50 }, { key: 'onion', grams: 40 }] },
  { name: 'Куриная грудка с гречкой и брокколи', nameEn: 'Chicken breast with buckwheat and broccoli', description: 'Грудка обжаривается на гриле, подаётся с гречкой и брокколи.', type: 'LUNCH', prepTimeMinutes: 30, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'chicken-breast', grams: 160 }, { key: 'buckwheat', grams: 70 }, { key: 'broccoli', grams: 150 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Плов с индейкой', nameEn: 'Turkey pilaf', description: 'Рис тушится с индейкой, морковью и луком.', type: 'LUNCH', prepTimeMinutes: 50, tags: ['gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'turkey-fillet', grams: 150 }, { key: 'rice-white', grams: 80 }, { key: 'carrot', grams: 80 }, { key: 'onion', grams: 40 }, { key: 'sunflower-oil', grams: 8 }] },
  { name: 'Паста с курицей и шпинатом', nameEn: 'Pasta with chicken and spinach', description: 'Паста из твёрдых сортов смешивается с курицей и шпинатом.', type: 'LUNCH', prepTimeMinutes: 25, tags: ['nut-free', 'high-protein'], ingredients: [{ key: 'pasta-durum', grams: 80 }, { key: 'chicken-breast', grams: 150 }, { key: 'spinach', grams: 80 }, { key: 'hard-cheese', grams: 20 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Котлеты из индейки с картофельным пюре', nameEn: 'Turkey cutlets with mashed potato', description: 'Котлеты запекаются, пюре готовится на молоке.', type: 'LUNCH', prepTimeMinutes: 45, tags: ['gluten-free', 'nut-free'], ingredients: [{ key: 'turkey-fillet', grams: 150 }, { key: 'potato', grams: 200 }, { key: 'milk-2-5', grams: 50 }, { key: 'onion', grams: 30 }] },
  { name: 'Голубцы с говядиной и рисом', nameEn: 'Cabbage rolls with beef and rice', description: 'Капустные листья с фаршем и рисом тушатся в томате.', type: 'LUNCH', prepTimeMinutes: 70, tags: ['gluten-free', 'nut-free'], ingredients: [{ key: 'beef-lean', grams: 130 }, { key: 'cabbage', grams: 150 }, { key: 'rice-white', grams: 50 }, { key: 'tomato-paste', grams: 30 }, { key: 'sour-cream-15', grams: 20 }] },
  { name: 'Чечевичный суп с морковью', nameEn: 'Lentil soup with carrot', description: 'Чечевица разваривается с морковью и луком.', type: 'LUNCH', prepTimeMinutes: 40, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'lentils-dry', grams: 80 }, { key: 'carrot', grams: 80 }, { key: 'onion', grams: 40 }, { key: 'celery-stalk', grams: 50 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Перловка с грибами', nameEn: 'Pearl barley with mushrooms', description: 'Перловка тушится с шампиньонами и луком.', type: 'LUNCH', prepTimeMinutes: 55, tags: ['vegetarian', 'vegan', 'lactose-free', 'nut-free'], ingredients: [{ key: 'pearl-barley', grams: 80 }, { key: 'mushrooms', grams: 180 }, { key: 'onion', grams: 50 }, { key: 'sunflower-oil', grams: 10 }] },
  { name: 'Индейка с булгуром и овощами', nameEn: 'Turkey with bulgur and vegetables', description: 'Индейка запекается, булгур подаётся с печёными овощами.', type: 'LUNCH', prepTimeMinutes: 40, tags: ['lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'turkey-fillet', grams: 160 }, { key: 'bulgur', grams: 70 }, { key: 'zucchini', grams: 100 }, { key: 'bell-pepper', grams: 80 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Рагу из курицы с кабачком и баклажаном', nameEn: 'Chicken stew with zucchini and eggplant', description: 'Курица тушится с овощами в томатном соусе.', type: 'LUNCH', prepTimeMinutes: 40, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'chicken-breast', grams: 160 }, { key: 'zucchini', grams: 120 }, { key: 'eggplant', grams: 120 }, { key: 'tomato-paste', grams: 25 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Уха из лосося', nameEn: 'Salmon fish soup', description: 'Лосось варится с картофелем и морковью, в конце — укроп.', type: 'LUNCH', prepTimeMinutes: 40, tags: ['gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'salmon', grams: 140 }, { key: 'potato', grams: 120 }, { key: 'carrot', grams: 50 }, { key: 'onion', grams: 30 }, { key: 'dill', grams: 10 }] },
  { name: 'Нут с тушёными овощами', nameEn: 'Chickpeas with stewed vegetables', description: 'Отварной нут тушится с перцем и помидорами.', type: 'LUNCH', prepTimeMinutes: 45, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'chickpeas-dry', grams: 80 }, { key: 'tomato', grams: 120 }, { key: 'bell-pepper', grams: 80 }, { key: 'onion', grams: 40 }, { key: 'olive-oil', grams: 10 }] },
  { name: 'Говядина с бурым рисом и фасолью', nameEn: 'Beef with brown rice and green beans', description: 'Говядина тушится, подаётся с бурым рисом и зелёной фасолью.', type: 'LUNCH', prepTimeMinutes: 55, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'beef-lean', grams: 150 }, { key: 'rice-brown', grams: 70 }, { key: 'green-beans', grams: 120 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Треска с картофелем и зелёным горошком', nameEn: 'Cod with potato and green peas', description: 'Треска запекается, подаётся с картофелем и горошком.', type: 'LUNCH', prepTimeMinutes: 35, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'cod', grams: 180 }, { key: 'potato', grams: 150 }, { key: 'green-peas', grams: 80 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Тёплый салат с киноа и креветками', nameEn: 'Warm quinoa and shrimp salad', description: 'Киноа смешивается с креветками, огурцом и салатом.', type: 'LUNCH', prepTimeMinutes: 25, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'quinoa', grams: 60 }, { key: 'shrimp', grams: 150 }, { key: 'cucumber', grams: 70 }, { key: 'lettuce', grams: 40 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Свинина с тушёной капустой', nameEn: 'Pork with braised cabbage', description: 'Нежирная свинина тушится с капустой и морковью.', type: 'LUNCH', prepTimeMinutes: 50, tags: ['gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'pork-lean', grams: 140 }, { key: 'cabbage', grams: 200 }, { key: 'carrot', grams: 60 }, { key: 'sunflower-oil', grams: 8 }] },
  { name: 'Фрикадельки из индейки в томате', nameEn: 'Turkey meatballs in tomato sauce', description: 'Фрикадельки тушатся в томатном соусе, подаются с бурым рисом.', type: 'LUNCH', prepTimeMinutes: 45, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'turkey-fillet', grams: 150 }, { key: 'rice-brown', grams: 65 }, { key: 'tomato-paste', grams: 30 }, { key: 'onion', grams: 35 }] },
  { name: 'Курица с бататом и брокколи', nameEn: 'Chicken with sweet potato and broccoli', description: 'Грудка и батат запекаются вместе, брокколи готовится на пару.', type: 'LUNCH', prepTimeMinutes: 40, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'chicken-breast', grams: 160 }, { key: 'sweet-potato', grams: 180 }, { key: 'broccoli', grams: 120 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Окрошка на кефире с яйцом', nameEn: 'Cold kefir soup with egg', description: 'Огурец, яйцо и зелень заливаются холодным кефиром.', type: 'LUNCH', prepTimeMinutes: 15, tags: ['vegetarian', 'gluten-free', 'nut-free'], ingredients: [{ key: 'kefir-1', grams: 300 }, { key: 'cucumber', grams: 120 }, { key: 'egg', grams: 100 }, { key: 'potato', grams: 80 }, { key: 'dill', grams: 12 }] },

  // ---------- Ужины ----------
  { name: 'Лосось запечённый с брокколи', nameEn: 'Baked salmon with broccoli', description: 'Лосось запекается с лимоном, брокколи — на пару.', type: 'DINNER', prepTimeMinutes: 30, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'salmon', grams: 170 }, { key: 'broccoli', grams: 200 }, { key: 'lemon', grams: 15 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Куриная грудка на гриле с салатом', nameEn: 'Grilled chicken breast with salad', description: 'Грудка на гриле подаётся с листовым салатом и помидорами.', type: 'DINNER', prepTimeMinutes: 25, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'chicken-breast', grams: 170 }, { key: 'lettuce', grams: 60 }, { key: 'tomato', grams: 120 }, { key: 'cucumber', grams: 80 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Минтай, запечённый с овощами', nameEn: 'Baked pollock with vegetables', description: 'Минтай запекается под слоем кабачка и перца.', type: 'DINNER', prepTimeMinutes: 35, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'pollock', grams: 200 }, { key: 'zucchini', grams: 130 }, { key: 'bell-pepper', grams: 80 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Творожная запеканка без сахара', nameEn: 'Sugar-free cottage cheese bake', description: 'Творог с яйцом запекается, сладость даёт яблоко.', type: 'DINNER', prepTimeMinutes: 40, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'cottage-cheese-0', grams: 220 }, { key: 'egg', grams: 50 }, { key: 'apple', grams: 100 }] },
  { name: 'Индейка с тушёной капустой', nameEn: 'Turkey with braised cabbage', description: 'Индейка тушится с капустой до мягкости.', type: 'DINNER', prepTimeMinutes: 40, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'turkey-fillet', grams: 170 }, { key: 'cabbage', grams: 200 }, { key: 'carrot', grams: 50 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Омлет с сыром и зеленью', nameEn: 'Omelette with cheese and herbs', description: 'Яйца запекаются с сыром и петрушкой.', type: 'DINNER', prepTimeMinutes: 15, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'egg', grams: 150 }, { key: 'hard-cheese', grams: 30 }, { key: 'parsley', grams: 10 }, { key: 'butter', grams: 5 }] },
  { name: 'Салат с тунцом и яйцом', nameEn: 'Tuna and egg salad', description: 'Тунец смешивается с яйцом, салатом и огурцом.', type: 'DINNER', prepTimeMinutes: 12, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'tuna-canned', grams: 150 }, { key: 'egg', grams: 100 }, { key: 'lettuce', grams: 60 }, { key: 'cucumber', grams: 80 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Тофу, обжаренный с брокколи', nameEn: 'Pan-fried tofu with broccoli', description: 'Тофу обжаривается с брокколи и чесноком.', type: 'DINNER', prepTimeMinutes: 20, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free', 'low-carb'], ingredients: [{ key: 'tofu', grams: 220 }, { key: 'broccoli', grams: 180 }, { key: 'garlic', grams: 8 }, { key: 'olive-oil', grams: 10 }] },
  { name: 'Курица с цветной капустой в сметане', nameEn: 'Chicken with cauliflower in sour cream', description: 'Грудка тушится с цветной капустой в сметанном соусе.', type: 'DINNER', prepTimeMinutes: 35, tags: ['gluten-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'chicken-breast', grams: 160 }, { key: 'cauliflower', grams: 200 }, { key: 'sour-cream-15', grams: 30 }] },
  { name: 'Винегрет', nameEn: 'Vinegret salad', description: 'Отварные овощи нарезаются кубиком и заправляются маслом.', type: 'DINNER', prepTimeMinutes: 45, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'beetroot', grams: 120 }, { key: 'potato', grams: 90 }, { key: 'carrot', grams: 60 }, { key: 'green-peas', grams: 50 }, { key: 'sunflower-oil', grams: 10 }] },
  { name: 'Греческий салат с фетой', nameEn: 'Greek salad with feta', description: 'Овощи крупно нарезаются, сверху фета и оливковое масло.', type: 'DINNER', prepTimeMinutes: 12, tags: ['vegetarian', 'gluten-free', 'nut-free', 'low-carb'], ingredients: [{ key: 'feta-cheese', grams: 60 }, { key: 'tomato', grams: 130 }, { key: 'cucumber', grams: 100 }, { key: 'bell-pepper', grams: 60 }, { key: 'olive-oil', grams: 10 }] },
  { name: 'Креветки с овощами вок', nameEn: 'Wok shrimp with vegetables', description: 'Креветки быстро обжариваются с брокколи и перцем.', type: 'DINNER', prepTimeMinutes: 18, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'shrimp', grams: 180 }, { key: 'broccoli', grams: 120 }, { key: 'bell-pepper', grams: 80 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Куриная грудка с тыквой', nameEn: 'Chicken breast with pumpkin', description: 'Грудка и тыква запекаются на одном противне.', type: 'DINNER', prepTimeMinutes: 35, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'chicken-breast', grams: 160 }, { key: 'pumpkin', grams: 220 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Фасоль тушёная с овощами', nameEn: 'Stewed beans with vegetables', description: 'Красная фасоль тушится с помидорами и луком.', type: 'DINNER', prepTimeMinutes: 25, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'red-beans-canned', grams: 220 }, { key: 'tomato', grams: 120 }, { key: 'onion', grams: 40 }, { key: 'olive-oil', grams: 9 }] },
  { name: 'Салат с курицей и авокадо', nameEn: 'Chicken avocado salad', description: 'Курица смешивается с авокадо, салатом и огурцом.', type: 'DINNER', prepTimeMinutes: 15, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'chicken-breast', grams: 140 }, { key: 'avocado', grams: 70 }, { key: 'lettuce', grams: 60 }, { key: 'cucumber', grams: 70 }, { key: 'lemon', grams: 8 }] },
  { name: 'Кабачковые оладьи с творогом', nameEn: 'Zucchini fritters with cottage cheese', description: 'Кабачок с яйцом обжаривается оладьями, подаётся с творогом.', type: 'DINNER', prepTimeMinutes: 25, tags: ['vegetarian', 'nut-free'], ingredients: [{ key: 'zucchini', grams: 220 }, { key: 'egg', grams: 50 }, { key: 'wholegrain-flour', grams: 25 }, { key: 'cottage-cheese-0', grams: 80 }] },
  { name: 'Говядина, тушёная с баклажанами', nameEn: 'Beef stewed with eggplant', description: 'Говядина тушится с баклажаном и помидорами.', type: 'DINNER', prepTimeMinutes: 55, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'beef-lean', grams: 150 }, { key: 'eggplant', grams: 160 }, { key: 'tomato', grams: 90 }, { key: 'olive-oil', grams: 8 }] },
  { name: 'Треска на пару с зелёной фасолью', nameEn: 'Steamed cod with green beans', description: 'Треска готовится на пару, фасоль — отдельно.', type: 'DINNER', prepTimeMinutes: 25, tags: ['gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'cod', grams: 200 }, { key: 'green-beans', grams: 180 }, { key: 'olive-oil', grams: 7 }, { key: 'lemon', grams: 10 }] },

  // ---------- Перекусы ----------
  { name: 'Яблоко с миндалём', nameEn: 'Apple with almonds', description: 'Яблоко и горсть миндаля.', type: 'SNACK', prepTimeMinutes: 2, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free'], ingredients: [{ key: 'apple', grams: 150 }, { key: 'almonds', grams: 20 }] },
  { name: 'Творог с укропом', nameEn: 'Cottage cheese with dill', description: 'Творог смешивается с укропом и щепоткой соли.', type: 'SNACK', prepTimeMinutes: 3, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'cottage-cheese-0', grams: 180 }, { key: 'dill', grams: 10 }] },
  { name: 'Греческий йогурт с ягодами', nameEn: 'Greek yogurt with berries', description: 'Йогурт с горстью ягод.', type: 'SNACK', prepTimeMinutes: 2, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'greek-yogurt', grams: 180 }, { key: 'berries-mixed', grams: 80 }] },
  { name: 'Орехи с курагой', nameEn: 'Walnuts with dried apricots', description: 'Грецкий орех и курага без добавок.', type: 'SNACK', prepTimeMinutes: 1, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free'], ingredients: [{ key: 'walnuts', grams: 20 }, { key: 'dried-apricots', grams: 40 }] },
  { name: 'Хумус с овощными палочками', nameEn: 'Hummus with vegetable sticks', description: 'Нут взбивается в пасту, подаётся с морковью и сельдереем.', type: 'SNACK', prepTimeMinutes: 15, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'chickpeas-dry', grams: 45 }, { key: 'olive-oil', grams: 8 }, { key: 'carrot', grams: 80 }, { key: 'celery-stalk', grams: 60 }, { key: 'lemon', grams: 10 }] },
  { name: 'Варёные яйца с огурцом', nameEn: 'Boiled eggs with cucumber', description: 'Два яйца вкрутую и свежий огурец.', type: 'SNACK', prepTimeMinutes: 12, tags: ['vegetarian', 'gluten-free', 'lactose-free', 'nut-free', 'high-protein', 'low-carb'], ingredients: [{ key: 'egg', grams: 110 }, { key: 'cucumber', grams: 100 }] },
  { name: 'Ржаной хлеб с творожным сыром', nameEn: 'Rye bread with cottage cheese', description: 'Ломтик ржаного хлеба с творогом и зеленью.', type: 'SNACK', prepTimeMinutes: 5, tags: ['vegetarian', 'nut-free', 'high-protein'], ingredients: [{ key: 'bread-rye', grams: 50 }, { key: 'cottage-cheese-0', grams: 90 }, { key: 'dill', grams: 8 }] },
  { name: 'Семечки с яблоком', nameEn: 'Sunflower seeds with apple', description: 'Яблоко и небольшая горсть семечек.', type: 'SNACK', prepTimeMinutes: 2, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'apple', grams: 150 }, { key: 'sunflower-seeds', grams: 18 }] },
  { name: 'Апельсин с миндалём', nameEn: 'Orange with almonds', description: 'Апельсин и миндаль.', type: 'SNACK', prepTimeMinutes: 3, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free'], ingredients: [{ key: 'orange', grams: 180 }, { key: 'almonds', grams: 18 }] },
  { name: 'Смузи банан-шпинат', nameEn: 'Banana spinach smoothie', description: 'Банан взбивается со шпинатом и соевым молоком.', type: 'SNACK', prepTimeMinutes: 6, tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'nut-free'], ingredients: [{ key: 'banana', grams: 110 }, { key: 'spinach', grams: 50 }, { key: 'soy-milk', grams: 200 }] },
  { name: 'Творожный крем с какао', nameEn: 'Cocoa cottage cheese cream', description: 'Творог взбивается с какао и мёдом.', type: 'SNACK', prepTimeMinutes: 5, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'cottage-cheese-0', grams: 170 }, { key: 'cocoa-powder', grams: 10 }, { key: 'honey', grams: 12 }] },
  { name: 'Тост с арахисовой пастой и бананом', nameEn: 'Peanut butter banana toast', description: 'Цельнозерновой тост с арахисовой пастой и бананом.', type: 'SNACK', prepTimeMinutes: 5, tags: ['vegetarian', 'vegan', 'lactose-free'], ingredients: [{ key: 'bread-wholegrain', grams: 45 }, { key: 'peanut-butter', grams: 18 }, { key: 'banana', grams: 80 }] },
  { name: 'Тёмный шоколад с грецким орехом', nameEn: 'Dark chocolate with walnuts', description: 'Пара кубиков тёмного шоколада и орехи.', type: 'SNACK', prepTimeMinutes: 1, tags: ['vegetarian', 'gluten-free'], ingredients: [{ key: 'dark-chocolate-70', grams: 20 }, { key: 'walnuts', grams: 15 }] },
  { name: 'Овсяное печенье из двух ингредиентов', nameEn: 'Two-ingredient oat cookies', description: 'Банан смешивается с хлопьями и запекается печеньем.', type: 'SNACK', prepTimeMinutes: 25, tags: ['vegetarian', 'vegan', 'lactose-free', 'nut-free'], ingredients: [{ key: 'oats', grams: 50 }, { key: 'banana', grams: 120 }, { key: 'raisins', grams: 15 }] },
  { name: 'Протеиновый коктейль на молоке', nameEn: 'Protein shake with milk', description: 'Протеин взбивается с молоком.', type: 'SNACK', prepTimeMinutes: 2, tags: ['vegetarian', 'gluten-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'protein-powder-whey', grams: 30 }, { key: 'milk-2-5', grams: 250 }] },
  { name: 'Кефир с семенами чиа', nameEn: 'Kefir with chia seeds', description: 'Чиа настаивается в кефире 15 минут.', type: 'SNACK', prepTimeMinutes: 16, tags: ['vegetarian', 'gluten-free', 'nut-free'], ingredients: [{ key: 'kefir-1', grams: 250 }, { key: 'chia-seeds', grams: 15 }] },
  { name: 'Помидоры с моцареллой', nameEn: 'Tomato mozzarella plate', description: 'Помидоры с моцареллой и оливковым маслом.', type: 'SNACK', prepTimeMinutes: 6, tags: ['vegetarian', 'gluten-free', 'nut-free', 'low-carb'], ingredients: [{ key: 'tomato', grams: 130 }, { key: 'mozzarella', grams: 60 }, { key: 'olive-oil', grams: 7 }] },
  { name: 'Зелёный горошек с яйцом', nameEn: 'Green peas with egg', description: 'Горошек смешивается с рубленым яйцом и укропом.', type: 'SNACK', prepTimeMinutes: 10, tags: ['vegetarian', 'gluten-free', 'lactose-free', 'nut-free', 'high-protein'], ingredients: [{ key: 'green-peas', grams: 120 }, { key: 'egg', grams: 55 }, { key: 'dill', grams: 8 }] },
]

