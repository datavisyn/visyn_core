import { NAN_REPLACEMENT } from '../general';
import { EColumnTypes, VisColumn } from '../interfaces';

export interface TestItem {
  name: string | null | undefined;
  age: number | null;
  numerical1: number;
  numerical2: number | null;
  categorical1: string;
  categorical2: string | null;
  singleCategory: string;
  singleNumerical: number;
  manyCategories1: string;
  manyCategories2: string | null;
  statusFlag: 'ACTIVE' | 'INACTIVE';
  type1: 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D' | 'TYPE_E';
  type2: 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D' | 'TYPE_E' | null;
}

const POSSIBLE_NAMES = [
  'Alice Marie Johnson',
  'AMJ',
  'Bob James Smith',
  'Bo Ja Sm',
  'Charlie David Brown',
  'David Michael Williams',
  'Eve Elizabeth Jones',
  'Frank Thomas Miller',
  'Grace Patricia Wilson',
  'Hannah Barbara Moore',
  'Ivan Christopher Taylor',
  'Jack Daniel Anderson',
  'Alexander Jonathan Christopher William Smith',
  'Elizabeth Alexandra Catherine Victoria Johnson',
  'Maximilian Alexander Benjamin Theodore Brown',
  'Isabella Sophia Olivia Charlotte Williams',
  'Nathaniel Sebastian Alexander Harrison Jones',
];

/**
 * Artificially exploded test dataset to check for performance issues.
 */
export function generateTestData(amount: number) {
  const randomlyDividedAmount = Math.floor((amount / Math.random()) * 10);
  return Array.from({ length: amount }).map(() => {
    return {
      // Random possible name
      name: Math.random() > 0.97 ? null : POSSIBLE_NAMES[Math.floor(Math.random() * POSSIBLE_NAMES.length)],

      // Random age
      age: Math.random() > 0.97 ? null : Math.floor(Math.random() * 100),

      // 4 numerical values
      numerical1: Math.floor(Math.random() * 4 * Math.log10(amount)),

      // Random numerical value with random sign or 0
      numerical2: Math.random() > 0.97 ? null : Math.random() * amount * (Math.random() > 0.5 ? 1 : Math.random() < 0.1 ? 0 : -1),

      // 10 categories
      categorical1: `CATEGORY_${Math.floor(Math.random() * 10)}`,

      // Random category or null
      categorical2: Math.random() > 0.97 ? null : `CATEGORY_${Math.floor(Math.random() * 10 * Math.log10(amount))}`,

      // Single category
      singleCategory: `SINGLE_UNIQUE_CATEGORY`,

      // Single numerical value
      singleNumerical: randomlyDividedAmount,

      // 100 unique categories
      manyCategories1: `MANY_${Math.floor(Math.random() * 100)}`,

      // 3000 unique categories or null
      manyCategories2: Math.random() > 0.999 ? null : `FAR_TOO_MANY_${Math.floor(Math.random() * 3000)}`,

      // 2 categories
      statusFlag: Math.random() > 0.5 ? ('ACTIVE' as const) : ('INACTIVE' as const),

      // 5 types
      type1: `TYPE_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` as TestItem['type1'],

      // Random type or null
      type2: Math.random() > 0.97 ? null : (`TYPE_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` as TestItem['type2']),
    };
  });
}

export function fetchTestData(testData: TestItem[]): VisColumn[] {
  return [
    {
      info: {
        description: 'Name of the patient',
        id: 'name',
        name: 'Name',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.name).map((val, i) => ({ id: i.toString(), val: val || NAN_REPLACEMENT })),
      domain: POSSIBLE_NAMES,
    },
    {
      info: {
        description: 'Age of the patient',
        id: 'age',
        name: 'Age',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.age).map((val, i) => ({ id: i.toString(), val })),
      domain: [0, 100],
    },
    {
      info: {
        description: 'One of 4 random numerical value',
        id: 'numerical1',
        name: 'Numerical 1',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.numerical1).map((val, i) => ({ id: i.toString(), val })),
      domain: [0, 100],
    },
    {
      info: {
        description: 'Random numerical value (positive, negative or zero)',
        id: 'numerical2',
        name: 'Numerical 2',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.numerical2).map((val, i) => ({ id: i.toString(), val })),
      domain: [0, 100],
    },
    {
      info: {
        description: 'Ten categories',
        id: 'categorical1',
        name: 'Categorical 1',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.categorical1).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.map((r) => r.categorical1))),
    },
    {
      info: {
        description: 'Random category or null',
        id: 'categorical2',
        name: 'Categorical 2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.categorical2).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.map((r) => r.categorical2))).filter(Boolean) as string[],
    },
    {
      info: {
        description: 'Single category',
        id: 'singleCategory',
        name: 'Single Category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.singleCategory).map((val, i) => ({ id: i.toString(), val })),
      domain: ['SINGLE_UNIQUE_CATEGORY'],
    },
    {
      info: {
        description: 'Single numerical value',
        id: 'singleNumerical',
        name: 'Single Numerical',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.singleNumerical).map((val, i) => ({ id: i.toString(), val })),
      domain: [testData.length, testData.length],
    },
    {
      info: {
        description: 'One hundred unique categories',
        id: 'manyCategories1',
        name: 'Many Categories 1',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.manyCategories1).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.flatMap((r) => r.manyCategories1))),
    },
    {
      info: {
        description: 'Three thousand unique categories or null',
        id: 'manyCategories2',
        name: 'Many Categories 2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.manyCategories2).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.flatMap((r) => r.manyCategories2))).filter(Boolean) as string[],
    },
    {
      info: {
        description: 'The status flag',
        id: 'statusFlag',
        name: 'Status Flag',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.statusFlag).map((val, i) => ({ id: i.toString(), val })),
      domain: ['active', 'inactive'],
    },
    {
      info: {
        description: 'The first type value',
        id: 'type1',
        name: 'Type 1',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.type1).map((val, i) => ({ id: i.toString(), val })),
      domain: ['TYPE_A', 'TYPE_B', 'TYPE_C', 'TYPE_D', 'TYPE_E'],
    },
    {
      info: {
        description: 'The second type value',
        id: 'type2',
        name: 'Type 2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.type2).map((val, i) => ({ id: i.toString(), val })),
      domain: ['TYPE_A', 'TYPE_B', 'TYPE_C', 'TYPE_D', 'TYPE_E'],
    },
  ];
}
