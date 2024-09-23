import * as d3v7 from 'd3v7';

function customForce() {

}

export function repel({
  width,
  xRange,
  yRange,
  text,
}: {
  width: number;
  xRange: [number, number];
  yRange: [number, number];
  text: {
    height: number;
    width: number;
    x: number;
    y: number;
  }[];
}) {
  const trueSize = 10;
  const scaleFactor = width / trueSize;

  const scaleX = d3v7.scaleLinear().domain([xRange[0], xRange[1]]).range([0, trueSize]);
  const scaleY = d3v7.scaleLinear().domain([yRange[0], yRange[1]]).range([0, trueSize]);

  const nodes = text.map((d, i) => ({
    x: scaleX(d.x),
    y: scaleY(d.y),
    width: Math.abs(scaleX(d.width) - scaleX(0)),
    height: Math.abs(scaleY(d.height) - scaleY(0)),
    r: Math.min(Math.abs(scaleX(d.width) - scaleX(0))) / 2,
    // width: 0.1,
    // height: 0.1,
  }));

  const padding = 0;

  // https://gist.github.com/mbostock/4055889
  const collide = () => {
    // console.log(nodes);
    // return;
    for (let k = 0, iterations = 1, strength = 0.01; k < iterations; ++k) {
      for (let i = 0, n = nodes.length; i < n; ++i) {
        for (let a = nodes[i], j = i + 1; j < n; ++j) {
          const b = nodes[j];
          const x = a.x + a.vx - b.x - b.vx;
          const y = a.y + a.vy - b.y - b.vy;
          let lx = Math.abs(x);
          let ly = Math.abs(y);
          // const r = a.r + b.r + padding;
          if (lx < b.width && ly < b.height) {
            if (lx > ly) {
              lx = (lx - b.width) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - b.height) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  };

  // Create d3 force layout
  const simulation = d3v7.forceSimulation(nodes);

  // Add repellant force
  // 12 px to normalized radius
  simulation.force('collide', d3v7.forceCollide(12 / scaleFactor).strength(0.01));
  // simulation.force('test', collide);

  simulation.force('custom', customForce);

  // Add link force to original position
  simulation.force(
    'x',
    d3v7
      .forceX((datum, index) => {
        return scaleX(text[index].x);
      })
      .strength(1),
  );

  simulation.force(
    'y',
    d3v7
      .forceY((datum, index) => {
        return scaleY(text[index].y) + 16 / scaleFactor;
      })
      .strength(1),
  );

  // Simulate 100 steps
  simulation.tick(300);

  // Get new positions
  const positions = simulation.nodes();

  return text.map((d, i) => ({
    x: scaleX.invert(positions[i].x),
    y: scaleY.invert(positions[i].y),
  }));
}
