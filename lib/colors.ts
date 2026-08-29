export type ColorFamily =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'neutral';

export type Swatch = {
  code: string;
  name: string;
  hex: string;
  family: ColorFamily;
};

export const FAMILIES: { id: ColorFamily; label: string }[] = [
  { id: 'red', label: 'Červené' },
  { id: 'orange', label: 'Oranžové' },
  { id: 'yellow', label: 'Žluté' },
  { id: 'green', label: 'Zelené' },
  { id: 'blue', label: 'Modré' },
  { id: 'purple', label: 'Fialové' },
  { id: 'pink', label: 'Růžové' },
  { id: 'neutral', label: 'Neutrální' },
];

/**
 * Sample of the Montana palette with invented codes.
 *
 * Sorted within each family from darkest to lightest — keep that ordering when
 * adding shades. The wall is laid out as one swatch per grid cell, so an
 * unsorted family reads as visual noise instead of a gradient, and the whole
 * point of the section is that it looks like a paint wall in a shop.
 */
export const COLORS: Swatch[] = [
  // ── Reds ──────────────────────────────────────────────────────
  { code: 'MTN-3010', name: 'Cherry', hex: '#2e0709', family: 'red' },
  { code: 'MTN-3015', name: 'Oxblood', hex: '#43090f', family: 'red' },
  { code: 'MTN-3020', name: 'Vino Tinto', hex: '#5e0d18', family: 'red' },
  { code: 'MTN-3030', name: 'Bordó', hex: '#7a121f', family: 'red' },
  { code: 'MTN-3035', name: 'Carmine', hex: '#96131c', family: 'red' },
  { code: 'MTN-3040', name: 'Power Red', hex: '#b3151f', family: 'red' },
  { code: 'MTN-3050', name: 'Tornado', hex: '#d31a25', family: 'red' },
  { code: 'MTN-3055', name: 'Signal', hex: '#e02128', family: 'red' },
  { code: 'MTN-3060', name: 'Pomelo', hex: '#e8323a', family: 'red' },
  { code: 'MTN-3070', name: 'Coral', hex: '#f15a52', family: 'red' },
  { code: 'MTN-3075', name: 'Flamingo', hex: '#f5726a', family: 'red' },
  { code: 'MTN-3080', name: 'Salmon', hex: '#f78a82', family: 'red' },
  { code: 'MTN-3090', name: 'Blush', hex: '#fbb5ad', family: 'red' },
  { code: 'MTN-3095', name: 'Peony', hex: '#fdd2cc', family: 'red' },

  // ── Orange ────────────────────────────────────────────────────
  { code: 'MTN-4005', name: 'Cacao', hex: '#3f1a0b', family: 'orange' },
  { code: 'MTN-4010', name: 'Brick', hex: '#6e2a10', family: 'orange' },
  { code: 'MTN-4015', name: 'Terracotta', hex: '#873512', family: 'orange' },
  { code: 'MTN-4020', name: 'Rust', hex: '#a04014', family: 'orange' },
  { code: 'MTN-4025', name: 'Amber', hex: '#c24c14', family: 'orange' },
  { code: 'MTN-4030', name: 'Mandarine', hex: '#e25a15', family: 'orange' },
  { code: 'MTN-4035', name: 'Tangerine', hex: '#ec6a18', family: 'orange' },
  { code: 'MTN-4040', name: 'Fanta', hex: '#f37b1c', family: 'orange' },
  { code: 'MTN-4045', name: 'Apricot', hex: '#f68d2b', family: 'orange' },
  { code: 'MTN-4050', name: 'Saffron', hex: '#f7a23b', family: 'orange' },
  { code: 'MTN-4055', name: 'Melon', hex: '#fbb45f', family: 'orange' },
  { code: 'MTN-4060', name: 'Peach', hex: '#ffc481', family: 'orange' },
  { code: 'MTN-4070', name: 'Cream', hex: '#ffdcb4', family: 'orange' },
  { code: 'MTN-4075', name: 'Linen', hex: '#ffead4', family: 'orange' },

  // ── Yellow ────────────────────────────────────────────────────
  { code: 'MTN-5005', name: 'Bronze', hex: '#3f350a', family: 'yellow' },
  { code: 'MTN-5008', name: 'Khaki', hex: '#4f450d', family: 'yellow' },
  { code: 'MTN-5010', name: 'Olive', hex: '#615311', family: 'yellow' },
  { code: 'MTN-5015', name: 'Curry', hex: '#8a6d12', family: 'yellow' },
  { code: 'MTN-5020', name: 'Mustard', hex: '#b08b14', family: 'yellow' },
  { code: 'MTN-5025', name: 'Ochre', hex: '#c79a17', family: 'yellow' },
  { code: 'MTN-5030', name: 'Gold', hex: '#d9a91a', family: 'yellow' },
  { code: 'MTN-5035', name: 'Honey', hex: '#e8b91a', family: 'yellow' },
  { code: 'MTN-5040', name: 'Cadmium', hex: '#f4c21a', family: 'yellow' },
  { code: 'MTN-5045', name: 'Sun', hex: '#f9d41f', family: 'yellow' },
  { code: 'MTN-5050', name: 'Lemon', hex: '#fce53a', family: 'yellow' },
  { code: 'MTN-5055', name: 'Fluor Yellow', hex: '#f2ff2e', family: 'yellow' },
  { code: 'MTN-5060', name: 'Vanilla', hex: '#fbeea3', family: 'yellow' },
  { code: 'MTN-5070', name: 'Straw', hex: '#fdf5cd', family: 'yellow' },

  // ── Green ─────────────────────────────────────────────────────
  { code: 'MTN-6010', name: 'Black Forest', hex: '#0e2a1a', family: 'green' },
  { code: 'MTN-6020', name: 'Spruce', hex: '#143a25', family: 'green' },
  { code: 'MTN-6030', name: 'Bottle', hex: '#114d2d', family: 'green' },
  { code: 'MTN-6035', name: 'Emerald', hex: '#155e34', family: 'green' },
  { code: 'MTN-6040', name: 'Iguana', hex: '#1b6f3b', family: 'green' },
  { code: 'MTN-6050', name: 'Cyprus', hex: '#2a8b46', family: 'green' },
  { code: 'MTN-6060', name: 'Park', hex: '#3aa553', family: 'green' },
  { code: 'MTN-6065', name: 'Grass', hex: '#4cb44e', family: 'green' },
  { code: 'MTN-6070', name: 'Guacamole', hex: '#67b94b', family: 'green' },
  { code: 'MTN-6075', name: 'Fluor Green', hex: '#3dff62', family: 'green' },
  { code: 'MTN-6080', name: 'Acid', hex: '#a3d930', family: 'green' },
  { code: 'MTN-6090', name: 'Lime', hex: '#c5e85a', family: 'green' },
  { code: 'MTN-6095', name: 'Celery', hex: '#cfec7f', family: 'green' },
  { code: 'MTN-6100', name: 'Pistachio', hex: '#d8e8a6', family: 'green' },

  // ── Blue ──────────────────────────────────────────────────────
  { code: 'MTN-7005', name: 'Abyss', hex: '#060d1f', family: 'blue' },
  { code: 'MTN-7010', name: 'Midnight', hex: '#0c1838', family: 'blue' },
  { code: 'MTN-7020', name: 'Indigo', hex: '#101e57', family: 'blue' },
  { code: 'MTN-7030', name: 'Ultramarine', hex: '#163181', family: 'blue' },
  { code: 'MTN-7040', name: 'Cobalt', hex: '#1a48b6', family: 'blue' },
  { code: 'MTN-7075', name: 'Petrol', hex: '#12707a', family: 'blue' },
  { code: 'MTN-7050', name: 'Electric', hex: '#1f63e0', family: 'blue' },
  { code: 'MTN-7055', name: 'Azur', hex: '#1f76d6', family: 'blue' },
  { code: 'MTN-7060', name: 'Atlantic', hex: '#2186c4', family: 'blue' },
  { code: 'MTN-7070', name: 'Lago', hex: '#39a8d6', family: 'blue' },
  { code: 'MTN-7090', name: 'Cyan', hex: '#21c4d1', family: 'blue' },
  { code: 'MTN-7080', name: 'Ciel', hex: '#7ec6e6', family: 'blue' },
  { code: 'MTN-7085', name: 'Mint', hex: '#9cdfd2', family: 'blue' },
  { code: 'MTN-7095', name: 'Glacier', hex: '#c3e8f2', family: 'blue' },

  // ── Purple ────────────────────────────────────────────────────
  { code: 'MTN-8005', name: 'Blackberry', hex: '#180722', family: 'purple' },
  { code: 'MTN-8010', name: 'Eggplant', hex: '#2b1140', family: 'purple' },
  { code: 'MTN-8015', name: 'Plum', hex: '#3a1559', family: 'purple' },
  { code: 'MTN-8020', name: 'Royal Purple', hex: '#451c75', family: 'purple' },
  { code: 'MTN-8025', name: 'Grape', hex: '#5a2394', family: 'purple' },
  { code: 'MTN-8030', name: 'Violet', hex: '#6b2bb1', family: 'purple' },
  { code: 'MTN-8035', name: 'Mauve', hex: '#7b38c4', family: 'purple' },
  { code: 'MTN-8040', name: 'Iris', hex: '#8b46d6', family: 'purple' },
  { code: 'MTN-8045', name: 'Amethyst', hex: '#9f5ce0', family: 'purple' },
  { code: 'MTN-8050', name: 'Orchid', hex: '#b576e6', family: 'purple' },
  { code: 'MTN-8055', name: 'Wisteria', hex: '#c496ea', family: 'purple' },
  { code: 'MTN-8060', name: 'Lavender', hex: '#d2b6ec', family: 'purple' },
  { code: 'MTN-8065', name: 'Thistle', hex: '#dcc5f0', family: 'purple' },
  { code: 'MTN-8070', name: 'Lilac Mist', hex: '#e6d7f5', family: 'purple' },

  // ── Pink ──────────────────────────────────────────────────────
  { code: 'MTN-9005', name: 'Wine', hex: '#4d0524', family: 'pink' },
  { code: 'MTN-9008', name: 'Burgundy', hex: '#71073a', family: 'pink' },
  { code: 'MTN-9010', name: 'Magenta', hex: '#a10c4a', family: 'pink' },
  { code: 'MTN-9015', name: 'Raspberry', hex: '#bf105e', family: 'pink' },
  { code: 'MTN-9020', name: 'Fuchsia', hex: '#d61676', family: 'pink' },
  { code: 'MTN-9025', name: 'Fluor Pink', hex: '#ff2d8a', family: 'pink' },
  { code: 'MTN-9030', name: 'Hot Pink', hex: '#ed3a8e', family: 'pink' },
  { code: 'MTN-9035', name: 'Candy', hex: '#f254a0', family: 'pink' },
  { code: 'MTN-9040', name: 'Bubblegum', hex: '#f56db1', family: 'pink' },
  { code: 'MTN-9045', name: 'Peony Pink', hex: '#f78ec0', family: 'pink' },
  { code: 'MTN-9050', name: 'Sakura', hex: '#fba6c8', family: 'pink' },
  { code: 'MTN-9055', name: 'Rosé', hex: '#fcbdd5', family: 'pink' },
  { code: 'MTN-9060', name: 'Powder', hex: '#fcd4df', family: 'pink' },
  { code: 'MTN-9070', name: 'Shell', hex: '#fde9ef', family: 'pink' },

  // ── Neutral ───────────────────────────────────────────────────
  { code: 'MTN-1010', name: 'Carbon', hex: '#0e0d10', family: 'neutral' },
  { code: 'MTN-1015', name: 'Soot', hex: '#151419', family: 'neutral' },
  { code: 'MTN-1020', name: 'Anthracite', hex: '#1b1a1f', family: 'neutral' },
  { code: 'MTN-1030', name: 'Asfalt', hex: '#2a282e', family: 'neutral' },
  { code: 'MTN-1035', name: 'Slate', hex: '#37343c', family: 'neutral' },
  { code: 'MTN-1040', name: 'Beton', hex: '#46434a', family: 'neutral' },
  { code: 'MTN-1045', name: 'Graphite', hex: '#57545d', family: 'neutral' },
  { code: 'MTN-1050', name: 'Stone', hex: '#6c6870', family: 'neutral' },
  { code: 'MTN-1055', name: 'Ash', hex: '#847f88', family: 'neutral' },
  { code: 'MTN-1060', name: 'Silver', hex: '#9c9aa0', family: 'neutral' },
  { code: 'MTN-1065', name: 'Pearl', hex: '#b8b5ba', family: 'neutral' },
  { code: 'MTN-1070', name: 'Bone', hex: '#d6d2c8', family: 'neutral' },
  { code: 'MTN-1075', name: 'Paper', hex: '#e6e2d9', family: 'neutral' },
  { code: 'MTN-1080', name: 'Chalk', hex: '#f1ede4', family: 'neutral' },
];
