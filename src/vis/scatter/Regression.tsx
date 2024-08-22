/* This file holds utility functions for the regression line options.
Adopted code for curve fitting from https://github.com/Tom-Alexander/regression-js
Currently we only support linear and polynomial regression.
*/

import { CheckIcon, ColorSwatch, Group, Input, SegmentedControl, Select, Stack, Text, rem } from '@mantine/core';
import fitCurve from 'fit-curve';
import { corrcoeff, ftest, spearmancoeff } from 'jstat';
import * as React from 'react';
import { HelpHoverCard } from '../../components/HelpHoverCard';
import { ERegressionLineType, IRegressionFitOptions, IRegressionLineOptions, IRegressionResult } from './interfaces';

type RegressionData = Array<Array<number>>;
const DEFAULT_CURVE_FIT_OPTIONS: IRegressionFitOptions = { order: 2, precision: 3 };

interface RegressionLineOptionsProps {
  callback: (s: IRegressionLineOptions) => void;
  currentSelected: IRegressionLineOptions | null;
  showColorPicker?: boolean;
}

export function RegressionLineOptions({ callback, currentSelected, showColorPicker }: RegressionLineOptionsProps) {
  return (
    <Stack>
      <Input.Wrapper>
        <Select
          data-testid="RegressionLineSelect"
          searchable
          label={
            <HelpHoverCard
              title={
                <Text size="sm" fw={500}>
                  Regression line
                </Text>
              }
              content="Select the type of regression line you would like to fit to the data."
            />
          }
          styles={{
            label: {
              width: '100%',
            },
          }}
          onChange={(s) => callback({ ...currentSelected, type: s as ERegressionLineType })}
          name="regression line types"
          maxDropdownHeight={200}
          data={Object.values(ERegressionLineType).map((o) => {
            return {
              value: o,
              label: o,
            };
          })}
          value={currentSelected?.type || ERegressionLineType.NONE}
        />
      </Input.Wrapper>
      {currentSelected?.type === ERegressionLineType.POLYNOMIAL && (
        <Input.Wrapper label="Order">
          <SegmentedControl
            data-testid="PolynomialRegressionOption"
            fullWidth
            size="xs"
            value={`${currentSelected.fitOptions?.order}`}
            onChange={(s) => callback({ ...currentSelected, fitOptions: { ...currentSelected.fitOptions, order: Number.parseInt(s, 10) } })}
            data={[
              { label: 'Quadratic', value: '2' },
              { label: 'Cubic', value: '3' },
            ]}
          />
        </Input.Wrapper>
      )}
      {showColorPicker && currentSelected?.type !== ERegressionLineType.NONE && (
        <Input.Wrapper label="Line color">
          <Group data-testid="RegressionLineColor">
            {currentSelected?.lineStyle?.colors?.map((color, idx) => (
              <ColorSwatch
                data-testid="ColorSwatch"
                key={color}
                component="button"
                color={color}
                style={{ color: '#fff', cursor: 'pointer' }}
                onClick={() => callback({ ...currentSelected, lineStyle: { ...currentSelected.lineStyle, colorSelected: idx } })}
              >
                {currentSelected.lineStyle.colorSelected === idx && <CheckIcon style={{ width: rem(12), height: rem(12) }} />}
              </ColorSwatch>
            ))}
          </Group>
        </Input.Wrapper>
      )}
    </Stack>
  );
}

/**
 * Determine the coefficient of determination (r^2) of a fit from the observations
 * and predictions.
 *
 * @param {RegressionData} data - Pairs of observed x-y values
 * @param {RegressionData} results - Pairs of observed predicted x-y values
 *
 * @return {number} - The r^2 value, or NaN if one cannot be calculated.
 */
function determinationCoefficient(data: RegressionData, results: RegressionData) {
  const predictions = [];
  const observations = [];

  data.forEach((d, i) => {
    if (d[1] !== null) {
      observations.push(d);
      predictions.push(results[i]);
    }
  });

  const sum = observations.reduce((a, observation) => a + observation[1], 0);
  const mean = sum / observations.length;

  const ssyy = observations.reduce((a, observation) => {
    const difference = observation[1] - mean;
    return a + difference * difference;
  }, 0);

  const sse = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + residual * residual;
  }, 0);

  return 1 - sse / ssyy;
}

/**
 * Determine the solution of a system of linear equationArrays A * x = b using
 * Gaussian elimination.
 *
 * @param {RegressionData} input - A 2-d matrix of data in row-major form [ A | b ]
 * @param {number} order - How many degrees to solve for
 *
 * @return {number[]} - Vector of normalized solution coefficients matrix (x)
 */
function gaussianElimination(input: RegressionData, order: number): number[] {
  const matrix = input;
  const n = input.length - 1;
  const coefficients = [order];

  for (let i = 0; i < n; i++) {
    let maxrow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[i][j]) > Math.abs(matrix[i][maxrow])) {
        maxrow = j;
      }
    }

    for (let k = i; k < n + 1; k++) {
      const tmp = matrix[k][i];
      matrix[k][i] = matrix[k][maxrow];
      matrix[k][maxrow] = tmp;
    }

    for (let j = i + 1; j < n; j++) {
      for (let k = n; k >= i; k--) {
        matrix[k][j] -= (matrix[k][i] * matrix[i][j]) / matrix[i][i];
      }
    }
  }

  for (let j = n - 1; j >= 0; j--) {
    let total = 0;
    for (let k = j + 1; k < n; k++) {
      total += matrix[k][j] * coefficients[k];
    }

    coefficients[j] = (matrix[n][j] - total) / matrix[j][j];
  }

  return coefficients;
}

