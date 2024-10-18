import React from 'react';
import { StructureViewConfig } from '../../../../types/structure.types';
import { Molecule, Vertex } from '../../../../types/molecule.types';
import heatmapService from '../../../../services/heatmap.service';
import { clearDivChildren, equalArrays, isEmptyNullUndefined } from '../../../../util';
import gradientsService from '../../../../services/gradients.service';
import colorsService from '../../../../services/colors.service';

interface Props {
  molecule: Molecule;
  vertices: Vertex[] | undefined; // workaround to control rerender
  config: StructureViewConfig;
  scaleResolution: number;
}

class Heatmap extends React.PureComponent<Props> {
  private divRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.updateHeatmap();
  }

  componentDidUpdate() {
    this.updateHeatmap();
  }

  updateHeatmap() {
    const div = this.divRef.current;
    const { molecule, config, scaleResolution } = this.props;

    if (div && !isEmptyNullUndefined(molecule.vertices)) {
      clearDivChildren(div);
      heatmapService.appendHeatmap(div, molecule, config.gradient, scaleResolution);
    }
  }

  render() {
    const { width, height } = this.props.config;
    return (
      <div style={{ position: 'absolute', zIndex: 0, width: '100%', height: '100%' }}>
        <div ref={this.divRef} className="Heatmap" style={{ position: 'absolute', zIndex: 0, width: '100%', height: '100%' }} />
      </div>
    );
  }
}

function areEqual(prevProps: Props, nextProps: Props) {
  const pGrad = prevProps.config.gradient;
  const nGrad = nextProps.config.gradient;
  const equalColorDomain = equalArrays(pGrad.colorDomain, nGrad.colorDomain);
  const equalThresholds = equalArrays(pGrad.thresholds, nGrad.thresholds);
  const equalDeadzone = pGrad.deadzone === nGrad.deadzone;
  const equalNegColors = gradientsService.equalColorMaps(pGrad.colors.negative, nGrad.colors.negative);
  const equalPosColors = gradientsService.equalColorMaps(pGrad.colors.positive, nGrad.colors.positive);
  const equalHighlight = pGrad.highlight === nGrad.highlight;
  const equalPalette = colorsService.equalPalettes(pGrad.palette, nGrad.palette);
  const equalBlur = pGrad.blur === nGrad.blur;
  const equalOpacity = pGrad.opacity === nGrad.opacity;

  return (
    prevProps.vertices === nextProps.vertices &&
    nextProps.vertices != null &&
    equalArrays(prevProps.vertices!, nextProps.vertices!) &&
    equalColorDomain &&
    equalThresholds &&
    equalDeadzone &&
    equalNegColors &&
    equalPosColors &&
    equalHighlight &&
    equalPalette &&
    equalBlur &&
    equalOpacity
  );
}

export default React.memo(Heatmap, areEqual);
