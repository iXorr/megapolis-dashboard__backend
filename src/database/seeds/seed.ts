import { AppDataSource } from "../data-source";
import { Venue, VenueType } from "../entities/venue.entity";
import { Category } from "../entities/category.entity";
import { Sku } from "../entities/sku.entity";
import { Transaction } from "../entities/transaction.entity";
import { randFloat, randInt, pick, randomDate } from "./helpers";
import {
  BAR_NAMES,
  CATEGORY_NAMES,
  CINEMA_NAMES,
  CITIES,


  RESTAURANT_NAMES,
  SKU_BASES,
  SKU_PREFIXES,
  STREETS,
} from "./data";

async function seed() {
  const ds = await AppDataSource.initialize();
  const queryRunner = ds.createQueryRunner();

  await queryRunner.query(
    "TRUNCATE transactions, skus, categories, venues RESTART IDENTITY CASCADE",
  );

  const categories = CATEGORY_NAMES.map((name) => ({ name }));
  const savedCategories = await ds.getRepository(Category).save(categories);
  const venues: Partial<Venue>[] = [];

  for (const city of CITIES) {
    for (let i = 0; i < 3; i++) {
      let name: string;
      let type: VenueType;
      switch (i % 3) {
        case 0:
          name = pick(RESTAURANT_NAMES);
          type = VenueType.RESTAURANT;
          break;
        case 1:
          name = pick(BAR_NAMES);
          type = VenueType.BAR;
          break;
        default:
          name = pick(CINEMA_NAMES);
          type = VenueType.CINEMA;
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
        address: `${city.name}, ул. ${pick(STREETS)}, д. ${randInt(1, 99)}`,
        latitude: city.lat + randFloat(-0.03, 0.03, 7),
        longitude: city.lng + randFloat(-0.03, 0.03, 7),
        openedAt: randomDate(new Date("2015-01-01"), new Date("2025-01-01")),
      });
    }
  }

  const savedVenues = await ds.getRepository(Venue).save(venues);
  const skus: Partial<Sku>[] = [];

  for (const cat of savedCategories) {
    const bases = SKU_BASES[cat.name] ?? ["продукт"];
    for (let i = 0; i < Math.min(5, bases.length); i++) {
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
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const transactions: Partial<Transaction>[] = [];
  const BATCH_SIZE = 500;
  const TOTAL = 3000;

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

  await ds.destroy();
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
