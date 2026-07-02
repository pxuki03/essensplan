# Essensplan Database Schema

Essensplan stores data in IndexedDB through Dexie. The planned database name is `essensplan-local` and the current schema version is `1`.

## Entities
- `recipes`: title, servings, meal types, preparation notes, tags, created/updated timestamps.
- `recipeIngredients`: recipe-linked ingredient rows with quantity, unit, category, optional product link, and manual nutrition.
- `foodProducts`: cached Open Food Facts or manual product data with source metadata, barcode, brand, per-100g nutrition, and last fetch time.
- `mealPlanEntries`: scheduled recipe or custom meal entries with ISO date, meal slot, servings, and notes.
- `pantryItems`: household stock with quantity, unit, category, expiry date, and optional product link.
- `shoppingLists`: generated or manual grocery lists with status and source date range.
- `shoppingListItems`: grocery rows with needed quantity, pantry deduction, store, checked state, and optional product link.
- `stores`: grocery store names and notes.
- `priceObservations`: price history by product or item name, store, package size, and date.
- `userSettings`: nutrition goals, preferred units, and export metadata.

## Units And Nutrition
- Internal units: `g`, `ml`, `piece`, `serving`.
- Nutrition fields: calories, protein, carbohydrates, fat, fiber, and sugar.
- Product nutrition prefers per-100g/per-100ml values.
- Nutrition source is tracked as `manual`, `open-food-facts`, or `calculated`.

## Migration Rules
- Add a Dexie version block for every schema change.
- Migrations must preserve user data and provide defaults for new fields.
- Import/export JSON includes `schemaVersion` for future compatibility.
