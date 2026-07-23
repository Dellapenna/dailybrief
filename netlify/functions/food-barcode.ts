import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/food-barcode?code=012345678905
 *
 * Real product data via Open Food Facts — free, no key, open/crowd-
 * sourced, and purpose-built for barcode lookups (unlike USDA FDC,
 * which is a text-search reference database used by food-search.ts).
 * Data quality varies since it's crowdsourced — a product not being
 * found, or having incomplete nutrition data, doesn't mean the barcode
 * was read wrong, it may just not be in the database yet.
 */
export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    if (!code) return json({ error: 'code query param is required' }, 400)

    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`)
    if (!res.ok) return json({ error: `Open Food Facts fetch failed (${res.status})` }, res.status)
    const data = await res.json()

    if (data.status !== 1 || !data.product) {
      return json({ error: 'Product not found for this barcode — try searching by name instead.' }, 404)
    }

    const n = data.product.nutriments ?? {}
    const calories = n['energy-kcal_100g'] ?? n['energy-kcal_serving'] ?? null

    if (calories === null) {
      return json({ error: 'Found the product, but no calorie data is available for it.' }, 404)
    }

    return json({
      result: {
        fdcId: `off-${code}`,
        description: data.product.product_name || data.product.generic_name || `Product ${code}`,
        calories,
        proteinG: n['proteins_100g'] ?? null,
        carbsG: n['carbohydrates_100g'] ?? null,
        fatG: n['fat_100g'] ?? null,
        sugarG: n['sugars_100g'] ?? null,
      },
    })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/food-barcode',
}
