import * as d3 from 'd3';
import debounce from 'lodash/debounce';
import map from 'lodash/map';
import range from 'lodash/range';
import some from 'lodash/some';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import styled from 'styled-components';

import {WikipediaPage, WikipediaPageId} from '../types';
import {getWikipediaPageUrl} from '../utils';
import Button from './common/Button.tsx';

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

interface GraphNode {
  readonly id: WikipediaPageId;
  readonly title: string;
  readonly degree: number;
}

interface GraphLink {
  readonly source: number;
  readonly target: number;
}

const Graph: React.FC<{
  readonly paths: readonly WikipediaPageId[][];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
}> = ({paths, pagesById}) => {
  const graphRef = useRef<SVGSVGElement | null>(null);
  const graphWrapperSizeRef = useRef<HTMLDivElement | null>(null);

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
          console.error(`Failed to find page with ID ${currentPageId} in pages dictionary`);
          return;
        }

        if (!seenNodes.has(currentPageId)) {
          nodesData.push({
            id: currentPageId,
            title: currentPage.title,
            degree: i,
          });
          seenNodes.add(currentPageId);
        }

        if (previousPageId) {
          linksData.push({
            source: previousPageId,
            target: currentPageId,
          });
        }

        previousPageId = currentPageId;
      });
    });

    return {nodesData, linksData};
  }, [pagesById, paths]);

  const simulation = useMemo(() => {
    const {nodesData, linksData} = getGraphData();
    return d3
      .forceSimulation(nodesData)
      .force(
        'link',
        d3.forceLink(linksData).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(500))
      .force('center', d3.forceCenter(getGraphWidth() / 2, DEFAULT_CHART_HEIGHT / 2))
      .on('tick', () => {
        simulation.nodes().forEach((node: any) => {
          const nodeElement = d3.select(`#node-${node.id}`);
          const linkElement = d3.select(`#link-${node.id}`);
          nodeElement.attr('cx', node.x).attr('cy', node.y);
          linkElement.attr('x1', node.x).attr('y1', node.y);
        });
      });
  }, [getGraphData, getGraphWidth]);

  useEffect(() => {
    const handleResize = debounce((event: UIEvent) => {
      if (simulation) {
        simulation.force('center', d3.forceCenter(getGraphWidth() / 2, DEFAULT_CHART_HEIGHT / 2));
        simulation.alpha(0.3).restart();
      }
    }, 350);

    window.addEventListener('resize', handleResize as EventListener);

    // const handleResize = debounce(() => {
    //   const newWidth = getGraphWidth();
    //   setGraphWidth(newWidth);
    //   sim.force('center', d3.forceCenter(newWidth / 2, DEFAULT_CHART_HEIGHT / 2));
    //   sim.alpha(0.3).restart();
    // }, 350);
    // window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize as EventListener);
    };
  }, [paths, pagesById, getGraphData, simulation, getGraphWidth]);

  const renderLegend = () => {
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

  return (
    <GraphWrapper ref={graphWrapperSizeRef}>
      {renderLegend()}

      <Instructions>
        <p>Drag to pan. Scroll to zoom.</p>
        <p>Click node to open Wikipedia page.</p>
      </Instructions>

      <ResetButton onClick={() => simulation?.restart()}>
        <svg viewBox="0 0 100 100">
          <path d="m49.528 87h-0.06c-18.563 0-34.132-13.316-37.017-31.588-0.172-1.091-1.197-1.839-2.288-1.667s-1.836 1.201-1.664 2.292c3.195 20.225 20.422 34.963 40.963 34.963h0.066c11.585 0 22.714-4.672 30.542-12.814 7.451-7.751 11.311-17.963 10.869-28.751-0.952-23.211-19.169-41.394-41.474-41.394-15.237 0-29.288 8.546-36.465 21.722v-18.763c0-1.104-0.896-2-2-2s-2 0.896-2 2v25c0 1.104 0.896 2 2 2h25c1.104 0 2-0.896 2-2s-0.896-2-2-2h-20.635c6.034-13.216 19.456-21.961 34.101-21.961 20.152 0 36.613 16.497 37.476 37.557 0.397 9.688-3.067 18.861-9.755 25.818-7.078 7.361-17.156 11.586-27.659 11.586z" />
        </svg>
      </ResetButton>

      <GraphSvg ref={graphRef} />
    </GraphWrapper>
  );
};

export default Graph;
