import { AppDataSource } from "../data-source";
import { Venue, VenueType } from "../entities/venue.entity";
import { Category } from "../entities/category.entity";
import { Sku } from "../entities/sku.entity";
import { Transaction } from "../entities/transaction.entity";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zа-яё0-9-]/g, "");
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

const CITIES = [
  { name: "Москва", lat: 55.7558, lng: 37.6173 },
  { name: "Санкт-Петербург", lat: 59.9343, lng: 30.3351 },
  { name: "Челябинск", lat: 55.1644, lng: 61.4368 },
  { name: "Казань", lat: 55.7961, lng: 49.1064 },
  { name: "Екатеринбург", lat: 56.8389, lng: 60.6057 },
];

const RESTAURANT_NAMES = [
  "Волна",
  "Парус",
  "Маяк",
  "Горизонт",
  "Заря",
  "Восток",
  "Бриз",
  "Шторм",
  "Причал",
  "Берег",
  "Огонёк",
  "Пламя",
  "Искра",
  "Факел",
  "Костер",
];

const BAR_NAMES = [
  "Крафт",
  "Хмель",
  "Солод",
  "Бочка",
  "Подвал",
  "Медь",
  "Дуб",
  "Гвоздь",
  "Трюфель",
  "Пробка",
];

const CINEMA_NAMES = [
  "Премьера",
  "Экран",
  "Кадр",
  "Синема",
  "Люмьер",
  "КиноМир",
  "АртКино",
  "Звезда",
  "Эпицентр",
  "Ретро",
];

const FOODCOURT_NAMES = [
  "Вкусно",
  "Аппетит",
  "Сытый",
  "Лавка",
  "ФудХолл",
  "Базар",
  "ГастроПарк",
  "Обжора",
  "Сковорода",
  "Повар",
];

const CATEGORY_NAMES = [
  "Горячие блюда",
  "Супы",
  "Салаты",
  "Закуски",
  "Десерты",
  "Напитки безалкогольные",
  "Пиво",
  "Вино",
  "Коктейли",
  "Крепкий алкоголь",
  "Пицца",
  "Паста",
  "Суши и роллы",
  "Бургеры",
  "Стейки",
  "Гарниры",
  "Соусы",
  "Хлеб и выпечка",
  "Кофе и чай",
  "Вода и соки",
  "Попкорн",
  "Снеки",
  "Мороженое",
  "Молочные коктейли",
  "Комбо-наборы",
];

const SKU_PREFIXES = [
  "Классический",
  "Домашний",
  "Фирменный",
  "Острый",
  "Сливочный",
  "Двойной",
  "Цезарь",
  "Греческий",
  "Итальянский",
  "Мексиканский",
];

const SKU_BASES: Record<string, string[]> = {
  "Горячие блюда": [
    "стейк из говядины",
    "куриное филе",
    "свиная отбивная",
    "рыба на гриле",
    "шашлык",
    "плов",
    "жаркое",
    "тефтели",
    "котлеты",
    "гуляш",
  ],
  Супы: [
    "борщ",
    "солянка",
    "куриный суп",
    "грибной крем-суп",
    "уха",
    "томатный суп",
    "фо-бо",
    "мисо-суп",
    "щи",
    "харчо",
  ],
  Салаты: [
    "цезарь",
    "греческий",
    "оливье",
    "винегрет",
    "руккола с креветками",
    "тёплый с курицей",
    "с тунцом",
    "морковный",
    "свекольный",
    "капрезе",
  ],
  Закуски: [
    "сырная тарелка",
    "брускетты",
    "мясное ассорти",
    "рыбное плато",
    "овощное ассорти",
    "чесночные гренки",
    "луковые кольца",
    "куриные крылья",
    "начос",
    "креветки в кляре",
  ],
  Десерты: [
    "тирамису",
    "чизкейк",
    "шоколадный фондан",
    "панна-котта",
    "эклеры",
    "макаронс",
    "брауни",
    "яблочный пирог",
    "медовик",
    "крем-брюле",
  ],
  Пицца: [
    "маргарита",
    "пепперони",
    "гавайская",
    "четыре сыра",
    "мясная",
    "с морепродуктами",
    "вегетарианская",
    "диабло",
    "карбонара",
    "барбекю",
  ],
  Паста: [
    "карбонара",
    "болоньезе",
    "песто",
    "альфредо",
    "арабиата",
    "с морепродуктами",
    "лазанья",
    "равиоли",
    "тортеллини",
    "фетуччини",
  ],
  Бургеры: [
    "чизбургер",
    "гамбургер",
    "чикен-бургер",
    "дабл-чиз",
    "бекон-бургер",
    "вегги-бургер",
    "рыбный бургер",
    "барбекю-бургер",
    "острый бургер",
    "сладкий бургер",
  ],
  Стейки: [
    "рибай",
    "стриплойн",
    "филе-миньон",
    "ти-бон",
    "шатобриан",
    "фланк",
    "скёрт",
    "топ-блейд",
    "денвер",
    "Нью-Йорк",
  ],
  Гарниры: [
    "картофельное пюре",
    "жареный картофель",
    "рис с овощами",
    "гречка",
    "булгур",
    "кускус",
    "овощи на гриле",
    "цветная капуста",
    "брокколи",
    "спаржа",
  ],
  Пиво: [
    "светлое нефильтрованное",
    "тёмное",
    "пшеничное",
    "IPA",
    "стаут",
    "лагер",
    "эль",
    "портер",
    "крафтовый сидр",
    "безалкогольное",
  ],
  Вино: [
    "каберне совиньон",
    "мерло",
    "пино нуар",
    "шираз",
    "шардоне",
    "совиньон блан",
    "рислинг",
    "просекко",
    "кава",
    "розе",
  ],
  Коктейли: [
    "мохито",
    "маргарита",
    "космополитен",
    "пина колада",
    "лонг-айленд",
    "негрони",
    "апероль шприц",
    "джин-тоник",
    "виски сауэр",
    "Б-52",
  ],
  "Суши и роллы": [
    "филадельфия",
    "калифорния",
    "дракон",
    "спайси тунец",
    "лосось",
    "угорь",
    "креветка темпура",
    "авокадо",
    "чукка",
    "запечённый с крабом",
  ],
  "Кофе и чай": [
    "эспрессо",
    "капучино",
    "латте",
    "американо",
    "моккачино",
    "матча латте",
    "чай чёрный",
    "чай зелёный",
    "чай травяной",
    "облепиховый чай",
  ],
  "Вода и соки": [
    "минеральная вода",
    "апельсиновый сок",
    "яблочный сок",
    "вишнёвый сок",
    "томатный сок",
    "грейпфрутовый сок",
    "ананасовый сок",
    "лимонад",
    "кола",
    "мохито б/а",
  ],
};

