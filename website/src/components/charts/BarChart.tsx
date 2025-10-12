import * as d3 from 'd3';
import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useRef} from 'react';
import styled from 'styled-components';

const DEFAULT_CHART_HEIGHT = 300;

const BarChartWrapper = styled.div`
  margin: 20px auto;
  overflow: hidden;
  background-color: ${({theme}) => theme.colors.creme};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};
`;

const BarChartSvg = styled.svg`
  .bar rect {
    fill: ${({theme}) => theme.colors.darkGreen};
  }
  text {
    fill: ${({theme}) => theme.colors.darkGreen};
  }
  .bar text {
    font-size: 14px;
    text-anchor: middle;
    @media (max-width: 600px) {
      font-size: 8px;
    }
  }
  .x-axis,
  .y-axis {
    font-size: 14px;
    path,
    line {
      stroke: ${({theme}) => theme.colors.darkGreen};
    }
    @media (max-width: 600px) {
      font-size: 10px;
    }
  }
  .x-axis-label,
  .y-axis-label {
    font-size: 20px;
    text-anchor: middle;
    @media (max-width: 600px) {
      font-size: 14px;
    }
  }
`;

export const BarChart: React.FC<{readonly data: number[]}> = ({data}) => {
  const barChartRef = useRef<SVGSVGElement>(null);
  const barChartWrapperRef = useRef<HTMLDivElement>(null);
  const barChartSvgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  const getBarChartWidth = useCallback(() => {
    if (!barChartWrapperRef.current) return 0;
    // Return width of wrapper element, minus border.
    return barChartWrapperRef.current.getBoundingClientRect().width - 6;
  }, []);

  useEffect(() => {
    const resizeBarChart = () => {
      const width = getBarChartWidth();
      barChartSvgRef.current?.attr('width', width);
    };

    // Resize the bar chart on page resize.
    const handleResizeDebounced = debounce(resizeBarChart, 350);

    if (!barChartRef.current) return;

    const formatCount = d3.format(',.0f');

    // Use smaller margins on mobile.
    const width = getBarChartWidth();
    let margins = {top: 40, right: 20, bottom: 60, left: 100};
    if (width < 600) {
      margins = {top: 20, right: 20, bottom: 50, left: 80};
    }

    barChartSvgRef.current = d3
      .select(barChartRef.current)
      .attr('width', width)
      .attr('height', DEFAULT_CHART_HEIGHT + margins.top + margins.bottom);

    if (!barChartSvgRef.current) return;

    // Compute the range of the graph.
    const xScale = d3
      .scaleBand()
      .domain(d3.range(0, data.length).map(String))
      .range([0, width - margins.left - margins.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d) ?? 0])
      .range([DEFAULT_CHART_HEIGHT, 0]);

    // Add bars representing data.
    const bars = barChartSvgRef.current
      ?.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', () => `translate(${margins.left}, ${margins.top})`);

    // Actual bars.
    bars
      .append('rect')
      .attr('x', (_, i) => xScale(i.toString()) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d))
      .attr('height', (d) => DEFAULT_CHART_HEIGHT - yScale(d));

    // Add counts above bars.
    bars
      .append('text')
      .attr('x', (_, i) => (xScale(i.toString()) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d) - 4)
      .text((d) => formatCount(d));

    // Add X axis.
    barChartSvgRef.current
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margins.left}, ${DEFAULT_CHART_HEIGHT + margins.top})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d + '°'));

    // Add Y axis.
    barChartSvgRef.current
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .attr('transform', `translate(${margins.left}, ${margins.top})`);

    // Add X axis label.
    barChartSvgRef.current
      .append('text')
      .attr('class', 'x-axis-label')
      .attr(
        'transform',
        `translate(${margins.left + (width - margins.left - margins.right) / 2}, ${
          DEFAULT_CHART_HEIGHT + margins.top + margins.bottom - 10
        })`
      )
      .text('Degrees of Separation');

    // Add Y axis label.
    barChartSvgRef.current
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (DEFAULT_CHART_HEIGHT + margins.left) / 2)
      .attr('y', 26)
      .text('Number of Searches');

    window.addEventListener('resize', handleResizeDebounced);

    return () => {
      barChartSvgRef.current?.selectAll('*').remove();
      window.removeEventListener('resize', handleResizeDebounced);
    };
  }, [data, getBarChartWidth]);

  return (
    <BarChartWrapper ref={barChartWrapperRef}>
      <BarChartSvg ref={barChartRef} />
    </BarChartWrapper>
  );
};
