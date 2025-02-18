export type AggregatedDataType = {
  categoriesList: string[];
  groupingsList: string[];
  facetHeight: number;
  facetMinWidth: number;
  categories: {
    [category: string]: {
      total: number;
      ids: string[];
      groups: {
        [group: string]: {
          total: number;
          ids: string[];
          selected: { count: number; sum: number; min: number; max: number; nums: number[]; ids: string[] };
          unselected: { count: number; sum: number; min: number; max: number; nums: number[]; ids: string[] };
        };
      };
    };
  };
};
