import Setting from "@/models/Setting";
import { dbConnect } from "./db";

/** Returns the active markup percentage as a number (e.g., 30 for 30%) */
export async function getMarkupPercent(): Promise<number> {
  await dbConnect();
  const s = await Setting.findOne({}).lean();
  return Number(s?.pricing?.markupPercent ?? 0);
}

/** priceCents + markup% => cents */
export function applyMarkup(priceCents: number, markupPercent: number): number {
  const p = Math.max(0, Number(priceCents) || 0);
  const m = Math.max(0, Number(markupPercent) || 0);
  return Math.round(p * (1 + m / 100));
}

/** Shorthand to compute a formatted display price */
export async function formatDisplayPriceFromBase(baseCents: number): Promise<string> {
  const mp = await getMarkupPercent();
  const final = applyMarkup(baseCents, mp);
  return (final / 100).toFixed(2);
}
