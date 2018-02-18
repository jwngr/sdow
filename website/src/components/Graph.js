import _ from 'lodash';
import * as d3 from 'd3';
import {schemeSet1} from 'd3-scale-chromatic';
// import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';

// TODO: update to styled-components
import './Graph.css';

const DEFAULT_CHART_WIDTH = 800;
const DEFAULT_CHART_HEIGHT = 400;

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

    _.forEach(paths, (path, pathIndex) => {
      let priorNodeId;
      _.forEach(path, (node, nodeIndex) => {
        let currentNodeId;
        if (nodeIndex === 0 || nodeIndex === pathsLength - 1) {
          currentNodeId = node.title;
        } else {
          currentNodeId = `${pathIndex}-${node.title}`;
        }

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

    nodesList.reverse();

    const zoomed = () => {
      graph.attr(
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

      text.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
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

    var color = d3.scaleOrdinal(schemeSet1);

    const graph = d3
      .select(this.graphRef)
      .attr('width', DEFAULT_CHART_WIDTH)
      .attr('height', DEFAULT_CHART_HEIGHT)
      .call(d3.zoom().on('zoom', zoomed))
      .append('g');

    graph
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

    var link = graph
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksList)
      .enter()
      .append('line')
      .attr('stroke', (d) => '#000')
      .attr('marker-end', 'url(#arrow)');

    var node = graph
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

    var text = graph
      .append('g')
      .attr('class', 'labels')
      .selectAll('g')
      .data(nodesList)
      .enter()
      .append('g');
    text
      .append('text')
      .attr('x', 10)
      .attr('y', '.31em')
      .style('font-family', 'sans-serif')
      .style('font-size', '0.7em')
      .text((d) => d.title);

    node.on('click', function(d) {
      console.log('clicked', d.id);
    });

    node.append('title').text((d) => d.title);

    simulation.nodes(nodesList).on('tick', ticked);

    simulation.force('link').links(linksList);
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
          <svg ref={(r) => (this.graphRef = r)} />
        </div>
      </div>
    );
  }
}

// TODO: add prop types
Graph.propTypes = {};

export default Graph;
