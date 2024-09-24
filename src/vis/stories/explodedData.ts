import { EColumnTypes, VisColumn } from '../interfaces';

export interface TestItem {
  name: string;
  age: number;
  numerical1: number;
  numerical2: number;
  categorical1: string;
  categorical2: string;
  manyCategories1: string;
  manyCategories2: string;
  statusFlag: 'active' | 'inactive';
  type1: 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D' | 'TYPE_E';
  type2: 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'TYPE_D' | 'TYPE_E';
}

const POSSIBLE_NAMES = [
  'Alice Marie Johnson',
  'Bob James Smith',
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
  return Array.from({ length: amount }).map(() => {
    return {
      name: POSSIBLE_NAMES[Math.floor(Math.random() * POSSIBLE_NAMES.length)] as string,
      age: Math.floor(Math.random() * 100),
      numerical1: Math.random() * 100,
      numerical2: Math.random() * 100,
      categorical1: `Category ${Math.floor(Math.random() * 10)}`,
      categorical2: `Category ${Math.floor(Math.random() * 10)}`,
      // 1000 unique categories
      manyCategories1: `APC_${Math.floor(Math.random() * 100)}`,
      manyCategories2: `EXPR_${Math.floor(Math.random() * 3000)}`,
      statusFlag: Math.random() > 0.5 ? ('active' as const) : ('inactive' as const),
      type1: `TYPE_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` as any,
      type2: `TYPE_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` as any,
    };
  });
}

export function fetchTestData(testData: TestItem[]): VisColumn[] {
  return [
    {
      info: {
        description: 'The name of the patient',
        id: 'name',
        name: 'Name',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.name).map((val, i) => ({ id: i.toString(), val })),
      domain: POSSIBLE_NAMES,
    },
    {
      info: {
        description: 'The age of the patient',
        id: 'age',
        name: 'Age',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.age).map((val, i) => ({ id: i.toString(), val })),
      domain: [0, 100],
    },
    {
      info: {
        description: 'The first numerical value',
        id: 'numerical1',
        name: 'Numerical 1',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.numerical1).map((val, i) => ({ id: i.toString(), val })),
      domain: [0, 100],
    },
    {
      info: {
        description: 'The second numerical value',
        id: 'numerical2',
        name: 'Numerical 2',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => testData.map((r) => r.numerical2).map((val, i) => ({ id: i.toString(), val })),
      domain: [0, 100],
    },
    {
      info: {
        description: 'The first categorical value',
        id: 'categorical1',
        name: 'Categorical 1',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.categorical1).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.map((r) => r.categorical1))),
    },
    {
      info: {
        description: 'The second categorical value',
        id: 'categorical2',
        name: 'Categorical 2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.categorical2).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.map((r) => r.categorical2))),
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
    {
      info: {
        description: 'The first set of many categories',
        id: 'manyCategories1',
        name: 'Many Categories 1',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.manyCategories1).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.flatMap((r) => r.manyCategories1))),
    },
    {
      info: {
        description: 'The second set of many categories',
        id: 'manyCategories2',
        name: 'Many Categories 2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => testData.map((r) => r.manyCategories2).map((val, i) => ({ id: i.toString(), val })),
      domain: Array.from(new Set(testData.flatMap((r) => r.manyCategories2))),
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
  ];
}
