import type { RecipeIngredient, Unit } from '../types';

export interface ImportedRecipe {
  title: string;
  servings: number;
  notes: string;
  ingredients: Array<Omit<RecipeIngredient, 'id' | 'recipeId'>>;
}

type JsonObject = Record<string, unknown>;

const fractionMap: Record<string, number> = {
  '1/2': 0.5,
  '1/3': 1 / 3,
  '2/3': 2 / 3,
  '1/4': 0.25,
  '3/4': 0.75,
  '1/8': 0.125
};

export async function importRecipeFromUrl(url: string): Promise<ImportedRecipe> {
  const normalizedUrl = normalizeUrl(url);
  const response = await fetch(normalizedUrl);

  if (!response.ok) {
    throw new Error('Die Rezeptseite konnte nicht geladen werden.');
  }

  const html = await response.text();
  return parseRecipeHtml(html, normalizedUrl);
}

export function parseRecipeHtml(html: string, sourceUrl: string): ImportedRecipe {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const recipe = findRecipeJsonLd(document);

  if (!recipe) {
    throw new Error('Auf dieser Seite wurden keine lesbaren Rezeptdaten gefunden.');
  }

  const title = textValue(recipe.name) || document.title || 'Importiertes Rezept';
  const servings = parseServings(recipe.recipeYield);
  const ingredientLines = arrayTextValue(recipe.recipeIngredient);
  const instructions = instructionsText(recipe.recipeInstructions);
  const description = textValue(recipe.description);
  const notes = [
    `Quelle: ${sourceUrl}`,
    description,
    instructions ? `Zubereitung:\n${instructions}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    title,
    servings,
    notes,
    ingredients: ingredientLines.map(parseIngredientLine)
  };
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Bitte fuege zuerst einen Rezept-Link ein.');
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function findRecipeJsonLd(document: Document): JsonObject | undefined {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

  for (const script of scripts) {
    const text = script.textContent?.trim();
    if (!text) continue;

    try {
      const parsed = JSON.parse(text) as unknown;
      const recipe = flattenJsonLd(parsed).find(isRecipeNode);
      if (recipe) return recipe;
    } catch {
      continue;
    }
  }

  return undefined;
}

function flattenJsonLd(value: unknown): JsonObject[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }

  if (!isObject(value)) {
    return [];
  }

  const graph = value['@graph'];
  const nested = Array.isArray(graph) ? graph.flatMap(flattenJsonLd) : [];
  return [value, ...nested];
}

function isRecipeNode(value: JsonObject) {
  const type = value['@type'];
  if (Array.isArray(type)) {
    return type.some((entry) => String(entry).toLowerCase() === 'recipe');
  }

  return String(type).toLowerCase() === 'recipe';
}

function parseServings(value: unknown) {
  const text = Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
  const match = text.match(/\d+/);
  return match ? Math.max(Number(match[0]), 1) : 2;
}

function arrayTextValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(textValue).filter(Boolean);
  }

  const text = textValue(value);
  return text ? [text] : [];
}

function instructionsText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((step, index) => `${index + 1}. ${instructionStepText(step)}`)
      .filter((line) => !line.endsWith('. '))
      .join('\n');
  }

  return instructionStepText(value);
}

function instructionStepText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (!isObject(value)) {
    return '';
  }

  if (Array.isArray(value.itemListElement)) {
    return instructionsText(value.itemListElement);
  }

  return textValue(value.text) || textValue(value.name);
}

function textValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (isObject(value)) {
    return textValue(value.text) || textValue(value.name);
  }

  return '';
}

function parseIngredientLine(line: string): Omit<RecipeIngredient, 'id' | 'recipeId'> {
  const normalized = line.replace(/\s+/g, ' ').trim();
  const quantityMatch = normalized.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+[,.]?\d*)\s*/);
  const rawQuantity = quantityMatch?.[1] ?? '1';
  const afterQuantity = normalized.slice(quantityMatch?.[0].length ?? 0).trim();
  const unitMatch = afterQuantity.match(/^(kg|g|gramm|l|liter|ml|milliliter|tl|el|stk\.?|stueck|prise|portion)\b\.?/i);
  const unitText = unitMatch?.[1] ?? '';
  const name = afterQuantity.slice(unitMatch?.[0].length ?? 0).replace(/^von\s+/i, '').trim();
  const converted = convertQuantity(parseQuantity(rawQuantity), unitText);

  return {
    name: name || normalized,
    quantity: converted.quantity,
    unit: converted.unit,
    category: 'Importiert',
    nutritionPer100: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      source: 'manual'
    }
  };
}

function parseQuantity(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const mixedFraction = normalized.match(/^(\d+)\s+(\d+\/\d+)$/);

  if (mixedFraction) {
    return Number(mixedFraction[1]) + parseQuantity(mixedFraction[2]);
  }

  if (fractionMap[normalized] !== undefined) {
    return fractionMap[normalized];
  }

  return Number(normalized) || 1;
}

function convertQuantity(quantity: number, unitText: string): { quantity: number; unit: Unit } {
  const unit = unitText.toLowerCase();

  if (unit === 'kg') return { quantity: quantity * 1000, unit: 'g' };
  if (unit === 'g' || unit === 'gramm') return { quantity, unit: 'g' };
  if (unit === 'l' || unit === 'liter') return { quantity: quantity * 1000, unit: 'ml' };
  if (unit === 'ml' || unit === 'milliliter') return { quantity, unit: 'ml' };
  if (unit.startsWith('stk') || unit === 'stueck') {
    return { quantity, unit: 'piece' };
  }

  return { quantity, unit: 'serving' };
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null;
}