/**
 * Round a number to a precision, specificed in number of decimal places
 *
 * @param {number} number - The number to round
 * @param {number} precision - The number of decimal places to round to:
 *                             > 0 means decimals, < 0 means powers of 10
 *
 *
 * @return {number} - The number, rounded
 */
function round(number: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

/**
 * The set of all fitting methods
 *
 * @namespace
 */
const methods = {
  linear(data: RegressionData, options: IRegressionFitOptions) {
    const sum = [0, 0, 0, 0, 0];
    let len = 0;

    let min = null;
    let max = null;
    for (let n = 0; n < data.length; n++) {
      if (data[n][0] && data[n][1]) {
        if (min === null || data[n][0] < min) {
          min = data[n][0];
        }
        if (max === null || data[n][0] > max) {
          max = data[n][0];
        }
        len++;
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0];
        sum[3] += data[n][0] * data[n][1];
        sum[4] += data[n][1] * data[n][1];
      }
    }

    const run = len * sum[2] - sum[0] * sum[0];
    const rise = len * sum[3] - sum[0] * sum[1];
    const gradient = run === 0 ? 0 : round(rise / run, options.precision);
    const intercept = round(sum[1] / len - (gradient * sum[0]) / len, options.precision);

    const predict = (x: number) => [round(x, options.precision), round(gradient * x + intercept, options.precision)];

    const points = data.map((point) => predict(point[0]));
    const r2 = determinationCoefficient(data, points);

    // Do a F-test --> F = (r^2 / k) / ((1 - r^2) / (n - k - 1))
    const F = r2 / ((1 - r2) / (len - 2));
    const pValue = ftest(F, 1, len - 2) as number; // F-test with k = #predictors = 1, dfn = k, dfd = n - k - 1

    return {
      stats: {
        r2: round(r2, options.precision),
        n: len,
        pValue: Number.isNaN(pValue) ? null : pValue,
      },
      equation: intercept === 0 ? `y = ${gradient}x` : `y = ${gradient}x + ${intercept}`,
      svgPath: `M ${min} ${predict(min)[1]} L ${max} ${predict(max)[1]}`,
    };
  },
  polynomial(data: RegressionData, options: IRegressionFitOptions) {
    const lhs = [];
    const rhs = [];
    let a = 0;
    let b = 0;
    const len = data.length;
    const k = options.order + 1;

    let min = null;
    let max = null;
    for (let i = 0; i < k; i++) {
      for (let l = 0; l < len; l++) {
        if (data[l][0] && data[l][1]) {
          if (min === null || data[l][0] < min) {
            min = data[l][0];
          }
          if (max === null || data[l][0] > max) {
            max = data[l][0];
          }
        }
        if (data[l][1] !== null) {
          a += data[l][0] ** i * data[l][1];
        }
      }

      lhs.push(a);
      a = 0;

      const c = [];
      for (let j = 0; j < k; j++) {
        for (let l = 0; l < len; l++) {
          if (data[l][1] !== null) {
            b += data[l][0] ** (i + j);
          }
        }
        c.push(b);
        b = 0;
      }
      rhs.push(c);
    }
    rhs.push(lhs);

    const coefficients = gaussianElimination(rhs, k).map((v) => round(v, options.precision));

    const predict = (x: number) => [
      round(x, options.precision),
      round(
        coefficients.reduce((sum, coeff, power) => sum + coeff * x ** power, 0),
        options.precision,
      ),
    ];

    const points = data.map((point) => predict(point[0]));

    let equation = 'y = ';
    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (i > 1) {
        equation += `${coefficients[i]}x^${i} + `;
      } else if (i === 1) {
        equation += `${coefficients[i]}x + `;
      } else {
        equation += coefficients[i];
      }
    }

    // SVG does not support polynomial curves, so we approximate it using bezier curves
    const samples = [...Array.from({ length: 100 }, (_, i) => min + ((max - min) * i) / 100)].map((x) => predict(x));
    const bezier = fitCurve(samples, 50);
    const svgPath = bezier
      .map((curve) => `M ${curve[0][0]} ${curve[0][1]} C ${curve[1][0]} ${curve[1][1]}, ${curve[2][0]} ${curve[2][1]}, ${curve[3][0]} ${curve[3][1]}`)
      .join(' ');

    const r2 = determinationCoefficient(data, points);
    const pValue = null; // did not define p-value for exponential regression

    return {
      stats: {
        n: data.length,
        r2: round(r2, options.precision),
        pValue,
      },
      equation,
      svgPath,
    };
  },
};

const regressionMethodsMapping = {
  [ERegressionLineType.LINEAR]: 'linear',
  [ERegressionLineType.POLYNOMIAL]: 'polynomial',
};

export const fitRegressionLine = (
  data: Partial<Plotly.PlotData>,
  method: ERegressionLineType,
  options: IRegressionFitOptions = DEFAULT_CURVE_FIT_OPTIONS,
): IRegressionResult => {
  // Filter out null or undefined values (equivalent to pd.dropna())
  const filteredPairs = (data.x as number[]).map((value, index) => ({ x: value, y: data.y[index] })).filter((pair) => pair.x != null && pair.y != null);
  const x = filteredPairs.map((pair) => pair.x);
  const y = filteredPairs.map((pair) => pair.y);

  const pearsonRho = round(corrcoeff(x, y), options.precision);
  const spearmanRho = round(spearmancoeff(x, y), options.precision);
  const regressionResult = regressionMethodsMapping[method]
    ? methods[regressionMethodsMapping[method]](
        x.map((val, i) => [val, y[i]]),
        options,
      )
    : null;
  return {
    ...regressionResult,
    stats: { ...regressionResult.stats, pearsonRho, spearmanRho },
    xref: data.xaxis,
    yref: data.yaxis,
  };
};
