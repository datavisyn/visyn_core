import { EColumnTypes, VisColumn } from '../interfaces';
import { iris as dataPromise } from './irisData';

export function fetchIrisData(): VisColumn[] {
  return [
    {
      info: {
        description: 'The length of the sepal (in cm)',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.sepalLength).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'The width of the sepal (in cm)',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.sepalWidth).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'The length of the petal (in cm)',
        id: 'petalLength',
        name: 'Petal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.petalLength).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'The width of the petal (in cm)',
        id: 'petalWidth',
        name: 'Petal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.petalWidth).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'The species of the flower (Iris setosa, Iris virginica, Iris versicolor)',
        id: 'species',
        name: 'Species',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val })),
    },
  ];
}
