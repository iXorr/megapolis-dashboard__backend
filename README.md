# Бэкенд аналитического дашборда

![NestJS](https://img.shields.io/badge/NestJS-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%234169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-%234B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white)

## Описание

Сервис для предоставления данных к дашборду сети заведений (рестораны, бары, кинотеатры, фуд-корты).

## Что умеет

### KPI-сводка

Пять ключевых показателей на выбранном периоде с дельтами к прошлому периоду:

| Метрика | Расчёт |
|---|---|
| **Выручка** | `SUM(revenue)` за период |
| **Средний чек** | `revenue / orderCount` |
| **Количество заказов** | `COUNT(transactions)` |
| **Маржинальность** | `(revenue - cost) / revenue × 100%` |
| **Топ-заведение** | Заведение с наибольшей выручкой |

Дельта считается как `(текущий - предыдущий) / предыдущий * 100%`.

### Drill-down

Иерархическая детализация данных: **сеть -> заведение -> категория -> SKU**. 

На каждом уровне показывается выручка, количество заказов и маржинальность для дочерних сущностей. Уровень `network` агрегирует по типам заведений, `venue` - по конкретным заведениям, `category` - по категориям внутри заведения, `sku` - по позициям внутри категории.

### Динамика выручки (линейный график)

Группировка по дням / неделям / месяцам (`granularity`) с разбивкой по типам заведений. Для недель ключ группировки - понедельник.

### Топ заведений

Ранжирование по выручке с маржинальностью, настраиваемый `limit`.

### Структура выручки (sunburst)

Двухуровневая иерархия: **тип заведения -> категория**. 

Подходит для круговой или солнечной диаграммы.

### Тепловая карта загрузки

Группировка по дням недели (0-6) и часам (0-23). 

Показывает количество заказов и выручку - где и когда пиковые нагрузки.

### Scatter-плот

Сводка по SKU: средняя цена, маржинальность, количество продаж.

Для анализа «цена vs маржа vs популярность».

### Тяжёлая таблица

Универсальный эндпойнт с пагинацией, сортировкой и группировкой (`venue`, `category`, `sku` или без группировки).

### Фильтры (общие для всех эндпойнтов)

- Период: `dateFrom` / `dateTo` (ISO 8601)
- Типы заведений: `venueTypes[]` (restaurant, bar, cinema, food_court)
- Конкретные заведения: `venueIds[]`
- Категории: `categoryIds[]`
- Поиск по названию SKU: `search` (ILIKE)

Фильтры комбинируются друг с другом - за это отвечает единый `applyFilters()` в `dashboard-filters.utils.ts`.

## Быстрый старт

```bash
npm install

sudo -u postgres psql -c "CREATE ROLE dashboard WITH LOGIN PASSWORD 'dashboard';"
sudo -u postgres psql -c "CREATE DATABASE dashboard OWNER dashboard;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dashboard TO dashboard;"

cp .env.example .env

npm run seed

npm run start:dev
```

## API

Все эндпойнты документированы в Swagger: **`URL/api/docs`**

Базовый путь: `/api`. 

Формат ответа: `{ data, meta }` (обёртка через `ResponseInterceptor`).

Ошибки: `{ statusCode, error, message, timestamp, path }`.

## Моковые данные

Сидер генерирует данные с реалистичными паттернами:
- Выходные (Пт–Вс): +30% к выручке
- Часы пик (12:00-14:00, 18:00-21:00): больше заказов
