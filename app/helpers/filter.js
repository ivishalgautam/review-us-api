export function getItemsToDelete(existingItems = [], updatedItems) {
  // if (!updatedItems || !updatedItems.length) return [];
  return existingItems?.filter((item) => !updatedItems.includes(item)) ?? [];
}
