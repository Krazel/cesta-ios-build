export const productSizes = {
  compact: { label: 'Compacto', image: 30, font: 15, meta: 12, row: 49 },
  comfortable: { label: 'Cómodo', image: 40, font: 17, meta: 12, row: 62 },
  large: { label: 'Grande', image: 48, font: 19, meta: 13, row: 74 },
} as const;
export type ProductSize = keyof typeof productSizes;
