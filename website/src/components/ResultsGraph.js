import map from 'lodash/map';
import some from 'lodash/some';
import range from 'lodash/range';
import forEach from 'lodash/forEach';
import debounce from 'lodash/debounce';
import * as d3 from 'd3';
// import {findDOMNode} from 'react-dom';
import React, { Component, useCallback, useEffect } from 'react';

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
} from './ResultsGraph.styles';

const DEFAULT_CHART_HEIGHT = 600;

const Graph = props => {
  const {
    paths
  } = props;

  useEffect(() => {
    const pathsLength = paths[0].length;
    const targetPageTitle = paths[0][pathsLength - 1].title;

    const {nodesData, linksData} = getGraphDataHandler();

    // Update the nubmer of ticks of the force simulation to run for each render according to how
    // many nodes will be rendered.
    ticksPerRenderHandler = 3 + Math.floor(nodesData.length / 20);

    graphWidthHandler = getGraphWidthHandler();

    zoomableHandler = d3
      .select(graphRefHandler)
      .attr('width', '100%')
      .attr('height', '100%')
      .call(zoomHandler);

    graphHandler = zoomableHandler.append('g');

    // Direction arrows.
    const defs = graphHandler.append('defs');

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
    linksHandler = graphHandler
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
    nodesHandler = graphHandler
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
      .attr('fill', (d) => colorHandler(d.degree))
      .attr('stroke', (d) => d3.rgb(colorHandler(d.degree)).darker(2))
      .call(
        d3
          .drag()
          .on('start', dragstartedHandler.bind(this))
          .on('drag', draggedHandler.bind(this))
          .on('end', dragendedHandler.bind(this))
      );

    // Node labels.
    nodeLabelsHandler = graphHandler
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
    nodesHandler.on('click', (d) => {
      window.open(getWikipediaPageUrl(d.id), '_blank');
    });

    // Force simulation.
    simulationHandler = d3
      .forceSimulation()
      .force(
        'link',
        d3.forceLink().id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(500))
      .force('center', d3.forceCenter(graphWidthHandler / 2, DEFAULT_CHART_HEIGHT / 2));

    simulationHandler.nodes(nodesData);
    simulationHandler.force('link').links(linksData);

    requestAnimationFrame(() => updateElementLocationsHandler());

    // Reset the graph on page resize.
    window.addEventListener('resize', debouncedResetGraphHandler);
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener('resize', debouncedResetGraphHandler);
    };
  });

  const getGraphWidthHandler = useCallback(() => {
    return document.querySelector('.graph-wrapper').getBoundingClientRect().width;
  }, []);

  const getGraphDataHandler = useCallback(() => {
    const nodesData = [];
    const linksData = [];

    paths.forEach((path) => {
      path.forEach((node, i) => {
        const currentNodeId = node.title;

        // Add node if it has not yet been added by some other path.
        if (!some(nodesData, ['id', currentNodeId])) {
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
    };
  }, []);

  const getLegendLabelsHandler = useCallback(() => {
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
  }, []);

  const updateElementLocationsHandler = useCallback(() => {
    for (var i = 0; i < ticksPerRenderHandler; i++) {
      simulationHandler.tick();
    }

    linksHandler
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    nodesHandler.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    nodeLabelsHandler.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    if (simulationHandler.alpha() > 0.001) {
      requestAnimationFrame(() => updateElementLocationsHandler());
    }
  }, []);

  const zoomedHandler = useCallback(() => {
    graphHandler.attr(
      `transform`,
      `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${d3.event.transform.k})`
    );
  }, []);

  const dragstartedHandler = useCallback(d => {
    if (!d3.event.active) {
      simulationHandler.alphaTarget(0.3).restart();
      requestAnimationFrame(() => updateElementLocationsHandler());
    }
    d.fx = d.x;
    d.fy = d.y;
  }, []);

  const draggedHandler = useCallback(d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }, []);

  const dragendedHandler = useCallback(d => {
    if (!d3.event.active) {
      simulationHandler.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }, []);

  const resetGraphHandler = useCallback(forceReset => {
    const priorGraphWidth = graphWidthHandler;
    graphWidthHandler = getGraphWidthHandler();

    if (forceReset || priorGraphWidth !== graphWidthHandler) {
      // Update the center of the simulation force and restart it.
      simulationHandler.force(
        'center',
        d3.forceCenter(graphWidthHandler / 2, DEFAULT_CHART_HEIGHT / 2)
      );
      simulationHandler.alpha(0.3).restart();

      // Update the width of the SVG and reset it.
      zoomableHandler.attr('width', graphWidthHandler);
      zoomableHandler.transition().duration(750).call(zoomHandler.transform, d3.zoomIdentity);

      requestAnimationFrame(() => updateElementLocationsHandler());
    }
  }, []);

  const renderLegendHandler = useCallback(() => {
    const legendContent = getLegendLabelsHandler().map((label, i) => {
      return (
        <LegendItem key={i}>
          <LegendCircle fill={colorHandler(i)} stroke={d3.rgb(colorHandler(i)).darker(2)} />
          <LegendLabel>{label}</LegendLabel>
        </LegendItem>
      );
    });
    return <Legend>{legendContent}</Legend>;
  }, []);

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
      {renderLegendHandler()}

      <Instructions>
        <p>Drag to pan. Scroll to zoom.</p>
        <p>Click node to open Wikipedia page.</p>
      </Instructions>

      <ResetButton onClick={resetGraphHandler.bind(this, true)}>
        <svg viewBox="0 0 100 100">
          <path d="m49.528 87h-0.06c-18.563 0-34.132-13.316-37.017-31.588-0.172-1.091-1.197-1.839-2.288-1.667s-1.836 1.201-1.664 2.292c3.195 20.225 20.422 34.963 40.963 34.963h0.066c11.585 0 22.714-4.672 30.542-12.814 7.451-7.751 11.311-17.963 10.869-28.751-0.952-23.211-19.169-41.394-41.474-41.394-15.237 0-29.288 8.546-36.465 21.722v-18.763c0-1.104-0.896-2-2-2s-2 0.896-2 2v25c0 1.104 0.896 2 2 2h25c1.104 0 2-0.896 2-2s-0.896-2-2-2h-20.635c6.034-13.216 19.456-21.961 34.101-21.961 20.152 0 36.613 16.497 37.476 37.557 0.397 9.688-3.067 18.861-9.755 25.818-7.078 7.361-17.156 11.586-27.659 11.586z" />
        </svg>
      </ResetButton>

      <GraphSvg ref={(r) => (graphRefHandler = r)} />
    </GraphWrapper>
  );
};

// TODO: add prop types
Graph.propTypes = {};

export default Graph;
