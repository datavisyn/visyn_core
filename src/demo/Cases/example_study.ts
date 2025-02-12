const categories = ['Magic', 'Yu-Gi-Oh', 'Pokemon'];

const subcategories = ['Red', 'Blue', 'Green'];

export const ExampleCase = Array.from({ length: 1000 }).map((_, i) => ({
  category: categories[Math.floor(Math.random() * 3)],
  subcategory: subcategories[Math.floor(Math.random() * 3)],
  coolness: Math.random() * 100,
  measured_yield: Math.random() * 100,
  experiment_cycle: -1,
}));
