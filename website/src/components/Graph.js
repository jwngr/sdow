import _ from 'lodash';
import * as d3 from 'd3';
// import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';

import {getWikipediaPageUrl} from '../utils';

// TODO: update to styled-components
import './Graph.css';

const DEFAULT_CHART_WIDTH = 800;
const DEFAULT_CHART_HEIGHT = 600;

// TODO: move into state
let zoom;
let graph;

class Graph extends Component {
  // state = {
  //   tooltip: null,
  // };

  // setTooltip(tooltip) {
  //   this.setState({
  //     tooltip,
  //   });
  // }

  componentDidMount() {
    const {paths} = this.props;

    const nodeIdsSet = new Set();
    const nodesList = [];
    const linksList = [];

    const pathsLength = paths[0].length;

    _.forEach(paths, (path) => {
      let priorNodeId;
      _.forEach(path, (node, nodeIndex) => {
        const currentNodeId = node.title;

        if (!nodeIdsSet.has(currentNodeId)) {
          nodesList.push({
            id: currentNodeId,
            title: node.title,
            degree: nodeIndex,
          });

          nodeIdsSet.add(currentNodeId);
        }

        if (nodeIndex !== 0) {
          linksList.push({
            source: priorNodeId,
            target: currentNodeId,
          });
        }

        priorNodeId = currentNodeId;
      });
    });

    const legendData = [];
    for (let i = 0; i < pathsLength; ++i) {
      if (i === 0) {
        legendData[i] = 'Start page';
        if (pathsLength === 1) {
          legendData[i] += ' / end page';
        }
      } else if (i + 1 === pathsLength) {
        legendData[i] = 'End page';
      } else {
        const degreeOrDegrees = i === 1 ? 'degree' : 'degrees';
        legendData[i] = `${i} ${degreeOrDegrees} away`;
      }
    }

    const zoomed = () => {
      zoomableGraph.attr(
        'transform',
        'translate(' +
          d3.event.transform.x +
          ',' +
          d3.event.transform.y +
          ')' +
          ' scale(' +
          d3.event.transform.k +
          ')'
      );
    };

    const ticked = () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      // const NODE_RADIUS = 10;
      // node
      //   .attr('cx', (d) => {
      //     return Math.max(NODE_RADIUS, Math.min(DEFAULT_CHART_WIDTH - NODE_RADIUS, d.x));
      //   })
      //   .attr('cy', (d) => {
      //     return Math.max(NODE_RADIUS, Math.min(DEFAULT_CHART_HEIGHT - NODE_RADIUS, d.y));
      //   });

      nodeLabels.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
    };

    const dragstarted = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    const dragended = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    zoom = d3.zoom().on('zoom', zoomed);

    graph = d3
      .select(this.graphRef)
      .attr('width', DEFAULT_CHART_WIDTH)
      .attr('height', DEFAULT_CHART_HEIGHT)
      .call(zoom)
      .on('dblclick.zoom', null)
      .append('g');

    // TODO: fix class name
    const zoomableGraph = graph.append('g').attr('class', 'grAPH');

    zoomableGraph
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

    var simulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().id((d) => d.id))
      .force('charge', d3.forceManyBody())
      // .force('charge', 10)
      .force('center', d3.forceCenter(DEFAULT_CHART_WIDTH / 2, DEFAULT_CHART_HEIGHT / 2));

    simulation.force('charge').strength(-500);

    simulation
      .force('link')
      .id((d) => d.id)
      .distance(100);

    var link = zoomableGraph
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksList)
      .enter()
      .append('line')
      .attr('stroke', (d) => '#000')
      .attr('marker-end', 'url(#arrow)');

    var node = zoomableGraph
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodesList)
      .enter()
      .append('circle')
      .attr('r', (d) => {
        if (d.degree === 0 || d.degree === pathsLength - 1) {
          return 10;
        } else {
          return 6;
        }
      })
      .attr('fill', (d) => color(d.degree))
      .attr('stroke', (d) => d3.rgb(color(d.degree)).darker(2))
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    var nodeLabels = zoomableGraph
      .append('g')
      .attr('class', 'labels')
      .selectAll('g')
      .data(nodesList)
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', '.31em')
      .style('font-family', 'Quicksand')
      .style('font-size', '12px')
      .text((d) => d.title);

    // Legend
    var legend = graph
      .append('g')
      .attr('class', 'legend')
      .selectAll('g')
      .data(legendData);

    // Legend color
    legend
      .enter()
      .append('circle')
      .attr('class', 'legend-color')
      .attr('cx', 20)
      .attr('cy', (d, i) => i * 24 + 20)
      .attr('r', 6)
      .attr('fill', (d, i) => color(i))
      .attr('stroke', (d, i) => d3.rgb(color(i)).darker(2));

    // Legend labels
    legend
      .enter()
      .append('text')
      .attr('class', 'legend-label')
      .attr('x', 34)
      .attr('y', (d, i) => i * 24 + 24)
      .style('font-family', 'Quicksand')
      .style('font-size', '12px')
      .text((d) => d);

    // Notes
    var instructions = graph
      .append('g')
      .attr('class', 'instructions')
      .selectAll('g')
      .data(legendData);

    instructions
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', DEFAULT_CHART_HEIGHT - 24)
      .style('font-family', 'Quicksand')
      .style('font-size', '12px')
      .text('Drag to pan. Scroll to zoom.');

    instructions
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', DEFAULT_CHART_HEIGHT - 10)
      .style('font-family', 'Quicksand')
      .style('font-size', '12px')
      .text('Double click node to open Wikipedia page in new tab.');

    node.on('dblclick', function(d) {
      window.open(getWikipediaPageUrl(d.id), '_blank');
    });

    node.append('title').text((d) => d.title);

    simulation.nodes(nodesList).on('tick', ticked);

    simulation.force('link').links(linksList);
  }

  resetGraph() {
    graph.transition().call(zoom.transform, d3.zoomIdentity);
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
      <div className="results-graph">
        <div>
          <button className="reset-button" onClick={this.resetGraph}>
            Reset
          </button>
          <svg ref={(r) => (this.graphRef = r)} />
        </div>
      </div>
    );
  }
}

// TODO: add prop types
Graph.propTypes = {};

export default Graph;
