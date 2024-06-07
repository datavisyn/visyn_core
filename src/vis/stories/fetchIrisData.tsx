import { EColumnTypes, VisColumn } from '../interfaces';
import { iris as dataPromise } from './irisData';

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
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val })),
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
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'Random category2',
        id: 'random_category2',
        name: 'Random category2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.species).map((val, i) => ({ id: i.toString(), val })),
    },
  ];
}
