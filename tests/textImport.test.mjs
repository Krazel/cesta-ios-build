import test from 'node:test';
import assert from 'node:assert/strict';
import { parseShoppingText } from '../src/textImport.ts';

const catalog = [
  ['Leche', 'Milk', 'L'],
  ['Huevos', 'Eggs', 'docena'],
  ['Tomates', 'Tomatoes', 'kg'],
  ['Espaguetis', 'Spaghetti', 'paquete'],
].map(([name, english, unit]) => ({
  product: { name, catalogId: name, unit, emoji: '🛍️', category: 'pantry' },
  names: [name, english],
}));
const parse = (text) => parseShoppingText(text, catalog);

test('Spanish message and English names resolve products, quantities and unknown names', () => {
  const items = parse(
    'Necesito comprar dos litros de leche, spaghetti y 6 huevos\nMi pan favorito',
  );
  assert.equal(items.length, 4);
  assert.equal(items[0].product.catalogId, 'Leche');
  assert.equal(items[0].quantity, 2);
  assert.equal(items[0].product.unit, 'L');
  assert.equal(items[1].product.catalogId, 'Espaguetis');
  assert.equal(items[2].product.unit, 'ud');
  assert.equal(items[2].quantity, 6);
  assert.equal(items[3].product.name, 'Mi pan favorito');
  assert.equal(items[3].product.catalogId, undefined);
});

test('Decimal quantities survive numbered bullets, comma separators and trailing quantities', () => {
  const items = parse('1. 2,5 kg de tomates\n- leche 2 L; 500g de tomate');
  assert.deepEqual(
    items.map((i) => [i.product.catalogId, i.quantity, i.product.unit]),
    [
      ['Tomates', 2.5, 'kg'],
      ['Leche', 2, 'L'],
      ['Tomates', 500, 'g'],
    ],
  );
  assert.equal(parse('2.5 kg tomates')[0].quantity, 2.5);
});

test('Parenthesized notes retain commas and conjunctions', () => {
  const items = parse('leche (para café, té y cacao), pan (sin cortar)');
  assert.equal(items.length, 2);
  assert.equal(items[0].product.catalogId, 'Leche');
  assert.equal(items[0].note, 'para café, té y cacao');
  assert.equal(items[1].note, 'sin cortar');
});

test('Equivalent products are combined only when units and notes match', () => {
  const items = parse('2 huevos; 3 eggs; 1 docena de huevos; leche (entera); leche (desnatada)');
  assert.equal(items.length, 4);
  assert.equal(items[0].quantity, 5);
  assert.equal(items[1].quantity, 1);
  assert.equal(items[1].product.unit, 'docena');
  const half = parse('Buy half a litre of milk')[0];
  assert.deepEqual([half.product.catalogId, half.quantity, half.product.unit], ['Leche', 0.5, 'L']);
});

test('English units and explicit counts do not inherit weight or dozen defaults', () => {
  const items = parse('two bottles of milk and 3 tomatoes; eggs x6');
  assert.deepEqual(
    items.map((i) => [i.product.catalogId, i.quantity, i.product.unit]),
    [
      ['Leche', 2, 'botella'],
      ['Tomates', 3, 'ud'],
      ['Huevos', 6, 'ud'],
    ],
  );
});

test('Invalid input is rejected before any products can be added', () => {
  for (const text of [
    '',
    'Lista:',
    '-2 huevos',
    '0 huevos',
    '10000 huevos',
    '0.01 kg tomates',
    'x'.repeat(81),
    'x'.repeat(6001),
    Array(101).fill('leche').join('\n'),
    '9999 huevos; 1 huevo',
  ]) {
    assert.throws(() => parse(text), text);
  }
});
