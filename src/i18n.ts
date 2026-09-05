import english from './en.json';
import type { Product } from './domain';
export type Language = 'es' | 'en';
let language: Language = 'es';
export const setCurrentLanguage = (value: Language) => {
  language = value === 'en' ? 'en' : 'es';
};
export const getCurrentLanguage = () => language;
export function t(source: string, ...values: unknown[]): string {
  const message =
    language === 'en' ? (english as Record<string, string>)[source] || source : source;
  return message.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? ''));
}
// Only built-in catalogue names are translated. Names entered by people stay intact.
export const productLabel = (product: Product) =>
  product.catalogId ? t(product.catalogId) : product.name;
