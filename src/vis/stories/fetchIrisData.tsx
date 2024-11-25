import { EColumnTypes, VisColumn } from '../interfaces';
import { iris as dataPromise } from './irisData';

function randomNumberBetweenRange(min: number, max: number): number | null {
  // Return null for some random values
  if (Math.random() < 0.1) {
    return null;
  }

  return Math.random() * (max - min) + min;
}

export function fetchIrisData(): VisColumn[] {
  return [
    {
      info: {
        description: '(in cm)',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.sepalLength).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: '(in cm)',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.sepalWidth).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: '(in cm)',
        id: 'petalLength',
        name: 'Petal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.petalLength).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: '(in cm)',
        id: 'petalWidth',
        name: 'Petal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.petalWidth).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: '(Setosa, Virginica, Versicolor)',
        id: 'species',
        name: 'Species',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val: val ?? null })),
      // color: {
      //   Setosa: 'red',
      //   Virginica: 'blue',
      //   Versicolor: 'green',
      //   'Setosa long name label 2': 'rebeccapurple',
      //   'Setosa long name label': 'orange',
      // },
    },
    {
      info: {
        description: 'Random category',
        id: 'random_category',
        name: 'Random category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val: val ?? null })),
    },
    {
      info: {
        description: 'Random category2',
        id: 'random_category2',
        name: 'Random category2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val: val ?? null })),
    },
    {
      info: {
        description: 'Incomplete X',
        id: 'incompleteX',
        name: 'Incomplete X',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((val, i) => ({ id: i.toString(), val: randomNumberBetweenRange(0.96499999997, 1.3850000003299998) })),
    },
    {
      info: {
        description: 'Incomplete Y',
        id: 'incompleteY',
        name: 'Incomplete Y',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((val, i) => ({ id: i.toString(), val: randomNumberBetweenRange(-1.5419997517300001, 28.96199726903) })),
    },
  ];
}
