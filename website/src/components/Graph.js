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

// TODO: move into state?
let zoom;
let graph;

const color = d3.scaleOrdinal(d3.schemeCategory10);

class Graph extends Component {
  // state = {
  //   tooltip: null,
  // };

  // setTooltip(tooltip) {
  //   this.setState({
  //     tooltip,
  //   });
  // }

  getGraphData() {
    const {paths} = this.props;

    const nodes = [];
    const links = [];

    paths.forEach((path) => {
      path.forEach((node, i) => {
        const currentNodeId = node.title;

        // Add node if it has not yet been added by some other path.
        if (!_.some(nodes, ['id', currentNodeId])) {
          nodes.push({
            id: currentNodeId,
            title: node.title,
            degree: i,
          });
        }

        // Add link if this is not the start node.
        if (i !== 0) {
          links.push({
            source: path[i - 1].title,
            target: currentNodeId,
          });
        }
      });
    });

    return {
      nodesData: nodes,
      linksData: links,
      pathsLength: paths[0].length,
    };
  }

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

  componentDidMount() {
    const {nodesData, linksData, pathsLength} = this.getGraphData();

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
      .data(linksData)
      .enter()
      .append('line')
      .attr('stroke', (d) => '#000')
      .attr('marker-end', 'url(#arrow)');

    var node = zoomableGraph
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
      .data(nodesData)
      .enter()
      .append('text')
      .attr('x', 10)
      .attr('y', '.31em')
      .style('font-family', 'Quicksand')
      .style('font-size', '12px')
      .text((d) => d.title);

    node.on('dblclick', function(d) {
      window.open(getWikipediaPageUrl(d.id), '_blank');
    });

    node.append('title').text((d) => d.title);

    simulation.nodes(nodesData).on('tick', ticked);

    simulation.force('link').links(linksData);
  }

  resetGraph() {
    graph.transition().call(zoom.transform, d3.zoomIdentity);
  }

  renderLegend() {
    const legendContent = this.getLegendLabels().map((label, i) => {
      return (
        <LegendItem key={i}>
          <LegendCircle fill={color(i)} stroke={d3.rgb(color(i)).darker(2)} />
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

        <ResetButton onClick={this.resetGraph}>Reset</ResetButton>

        <GraphSvg innerRef={(r) => (this.graphRef = r)} />
      </GraphWrapper>
    );
  }
}

// TODO: add prop types
Graph.propTypes = {};

export default Graph;
