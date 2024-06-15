import * as d3 from 'd3';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import range from 'lodash/range';
import some from 'lodash/some';
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
} from './ResultsGraph.styles.ts';

const DEFAULT_CHART_HEIGHT = 600;

class Graph extends Component {
  constructor() {
    super();

    this.graph = null;
    this.nodes = null;
    this.links = null;
    this.zoomable = null;
    this.graphWidth = null;
    this.nodeLabels = null;
    this.simulation = null;
    this.ticksPerRender = null;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.zoom = d3.zoom().on('zoom', () => this.zoomed());

    this.debouncedResetGraph = debounce(this.resetGraph.bind(this, false), 350);
  }

  // state = {
  //   tooltip: null,
  // };

  // setTooltip(tooltip) {
  //   this.setState({
  //     tooltip,
  //   });
  // }

  getGraphWidth() {
    return document.querySelector('.graph-wrapper').getBoundingClientRect().width;
  }

  /* Returns a list of nodes and a list of links which make up the graph. */
  getGraphData() {
    const {paths, pagesById} = this.props;

    const nodesData = [];
    const linksData = [];

    console.log('---------------');
    console.log('pagesById:', pagesById);
    paths.forEach((path) => {
      console.log('path:', path);
      path.forEach((pageId, i) => {
        const page = pagesById[pageId] ?? pagesById[String(pageId)];
        console.log('pageId:', pageId, typeof pageId);
        console.log('page:', page);
        if (!page) return;
        const currentNodeId = page.title;

        // Add node if it has not yet been added by some other path.
        if (!some(nodesData, ['id', currentNodeId])) {
          nodesData.push({
            id: currentNodeId,
            title: page.title,
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
    };
  }

  /* Returns a list of labels for use in the legend. */
  getLegendLabels() {
    const {paths} = this.props;
    const pathsLength = paths[0].length;

    return map(range(0, pathsLength), (i) => {
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

  updateElementLocations() {
    for (var i = 0; i < this.ticksPerRender; i++) {
      this.simulation.tick();
    }

    this.links
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    this.nodes.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    this.nodeLabels.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    if (this.simulation.alpha() > 0.001) {
      requestAnimationFrame(() => this.updateElementLocations());
    }
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
      this.simulation.alphaTarget(0.3).restart();
      requestAnimationFrame(() => this.updateElementLocations());
    }
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
    const {paths, pagesById} = this.props;
    const pathsLength = paths[0].length;
    const targetPageId = paths[0][pathsLength - 1];
    console.log('---------------');
    console.log('paths:', paths);
    console.log('pagesById:', pagesById);
    const targetPage = pagesById[targetPageId] ?? pagesById[String(targetPageId)];
    console.log('targetPageId:', targetPageId, typeof targetPageId);
    console.log('targetPage:', targetPage);
    if (!targetPage) return;
    const targetPageTitle = targetPage.title;

    const {nodesData, linksData} = this.getGraphData();

    // Update the nubmer of ticks of the force simulation to run for each render according to how
    // many nodes will be rendered.
    this.ticksPerRender = 3 + Math.floor(nodesData.length / 20);

    this.graphWidth = this.getGraphWidth();

    this.zoomable = d3
      .select(this.graphRef)
      .attr('width', '100%')
      .attr('height', '100%')
      .call(this.zoom);

    this.graph = this.zoomable.append('g');

    // Direction arrows.
    const defs = this.graph.append('defs');

    const markers = {
      arrow: 18,
      'arrow-end': 22,
    };

    forEach(markers, (refX, id) => {
      defs
        .append('marker')
        .attr('id', id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', refX)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');
    });

    // Links.
    this.links = this.graph
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('fill', 'none')
      .attr('marker-end', (d) => {
        // Use a different arrow marker for links to the target page since it has a larger radius.
        if (d.target === targetPageTitle) {
          return 'url(#arrow-end)';
        } else {
          return 'url(#arrow)';
        }
      });

    // Nodes.
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

    // Node labels.
    this.nodeLabels = this.graph
      .append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(nodesData)
      .enter()
      .append('text')
      .attr('x', (d) => {
        if (d.degree === 0 || d.degree === pathsLength - 1) {
          return 14;
        } else {
          return 10;
        }
      })
      .attr('y', 4)
      .text((d) => d.title);

    // Open Wikipedia page when node is double clicked.
    this.nodes.on('click', (d) => {
      window.open(getWikipediaPageUrl(d.id), '_blank');
    });

    // Force simulation.
    this.simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3.forceLink().id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(500))
      .force('center', d3.forceCenter(this.graphWidth / 2, DEFAULT_CHART_HEIGHT / 2));

    this.simulation.nodes(nodesData);
    this.simulation.force('link').links(linksData);

    requestAnimationFrame(() => this.updateElementLocations());

    // Reset the graph on page resize.
    window.addEventListener('resize', this.debouncedResetGraph);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResetGraph);
  }

  /* Resets the graph to its original location. */
  resetGraph(forceReset) {
    const priorGraphWidth = this.graphWidth;
    this.graphWidth = this.getGraphWidth();

    if (forceReset || priorGraphWidth !== this.graphWidth) {
      // Update the center of the simulation force and restart it.
      this.simulation.force(
        'center',
        d3.forceCenter(this.graphWidth / 2, DEFAULT_CHART_HEIGHT / 2)
      );
      this.simulation.alpha(0.3).restart();

      // Update the width of the SVG and reset it.
      this.zoomable.attr('width', this.graphWidth);
      this.zoomable.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);

      requestAnimationFrame(() => this.updateElementLocations());
    }
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
      <GraphWrapper className="graph-wrapper">
        {this.renderLegend()}

        <Instructions>
          <p>Drag to pan. Scroll to zoom.</p>
          <p>Click node to open Wikipedia page.</p>
        </Instructions>

        <ResetButton onClick={this.resetGraph.bind(this, true)}>
          <svg viewBox="0 0 100 100">
            <path d="m49.528 87h-0.06c-18.563 0-34.132-13.316-37.017-31.588-0.172-1.091-1.197-1.839-2.288-1.667s-1.836 1.201-1.664 2.292c3.195 20.225 20.422 34.963 40.963 34.963h0.066c11.585 0 22.714-4.672 30.542-12.814 7.451-7.751 11.311-17.963 10.869-28.751-0.952-23.211-19.169-41.394-41.474-41.394-15.237 0-29.288 8.546-36.465 21.722v-18.763c0-1.104-0.896-2-2-2s-2 0.896-2 2v25c0 1.104 0.896 2 2 2h25c1.104 0 2-0.896 2-2s-0.896-2-2-2h-20.635c6.034-13.216 19.456-21.961 34.101-21.961 20.152 0 36.613 16.497 37.476 37.557 0.397 9.688-3.067 18.861-9.755 25.818-7.078 7.361-17.156 11.586-27.659 11.586z" />
          </svg>
        </ResetButton>

        <GraphSvg ref={(r) => (this.graphRef = r)} />
      </GraphWrapper>
    );
  }
}

export default Graph;
