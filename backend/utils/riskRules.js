const GOLD_SYMBOLS = new Set([
  'GLD',
  'IAU',
  'SGOL',
  'BAR',
  'OUNZ',
  'GDX',
  'GDXJ',
  'GLDM',
]);

const STOCK_TYPES = new Set(['ETF', 'STOCK', 'MF']);

function isGoldAsset(asset) {
  const symbol = String(asset?.symbol || '').trim().toUpperCase();
  return GOLD_SYMBOLS.has(symbol) || symbol.includes('GOLD');
}

function isETF(asset) {
  return String(asset?.type || '').trim().toUpperCase() === 'ETF';
}

function getAssetType(asset) {
  const type = String(asset?.type || '').trim().toUpperCase();
  return STOCK_TYPES.has(type) ? type : 'UNKNOWN';
}

module.exports = {
  GOLD_SYMBOLS,
  isGoldAsset,
  isETF,
  getAssetType,
};
