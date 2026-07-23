import type { Config, Context } from '@netlify/functions'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/food-search?q=chicken+breast
 *
 * Real food database search via USDA FoodData Central — public domain,
 * genuinely free forever, just needs a free API key (signup at
 * fdc.nal.usda.gov/api-key-signup.html). Never fabricated data.
 *
 * Nutrient values are best-effort extracted from each result's reported
 * foodNutrients array — typically per 100g for Foundation/SR Legacy
 * foods, per labeled serving for Branded foods. This app doesn't
 * normalize by exact serving size; the "quantity" field at log time is a
 * simple multiplier the person adjusts themselves, not a precise
 * gram-based recalculation — consistent with the app's "quick log, not
 * detailed tracking" philosophy elsewhere (Exercise Log).
 */

type FdcNutrient = { nutrientName: string; value: number }
type FdcFood = { fdcId: number; description: string; foodNutrients?: FdcNutrient[]; dataType?: string }

function extractNutrient(nutrients: FdcNutrient[] | undefined, match: string): number | null {
  if (!nutrients) return null
  const found = nutrients.find((n) => n.nutrientName?.toLowerCase().includes(match))
  return found ? found.value : null
}

export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    if (!query) return json({ error: 'q query param is required' }, 400)

    const apiKey = requireEnv('FDC_API_KEY')

    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=15&api_key=${apiKey}`,
    )
    if (!res.ok) return json({ error: `USDA FDC search failed (${res.status})` }, res.status)
    const data = await res.json()
    const foods: FdcFood[] = data?.foods ?? []

    const results = foods
      .map((f) => ({
        fdcId: String(f.fdcId),
        description: f.description,
        calories: extractNutrient(f.foodNutrients, 'energy'),
        proteinG: extractNutrient(f.foodNutrients, 'protein'),
        carbsG: extractNutrient(f.foodNutrients, 'carbohydrate'),
        fatG: extractNutrient(f.foodNutrients, 'lipid'),
        sugarG: extractNutrient(f.foodNutrients, 'sugars'),
      }))
      .filter((r) => r.calories !== null)

    return json({ results })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/food-search',
}