async function seed() {
  const ds = await AppDataSource.initialize();
  const queryRunner = ds.createQueryRunner();

  console.log("🗑  Очистка таблиц...");
  await queryRunner.query(
    "TRUNCATE transactions, skus, categories, venues RESTART IDENTITY CASCADE",
  );

  console.log("🏷  Создание категорий...");
  const categories = CATEGORY_NAMES.map((name) => ({
    name,
    slug: slugify(name),
  }));
  const savedCategories = await ds.getRepository(Category).save(categories);
  console.log(`   → ${savedCategories.length} категорий`);

  console.log("📍 Создание заведений...");
  const venues: Partial<Venue>[] = [];
  for (const city of CITIES) {
    for (let i = 0; i < 11; i++) {
      let name: string;
      let type: VenueType;
      switch (i % 4) {
        case 0:
          name = pick(RESTAURANT_NAMES);
          type = VenueType.RESTAURANT;
          break;
        case 1:
          name = pick(BAR_NAMES);
          type = VenueType.BAR;
          break;
        case 2:
          name = pick(CINEMA_NAMES);
          type = VenueType.CINEMA;
          break;
        default:
          name = pick(FOODCOURT_NAMES);
          type = VenueType.FOOD_COURT;
          break;
      }
      const nameSet = new Set(
        venues.filter((v) => v.city === city.name).map((v) => v.name),
      );
      if (nameSet.has(name)) {
        name = name + ` ${city.name}`;
      }
      venues.push({
        name,
        type,
        city: city.name,
        address: `${city.name}, ул. ${pick(["Ленина", "Мира", "Пушкина", "Гагарина", "Советская", "Кирова", "Молодёжная", "Садовая", "Лесная", "Центральная"])}, д. ${randInt(1, 99)}`,
        latitude: city.lat + randFloat(-0.03, 0.03, 7),
        longitude: city.lng + randFloat(-0.03, 0.03, 7),
        openedAt: randomDate(new Date("2015-01-01"), new Date("2025-01-01")),
      });
    }
  }
  const savedVenues = await ds.getRepository(Venue).save(venues);
  console.log(`   → ${savedVenues.length} заведений`);

  console.log("📦 Создание SKU...");
  const skus: Partial<Sku>[] = [];
  for (const cat of savedCategories) {
    const bases = SKU_BASES[cat.name] ?? ["продукт"];
    for (let i = 0; i < Math.min(10, bases.length); i++) {
      const base = bases[i];
      const price = randFloat(150, 5000);
      skus.push({
        name: `${pick(SKU_PREFIXES)} «${base[0].toUpperCase() + base.slice(1)}»`,
        categoryId: cat.id,
        price,
        cost: randFloat(price * 0.25, price * 0.65),
        unit: "pcs",
      });
    }
  }
  const savedSkus = await ds.getRepository(Sku).save(skus);
  console.log(`   → ${savedSkus.length} SKU`);

  console.log("💸 Создание транзакций...");
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const transactions: Partial<Transaction>[] = [];
  const BATCH_SIZE = 500;
  const TOTAL = 12000;

  for (let i = 0; i < TOTAL; i++) {
    const venue = pick(savedVenues);
    const sku = pick(savedSkus);
    const date = randomDate(oneYearAgo, now);

    const dow = date.getDay();
    const hour = date.getHours();
    const isWeekend = dow === 5 || dow === 6 || dow === 0;
    const isPeak = (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21);

    let quantity = randInt(1, 5);
    if (isWeekend) quantity = randInt(2, 6);
    if (isPeak) quantity = randInt(1, 7);

    const revenue = +(sku.price * quantity).toFixed(2);
    const cost = +(sku.cost * quantity).toFixed(2);

    transactions.push({
      venueId: venue.id,
      skuId: sku.id,
      quantity,
      revenue,
      cost,
      transactedAt: date,
    });

    if (transactions.length >= BATCH_SIZE || i === TOTAL - 1) {
      await ds.getRepository(Transaction).save(transactions);
      transactions.length = 0;
      const progress = Math.round(((i + 1) / TOTAL) * 100);
      process.stdout.write(`\r   → ${progress}%`);
    }
  }

  console.log(`\n   → ${TOTAL} транзакций`);
  console.log("✅ Сидирование завершено!");

  await ds.destroy();
}

seed().catch((err) => {
  console.error("❌ Ошибка:", err);
  process.exit(1);
});
