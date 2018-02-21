import _ from 'lodash';
import * as d3 from 'd3';
// import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';

import {getWikipediaPageUrl} from '../utils';

import {
  GraphSvg,
  GraphWrapper,
  Instructions,
  Legend,
  LegendCircle,
  LegendItem,
  LegendLabel,
  ResetButton,
} from './Graph.styles';

const DEFAULT_CHART_WIDTH = 800;
const DEFAULT_CHART_HEIGHT = 600;

class Graph extends Component {
  constructor() {
    super();

    this.graph = null;
    this.nodes = null;
    this.links = null;
    this.zoomable = null;
    this.nodeLabels = null;
    this.simulation = null;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.zoom = d3.zoom().on('zoom', () => this.zoomed());
  }

  // state = {
  //   tooltip: null,
  // };

  // setTooltip(tooltip) {
  //   this.setState({
  //     tooltip,
  //   });
  // }

  /* Returns graph data, including a list of nodes, a list of links, and the length of each path. */
  getGraphData() {
    const {paths} = this.props;

    const nodesData = [];
    const linksData = [];

    paths.forEach((path) => {
      path.forEach((node, i) => {
        const currentNodeId = node.title;

        // Add node if it has not yet been added by some other path.
        if (!_.some(nodesData, ['id', currentNodeId])) {
          nodesData.push({
            id: currentNodeId,
            title: node.title,
            degree: i,
          });
        }

        // Add link if this is not the start node.
        if (i !== 0) {
          linksData.push({
            source: path[i - 1].title,
            target: currentNodeId,
          });
        }
      });
    });

    return {
      nodesData,
      linksData,
      pathsLength: paths[0].length,
    };
  }

  /* Returns a list of labels for use in the legend. */
  getLegendLabels() {
    const {paths} = this.props;
    const pathsLength = paths[0].length;

    return _.map(_.range(0, pathsLength), (i) => {
      if (i === 0 && pathsLength === 1) {
        return 'Start / end page';
      } else if (i === 0) {
        return 'Start page';
      } else if (i === pathsLength - 1) {
        return 'End page';
      } else {
        const degreeOrDegrees = i === 1 ? 'degree' : 'degrees';
        return `${i} ${degreeOrDegrees} away`;
      }
    });
  }

  /* Updates element locations on every tick of the force simulation. */
  ticked() {
    this.links
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    this.nodes.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    this.nodeLabels.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
  }

  /* Updates the zoom level of the graph when a zoom event occurs. */
  zoomed() {
    this.graph.attr(
      `transform`,
      `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${d3.event.transform.k})`
    );
  }

  /* Drag started event. */
  dragstarted(d) {
    if (!d3.event.active) {
      console.log('RESTART');
      this.simulation.alphaTarget(0.3).restart();
    }
    console.log(d.x, d.y);
    d.fx = d.x;
    d.fy = d.y;
  }

  /* Dragged event. */
  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  /* Drag ended event. */
  dragended(d) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  componentDidMount() {
    const {nodesData, linksData, pathsLength} = this.getGraphData();

    this.zoomable = d3
      .select(this.graphRef)
      .attr('width', DEFAULT_CHART_WIDTH)
      .attr('height', DEFAULT_CHART_HEIGHT)
      .call(this.zoom)
      .on('dblclick.zoom', null);

    this.graph = this.zoomable.append('g');

    this.graph
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    this.links = this.graph
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('stroke', (d) => '#000')
      .attr('marker-end', 'url(#arrow)');

    this.nodes = this.graph
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodesData)
      .enter()
      .append('circle')
      .attr('r', (d) => {
        if (d.degree === 0 || d.degree === pathsLength - 1) {
          return 10;
        } else {
          return 6;
        }
      })
      .attr('fill', (d) => this.color(d.degree))
      .attr('stroke', (d) => d3.rgb(this.color(d.degree)).darker(2))
      .call(
        d3
          .drag()
          .on('start', this.dragstarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('end', this.dragended.bind(this))
      );

    this.nodeLabels = this.graph
      .append('g')
      .attr('class', 'labels')
      .selectAll('g')
      .data(nodesData)
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', '.31em')
      .style('font-family', 'Quicksand')
      .style('font-size', '12px')
      .text((d) => d.title);

    // Open Wikipedia page when node is double clicked.
    this.nodes.on('dblclick', (d) => {
      window.open(getWikipediaPageUrl(d.id), '_blank');
    });

    // Force simulation.
    this.simulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().id((d) => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(DEFAULT_CHART_WIDTH / 2, DEFAULT_CHART_HEIGHT / 2));

    this.simulation.nodes(nodesData).on('tick', () => this.ticked());
    this.simulation.force('link').links(linksData);
  }

  /* Resets the graph to its original location. */
  resetGraph() {
    this.zoomable
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  /* Renders the legend. */
  renderLegend() {
    const legendContent = this.getLegendLabels().map((label, i) => {
      return (
        <LegendItem key={i}>
          <LegendCircle fill={this.color(i)} stroke={d3.rgb(this.color(i)).darker(2)} />
          <LegendLabel>{label}</LegendLabel>
        </LegendItem>
      );
    });
    return <Legend>{legendContent}</Legend>;
  }

  render() {
    // const {tooltip} = this.state;

    // let tooltipContent;
    // if (tooltip !== null) {
    //   tooltipContent = (
    //     <Tooltip x={tooltip.x} y={tooltip.y}>
    //       {tooltip.children}
    //     </Tooltip>
    //   );
    // }

    return (
      <GraphWrapper>
        {this.renderLegend()}

        <Instructions>
          <p>Drag to pan. Scroll to zoom.</p>
          <p>Double click node to open Wikipedia page in new tab.</p>
        </Instructions>

        <ResetButton onClick={this.resetGraph.bind(this)}>Reset</ResetButton>

        <GraphSvg innerRef={(r) => (this.graphRef = r)} />
      </GraphWrapper>
    );
  }
}

// TODO: add prop types
Graph.propTypes = {};

export default Graph;
