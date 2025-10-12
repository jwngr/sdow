import * as d3 from 'd3';
import debounce from 'lodash/debounce';
import map from 'lodash/map';
import range from 'lodash/range';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import styled from 'styled-components';

import {WikipediaPage, WikipediaPageId} from '../types';
import {getWikipediaPageUrl} from '../utils';
import {Button} from './common/Button';

const DEFAULT_CHART_HEIGHT = 600;

const GraphWrapper = styled.div`
  width: 800px;
  max-width: 800px;
  height: 600px;
  margin: 0 auto 40px auto;
  position: relative;
  background-color: ${({theme}) => theme.colors.creme};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};

  @media (max-width: 1200px) {
    width: 90%;
  }
`;

const GraphSvg = styled.svg`
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  .links line {
    stroke: #000;
    stroke-width: 1px;
    stroke-opacity: 0.6;
  }

  .nodes circle {
    cursor: pointer;
    stroke-width: 2px;
  }

  .node-labels text {
    font-size: 10px;
    font-family: 'Quicksand';
  }
`;

const Legend = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border: solid 2px ${({theme}) => theme.colors.darkGreen};
  background-color: ${({theme}) => theme.colors.yellow};
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 8px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

interface LegendCircleProps {
  readonly fill: string;
  readonly stroke: string;
}

const LegendCircle = styled.div<LegendCircleProps>`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  margin-right: 4px;
  background-color: ${({fill}) => fill};
  border: ${({stroke}) => `solid 2px ${stroke}`};
`;

const LegendLabel = styled.p`
  font-size: 12px;
  font-family: 'Quicksand';
`;

const Instructions = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 6px;
  border: solid 2px ${({theme}) => theme.colors.darkGreen};
  background-color: ${({theme}) => theme.colors.yellow};

  & > p {
    font-size: 12px;
    font-family: 'Quicksand';
  }
`;

const ResetButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px;
  width: 40px;
  height: 40px;
  font-size: 16px;
  border-radius: 4px;

  svg {
    stroke-width: 4;
  }
`;

interface GraphNode extends d3.SimulationNodeDatum {
  readonly id: WikipediaPageId;
  readonly title: string;
  readonly degree: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  readonly source: GraphNode;
  readonly target: GraphNode;
}

const GraphLegend: React.FC<{
  readonly paths: readonly WikipediaPageId[][];
  readonly color: d3.ScaleOrdinal<string, string, never>;
}> = ({paths, color}) => {
  const labels = map(range(0, paths[0].length), (i) => {
    if (i === 0 && paths[0].length === 1) {
      return 'Start / end page';
    } else if (i === 0) {
      return 'Start page';
    } else if (i === paths[0].length - 1) {
      return 'End page';
    } else {
      const degreeOrDegrees = i === 1 ? 'degree' : 'degrees';
      return `${i} ${degreeOrDegrees} away`;
    }
  });

  return (
    <Legend>
      {labels.map((label, i) => (
        <LegendItem key={i}>
          <LegendCircle
            fill={color(i.toString())}
            stroke={d3.rgb(color(i.toString())).darker(2).toString()}
          />
          <LegendLabel>{label}</LegendLabel>
        </LegendItem>
      ))}
    </Legend>
  );
};

