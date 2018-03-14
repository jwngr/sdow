import _ from 'lodash';
import * as d3 from 'd3';
import React, {Component} from 'react';

import {BarChartWrapper, BarChartSvg} from './index.styles';

const DEFAULT_CHART_HEIGHT = 300;

class BarChart extends Component {
  constructor() {
    super();

    this.barChart = null;

    this.debouncedResizeBarChart = _.debounce(this.resizeBarChart.bind(this), 350);
  }

  componentDidMount() {
    const {data} = this.props;

    const formatCount = d3.format(',.0f');

    const width = this.getBarChartWidth();
    let margins = {top: 40, right: 20, bottom: 60, left: 100};
    if (width < 600) {
      margins = {top: 20, right: 20, bottom: 50, left: 80};
    }

    this.barChart = d3
      .select(this.barChartRef)
      .attr('width', width)
      .attr('height', DEFAULT_CHART_HEIGHT + margins.top + margins.bottom);

    // set the ranges
    const xScale = d3
      .scaleBand()
      .domain(d3.range(0, data.length))
      .range([0, width - margins.left - margins.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .range([DEFAULT_CHART_HEIGHT, 0]);

    const bars = this.barChart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d) => `translate(${margins.left}, ${margins.top})`);

    // append the rectangles for the bar chart
    bars
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d))
      .attr('height', (d) => DEFAULT_CHART_HEIGHT - yScale(d));

    // add the x-axis
    this.barChart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margins.left}, ${DEFAULT_CHART_HEIGHT + margins.top})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d + '°'));

    // add the y-axis
    this.barChart
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .attr('transform', `translate(${margins.left}, ${margins.top})`);

    // Search counts above bars
    bars
      .append('text')
      .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d) - 4)
      .text((d) => formatCount(d));

    // X-axis label
    this.barChart
      .append('text')
      .attr('class', 'x-axis-label')
      .attr(
        'transform',
        `translate(${margins.left +
          (width - margins.left - margins.right) / 2}, ${DEFAULT_CHART_HEIGHT +
          margins.top +
          margins.bottom -
          10})`
      )
      .text('Degrees of Separation');

    // Y-axis label
    this.barChart
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (DEFAULT_CHART_HEIGHT + margins.left) / 2)
      .attr('y', 26)
      .text('Number of Searches');

    // Resize the bar chart on page resize.
    window.addEventListener('resize', this.debouncedResizeBarChart);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResizeBarChart);
  }

  getBarChartWidth() {
    // Return width of wrapper element, minus border.
    return document.querySelector('.bar-chart-wrapper').getBoundingClientRect().width - 6;
  }

  resizeBarChart() {
    this.barChart.attr('width', this.getBarChartWidth());
  }

  render() {
    return (
      <BarChartWrapper className="bar-chart-wrapper">
        <BarChartSvg innerRef={(r) => (this.barChartRef = r)} />
      </BarChartWrapper>
    );
  }
}

export default BarChart;
