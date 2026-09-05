import type { Product } from './domain';

export type TextProduct = { product: Product; quantity: number; note: string };
export type CatalogEntry = { product: Product; names: string[] };
const clean = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
const numbers: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  doce: 12,
  medio: 0.5,
  media: 0.5,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twelve: 12,
  half: 0.5,
};
const units: Record<string, string> = {
  kg: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  kilogramo: 'kg',
  kilogramos: 'kg',
  kilograms: 'kg',
  g: 'g',
  gr: 'g',
  gramo: 'g',
  gramos: 'g',
  grams: 'g',
  l: 'L',
  litro: 'L',
  litros: 'L',
  litre: 'L',
  litres: 'L',
  liter: 'L',
  liters: 'L',
  ml: 'ml',
  mililitros: 'ml',
  millilitres: 'ml',
  milliliters: 'ml',
  ud: 'ud',
  uds: 'ud',
  unidad: 'ud',
  unidades: 'ud',
  pc: 'ud',
  pcs: 'ud',
  pieces: 'ud',
  paquete: 'paquete',
  paquetes: 'paquete',
  pack: 'paquete',
  packs: 'paquete',
  packets: 'paquete',
  botella: 'botella',
  botellas: 'botella',
  bottle: 'botella',
  bottles: 'botella',
  bote: 'bote',
  botes: 'bote',
  jar: 'bote',
  jars: 'bote',
  lata: 'lata',
  latas: 'lata',
  tin: 'lata',
  tins: 'lata',
  can: 'lata',
  cans: 'lata',
  bolsa: 'bolsa',
  bolsas: 'bolsa',
  bag: 'bolsa',
  bags: 'bolsa',
  docena: 'docena',
  docenas: 'docena',
  dozen: 'docena',
};
const forms = (value: string) => {
  const normalized = clean(value);
  return [normalized, normalized.replace(/s$/, ''), normalized.replace(/es$/, '')];
};

export function parseShoppingText(text: string, catalog: CatalogEntry[]): TextProduct[] {
  if (text.length > 6000) throw new Error('El texto es demasiado largo. Máximo 6000 caracteres.');
  const notes: string[] = [];
  const chunks = text
    .replace(/\([^()]*\)/g, (note) => `\uE000${notes.push(note) - 1}\uE001`)
    .replace(/(\d),(\d)/g, '$1.$2')
    .split(/\r?\n|;|,|\s+(?:y|and|&)\s+/i)
    .map((line) => line.replace(/\uE000(\d+)\uE001/g, (_, index) => notes[Number(index)]).trim())
    .filter(Boolean);
  if (chunks.length > 100) throw new Error('Puedes convertir hasta 100 productos cada vez.');
  const result: TextProduct[] = [];
  for (const chunk of chunks) {
    let name = chunk
      .replace(/^(?:[-*]\s+|(?:[•☐☑]|\[[ xX]?\])\s*|\d+[.)]\s+)/, '')
      .replace(
        /^(?:(?:quiero|necesito)(?:\s+comprar)?|comprar|compra|añade|añadir|i need(?: to buy)?|please buy|buy|add|lista(?: de la compra)?|shopping list)(?:\s*:\s*|\s+)/i,
        '',
      )
      .replace(/[.!]$/, '')
      .trim();
    if (/^(?:lista(?: de la compra)?|productos|shopping list|groceries):?$/i.test(name)) continue;
    let note = '';
    const annotation = name.match(/\s*\(([^()]*)\)\s*$/);
    if (annotation) {
      note = annotation[1].trim();
      name = name.slice(0, annotation.index).trim();
    }
    // Convert a trailing quantity to the same form as a leading one.
    const trailing = name.match(
      /^(.+?)\s+(?:[x×]\s*)?(\d+(?:\.\d+)?)(?:\s*(kg|g|ml|l|uds?|packs?))?$/i,
    );
    if (trailing) name = `${trailing[2]} ${trailing[3] || ''} ${trailing[1]}`.replace(/\s+/g, ' ');
    let quantity = 1;
    let explicitQuantity = false;
    if (/^-\d/.test(name)) throw new Error('Revisa las cantidades: deben estar entre 0,1 y 9999.');
    const numeric = name.match(/^(\d+(?:\.\d+)?)(?:\s*[x×]\s*|\s+|(?=(?:kg|g|ml|l)\b))(.+)$/i);
    const word = name.match(/^(\S+)\s+(.+)$/);
    if (numeric) {
      quantity = Number(numeric[1]);
      name = numeric[2];
      explicitQuantity = true;
    } else if (word && numbers[clean(word[1])] !== undefined) {
      quantity = numbers[clean(word[1])];
      name = word[2];
      explicitQuantity = true;
    }
    let unit: string | undefined;
    if (quantity === 0.5) name = name.replace(/^an?\s+/i, '');
    const firstWord = name.match(/^(\S+)\s+(.+)$/);
    if (explicitQuantity && firstWord && units[clean(firstWord[1])]) {
      unit = units[clean(firstWord[1])];
      name = firstWord[2].replace(/^(?:de|of)\s+/i, '');
    }
    name = name.trim();
    if (!name || name.length > 80 || note.length > 300)
      throw new Error('Revisa el texto: cada nombre admite 80 caracteres y cada nota, 300.');
    if (!Number.isFinite(quantity) || quantity < 0.1 || quantity > 9999)
      throw new Error('Revisa las cantidades: deben estar entre 0,1 y 9999.');
    const exact = catalog.find((entry) =>
      entry.names.some((label) => clean(label) === clean(name)),
    );
    const match =
      exact ||
      catalog.find((entry) => entry.names.some((label) => forms(label).includes(clean(name))));
    const product: Product = match
      ? { ...match.product, unit: unit || (explicitQuantity ? 'ud' : match.product.unit) }
      : { name, category: 'other', emoji: '🛍️', unit: unit || 'ud' };
    const key = (p: Product) => p.productId || p.catalogId || clean(p.name);
    const duplicate = result.find(
      (entry) =>
        key(entry.product) === key(product) &&
        entry.product.unit === product.unit &&
        entry.note === note,
    );
    if (duplicate) {
      duplicate.quantity = Math.round((duplicate.quantity + quantity) * 1000) / 1000;
      if (duplicate.quantity > 9999)
        throw new Error('Revisa las cantidades: deben estar entre 0,1 y 9999.');
    } else result.push({ product, quantity, note });
  }
  if (!result.length) throw new Error('Escribe al menos un producto para preparar la lista.');
  return result;
}