export const ResultsGraph: React.FC<{
  readonly paths: readonly WikipediaPageId[][];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
}> = ({paths, pagesById}) => {
  const graphRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const graphSvgRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomableRef = useRef<d3.Selection<Element, unknown, null, undefined> | null>(null);
  const graphWrapperSizeRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const getGraphWidth = useCallback(() => {
    if (!graphWrapperSizeRef.current) return 0;
    return graphWrapperSizeRef.current.getBoundingClientRect().width;
  }, [graphWrapperSizeRef]);

  const getGraphData = useCallback(() => {
    const seenNodes = new Set<WikipediaPageId>();
    const nodesData: GraphNode[] = [];
    const linksData: GraphLink[] = [];

    paths.forEach((path) => {
      let previousPageId: WikipediaPageId | null = null;
      path.forEach((currentPageId, i) => {
        const currentPage = pagesById[currentPageId];
        if (!currentPage) {
          // eslint-disable-next-line no-console
          console.error(`Failed to find page with ID ${currentPageId} in pages dictionary`);
          return;
        }

        if (!seenNodes.has(currentPageId)) {
          nodesData.push({id: currentPageId, title: currentPage.title, degree: i});
          seenNodes.add(currentPageId);
        }

        if (previousPageId) {
          const sourceNode = nodesData.find((n) => n.id === previousPageId);
          const targetNode = nodesData.find((n) => n.id === currentPageId);
          if (!sourceNode || !targetNode) {
            // eslint-disable-next-line no-console
            console.error('Failed to find source or target node');
            return;
          }
          linksData.push({source: sourceNode, target: targetNode});
        }

        previousPageId = currentPageId;
      });
    });

    return {nodesData, linksData};
  }, [pagesById, paths]);

  const resetGraph = useCallback(() => {
    const graphWidth = getGraphWidth();

    // Reset the center of the simulation force and restart it.
    simulationRef.current?.force(
      'center',
      d3.forceCenter(graphWidth / 2, DEFAULT_CHART_HEIGHT / 2)
    );
    simulationRef.current?.alpha(0.3).restart();

    // Reset any zoom and pan.
    if (zoomRef.current) {
      zoomableRef.current
        ?.transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, [getGraphWidth]);

  const simulation = useMemo(() => {
    const {nodesData} = getGraphData();
    return d3.forceSimulation(nodesData);
  }, [getGraphData]);

  useEffect(() => {
    if (!graphRef.current) return;

    // Define zoom behavior
    zoomRef.current = d3.zoom().on('zoom', (event) => {
      if (!graphSvgRef.current) return;
      graphSvgRef.current.attr(
        `transform`,
        `translate(${event.transform.x}, ${event.transform.y}) scale(${event.transform.k})`
      );
    });

    zoomableRef.current = d3
      .select(graphRef.current as Element)
      .attr('width', '100%')
      .attr('height', '100%')
      .call(zoomRef.current);
    if (!zoomableRef.current) return;

    graphSvgRef.current = zoomableRef.current.append('g');
    if (!graphSvgRef.current) return;

    const pathsLength = paths[0].length;
    const targetPageId = pagesById[paths[0][pathsLength - 1]].id;

    const {nodesData, linksData} = getGraphData();

    // Define direction arrows.
    const defs = graphSvgRef.current.append('defs');
    [
      {id: 'arrow', refX: 18},
      {id: 'arrow-end', refX: 22},
    ].forEach(({id, refX}) => {
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

    // Insert node labels.
    const nodeLabels = graphSvgRef.current
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

    // Insert links between nodes.
    const links = graphSvgRef.current
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('fill', 'none')
      .attr('marker-end', (d) =>
        // Use a different arrow marker for links to the target page since it has a larger radius.
        d.target.id === targetPageId ? 'url(#arrow-end)' : 'url(#arrow)'
      );

    // Insert nodes. Do this after insert links so the nodes sit on top of the links.
    const nodes = graphSvgRef.current
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodesData)
      .enter()
      .append('circle')
      .attr('r', (d) => (d.degree === 0 || d.degree === pathsLength - 1 ? 10 : 6))
      .attr('fill', (d) => color(d.degree.toString()))
      .attr('stroke', (d) => d3.rgb(color(d.degree.toString())).darker(2).toString())
      .on('click', (_, node) => {
        // Open Wikipedia page when node is clicked.
        window.open(getWikipediaPageUrl(node.title), '_blank');
      })
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) {
              simulationRef.current?.alphaTarget(0.3).restart();
            }
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) {
              simulationRef.current?.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
          })
      );

    // Define a force simulation to position nodes and links.
    simulationRef.current = d3
      .forceSimulation(nodesData)
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>(linksData).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(500))
      .force('center', d3.forceCenter(getGraphWidth() / 2, DEFAULT_CHART_HEIGHT / 2))
      .on('tick', () => {
        // Update element positions on each tick.
        nodes.attr('cx', (d) => (d.x ?? 0) + 0).attr('cy', (d) => (d.y ?? 0) + 0);
        nodeLabels.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
        links
          .attr('x1', (d) => d.source.x ?? 0)
          .attr('y1', (d) => d.source.y ?? 0)
          .attr('x2', (d) => d.target.x ?? 0)
          .attr('y2', (d) => d.target.y ?? 0);
      });

    // Recenter on window resize.
    const handleResizeDebounced = debounce(resetGraph, 350);
    window.addEventListener('resize', handleResizeDebounced);

    return () => {
      graphSvgRef.current?.selectAll('*').remove();
      window.removeEventListener('resize', handleResizeDebounced);
    };
  }, [simulation, paths, pagesById, color, getGraphData, getGraphWidth, resetGraph]);

  return (
    <GraphWrapper ref={graphWrapperSizeRef}>
      <GraphLegend paths={paths} color={color} />

      <Instructions>
        <p>Drag to pan. Scroll to zoom.</p>
        <p>Click node to open Wikipedia page.</p>
      </Instructions>

      <ResetButton onClick={resetGraph}>
        <svg viewBox="0 0 100 100">
          <path d="m49.528 87h-0.06c-18.563 0-34.132-13.316-37.017-31.588-0.172-1.091-1.197-1.839-2.288-1.667s-1.836 1.201-1.664 2.292c3.195 20.225 20.422 34.963 40.963 34.963h0.066c11.585 0 22.714-4.672 30.542-12.814 7.451-7.751 11.311-17.963 10.869-28.751-0.952-23.211-19.169-41.394-41.474-41.394-15.237 0-29.288 8.546-36.465 21.722v-18.763c0-1.104-0.896-2-2-2s-2 0.896-2 2v25c0 1.104 0.896 2 2 2h25c1.104 0 2-0.896 2-2s-0.896-2-2-2h-20.635c6.034-13.216 19.456-21.961 34.101-21.961 20.152 0 36.613 16.497 37.476 37.557 0.397 9.688-3.067 18.861-9.755 25.818-7.078 7.361-17.156 11.586-27.659 11.586z" />
        </svg>
      </ResetButton>

      <GraphSvg ref={graphRef} />
    </GraphWrapper>
  );
};
