import { Box, Center, Group, ScrollArea, Stack } from '@mantine/core';
import * as d3v7 from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { css } from '@emotion/css';
import { useAsync } from '../../hooks/useAsync';
import { i18n } from '../../i18n';
import { InvalidCols } from '../general';
import { EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar';
import { Hexplot } from './Hexplot';
import { IHexbinConfig } from './interfaces';
import { getHexData } from './utils';
import { LegendItem } from '../general/LegendItem';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { assignColorToNullValues } from '../general/utils';

function Legend({
  categories,
  filteredCategories,
  colorScale,
  onClick,
}: {
  categories: string[];
  filteredCategories: string[];
  colorScale: d3v7.ScaleOrdinal<string, string>;
  onClick: (string) => void;
}) {
  return (
    <ScrollArea
      data-testid="PlotLegend"
      style={{ height: '100%' }}
      scrollbars="y"
      className={css`
        .mantine-ScrollArea-viewport > div {
          display: flex !important;
          flex-direction: column !important;
        }
      `}
    >
      <Stack gap={0}>
        {categories.map((c) => {
          return <LegendItem key={c} color={colorScale(c)} label={c} onClick={() => onClick(c)} filtered={filteredCategories.includes(c)} />;
        })}
      </Stack>
    </ScrollArea>
  );
}

export function HexbinVis({
  config,
  columns,
  dimensions,
  setConfig,
  selectionCallback = () => null,
  selectedMap = {},
  showDragModeOptions = true,
  uniquePlotId,
  showDownloadScreenshot,
}: ICommonVisProps<IHexbinConfig>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('HexbinVis'), [uniquePlotId]);
  const { width, height } = dimensions;
  const { value: allColumns, status: colsStatus } = useAsync(getHexData, [columns, config.numColumnsSelected, config.color]);

  const [filteredCategories, setFilteredCategories] = React.useState<string[]>([]);

  const currentColorColumn = React.useMemo(() => {
    if (config.color && allColumns?.colorColVals) {
      return {
        allValues: allColumns.colorColVals.resolvedValues,
        filteredValues: allColumns.colorColVals.resolvedValues.filter((val) => !filteredCategories.includes(`${val.val}` as string)), // need to have a string, even if it's 'undefined' or 'null'
      };
    }

    return null;
  }, [allColumns?.colorColVals, config.color, filteredCategories]);

  const colorScale = React.useMemo(() => {
    if (!currentColorColumn?.allValues) {
      return null;
    }

    const colorOptions = currentColorColumn.allValues.map((val) => {
      return String(val.val); // need to have a string, even if it's 'undefined' or 'null'
    });

    return d3v7
      .scaleOrdinal<
        string,
        string
      >(allColumns.colorColVals.color ? Object.values(allColumns.colorColVals.color) : assignColorToNullValues(Array.from(new Set<string>(colorOptions)), [...d3v7.schemeCategory10]))
      .domain(allColumns.colorColVals.color ? Object.keys(allColumns.colorColVals.color) : Array.from(new Set<string>(colorOptions)));
  }, [currentColorColumn, allColumns]);

  return (
    <div
      className={css`
        display: grid;
        grid-template-areas:
          'toolbar corner'
          'plot legend';
        grid-template-rows: auto 1fr;
        grid-template-columns: 1fr fit-content(200px);
        grid-row-gap: 0.5rem;
      `}
      style={{ width, height }}
      id={id}
    >
      {showDragModeOptions || showDownloadScreenshot ? (
        <Center>
          <Group mt="lg">
            {showDragModeOptions ? (
              <BrushOptionButtons
                callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })}
                options={[EScatterSelectSettings.RECTANGLE, EScatterSelectSettings.PAN]}
                dragMode={config.dragMode}
              />
            ) : null}
            {showDownloadScreenshot && config.numColumnsSelected.length >= 2 ? <DownloadPlotButton uniquePlotId={id} config={config} /> : null}
          </Group>
        </Center>
      ) : null}

      {currentColorColumn ? (
        <div style={{ gridArea: 'legend', overflow: 'hidden' }}>
          <Legend
            categories={colorScale ? colorScale.domain() : []}
            filteredCategories={colorScale ? filteredCategories : []}
            colorScale={colorScale || null}
            onClick={() => {
              return null; // TODO: activate legend interactions later on by removing this line
              // filteredCategories.includes(s)
              //   ? setFilteredCategories(filteredCategories.filter((f) => f !== s))
              //   : setFilteredCategories([...filteredCategories, s]);
            }}
          />
        </div>
      ) : null}

      <Group style={{ gridArea: 'plot' }}>
        <Box
          data-testid="hexbinPlotGrid"
          style={{
            flexGrow: 1,
            position: 'relative',
            height: '100%',
            display: 'grid',
            ...(config.numColumnsSelected.length > 2
              ? { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'repeat(3, minmax(0, 1fr))', gap: '1rem 1rem' }
              : { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gridTemplateRows: 'repeat(1, minmax(0, 1fr))', gap: '1rem 1rem' }),
          }}
        >
          {config.numColumnsSelected.length < 2 ? (
            <InvalidCols headerMessage={i18n.t('visyn:vis.errorHeader')} bodyMessage={i18n.t('visyn:vis.hexbinError')} />
          ) : null}

          {config.numColumnsSelected.length === 2 && allColumns?.numColVals.length === config.numColumnsSelected.length && colsStatus === 'success' ? (
            <Hexplot
              selectionCallback={selectionCallback}
              selected={selectedMap}
              config={config}
              allColumns={allColumns}
              filteredCategories={filteredCategories}
              colorScale={colorScale}
            />
          ) : null}
          {config.numColumnsSelected.length > 2 && allColumns?.numColVals.length === config.numColumnsSelected.length && colsStatus === 'success'
            ? config.numColumnsSelected.map((xCol) => {
                return config.numColumnsSelected.map((yCol) => {
                  if (xCol.id !== yCol.id) {
                    return (
                      <Hexplot
                        multiples
                        key={yCol.id + xCol.id}
                        selectionCallback={selectionCallback}
                        selected={selectedMap}
                        config={config}
                        filteredCategories={filteredCategories}
                        allColumns={{
                          numColVals: [
                            allColumns.numColVals.find((col) => col.info.id === yCol.id),
                            allColumns.numColVals.find((col) => col.info.id === xCol.id),
                          ],
                          colorColVals: allColumns.colorColVals,
                        }}
                        colorScale={colorScale}
                      />
                    );
                  }

                  return <div key={`${xCol.id}hist`} />;
                });
              })
            : null}
        </Box>
      </Group>
    </div>
  );
}
