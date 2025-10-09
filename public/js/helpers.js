// helpers.js
export const state = {
  currentSection: 'weapons',
  firstSelectionType: null,
  secondSelectionType: null,
  ownedItems: new Set(),
  wishlistedItems: new Set()
};

export const comparisonModal = document.getElementById('comparison-modal');
export const calculatorModal = document.getElementById('calculator-section');

export function getRarityClass(item) {
  if (!item.colValue) return 'rarity-common';
  if (item.colValue < 10000) return 'rarity-common';
  if (item.colValue < 30000) return 'rarity-uncommon';
  if (item.colValue < 60000) return 'rarity-rare';
  if (item.colValue < 90000) return 'rarity-epic';
  return 'rarity-legendary';
}

export function wikiUrl(name) {
  return "https://swordbloxonlinerebirth.fandom.com/wiki/" + name.replace(/ /g, "_");
}
