import { COLORS } from '../src/domain.ts';
export const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
export const text = (v, max = 80) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max)
    fail(400, 'Revisa los datos introducidos.');
  return v.trim();
};
export const id = (v) => {
  if (typeof v !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(v))
    fail(400, 'Identificador no válido.');
  return v;
};
export function product(d) {
  if (d.oneTime !== undefined && typeof d.oneTime !== 'boolean') fail(400, 'Producto no válido.');
  id(d.id);
  text(d.name);
  text(d.emoji, 16);
  text(d.unit, 24);
  if (
    typeof d.note !== 'string' ||
    d.note.length > 300 ||
    ![
      'fresh',
      'dairy',
      'bakery',
      'pantry',
      'protein',
      'frozen',
      'drinks',
      'home',
      'other',
    ].includes(d.category) ||
    !Number.isFinite(d.quantity) ||
    d.quantity < 0.1 ||
    d.quantity > 9999
  )
    fail(400, 'Cantidad o categoría no válida.');
  if (
    d.image !== undefined &&
    (typeof d.image !== 'string' ||
      d.image.length > 60000 ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(d.image))
  )
    fail(400, 'La foto no es válida.');
  if (d.productId !== undefined) id(d.productId);
  if (d.catalogId !== undefined) text(d.catalogId, 80);
}
export function metadata(d) {
  text(d.name, 60);
  text(d.emoji, 16);
  if (!COLORS.includes(d.color)) fail(400, 'Color no válido.');
}
export function validateOperation(op, listId) {
  id(op.id);
  if (
    op.listId !== listId ||
    !Number.isSafeInteger(op.seq) ||
    op.seq < 1 ||
    !op.data ||
    typeof op.data !== 'object' ||
    Array.isArray(op.data)
  )
    fail(400, 'Operación no válida.');
  const d = op.data;
  switch (op.type) {
    case 'member.rename':
      text(d.name, 30);
      break;
    case 'list.update':
      metadata(d);
      break;
    case 'item.add':
    case 'item.edit':
      product(d);
      break;
    case 'item.check':
      id(d.id);
      if (typeof d.checked !== 'boolean') fail(400, 'Marcado no válido.');
      break;
    case 'item.increment':
      id(d.id);
      if (!Number.isFinite(d.delta) || Math.abs(d.delta) > 9999) fail(400, 'Cantidad no válida.');
      break;
    case 'item.delete':
      id(d.id);
      break;
    case 'items.clear':
    case 'items.reset':
      if (!Array.isArray(d.ids) || d.ids.length > 1000) fail(400, 'Selección no válida.');
      d.ids.forEach(id);
      if (d.removeIds !== undefined) {
        if (!Array.isArray(d.removeIds) || d.removeIds.length > 1000)
          fail(400, 'Selección no válida.');
        d.removeIds.forEach(id);
      }
      break;
    case 'list.delete':
    case 'list.leave':
      break;
    default:
      fail(400, 'Operación desconocida.');
  }
}
