import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useLogs } from '@/shared/hooks/useLogs';
import { Log } from '@/shared/types';

export function Activity() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { logs } = useLogs();

  useEffect(() => {
    if (!logs.length || !svgRef.current) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dailyLogs = d3.group(
      logs.filter(log => new Date(log.timestamp) >= thirtyDaysAgo),
      d => d3.timeDay.floor(new Date(d.timestamp))
    );

    // Create scales
    const xScale = d3.scaleTime()
      .domain([thirtyDaysAgo, today])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Array.from(dailyLogs.values()), d => d.length) || 0])
      .range([height, 0]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(d3.timeWeek.every(1)!)
        .tickFormat(d3.timeFormat('%b %d') as any));

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `${d}`));

    // Add activity dots
    const days = d3.timeDays(thirtyDaysAgo, today);
    
    svg.selectAll('.activity-dot')
      .data(days)
      .join('rect')
      .attr('class', 'activity-dot')
      .attr('x', d => xScale(d as Date))
      .attr('y', d => {
        const count = dailyLogs.get(d as Date)?.length || 0;
        return yScale(count);
      })
      .attr('width', Math.max(width / 31 - 2, 10))
      .attr('height', d => {
        const count = dailyLogs.get(d as Date)?.length || 0;
        return height - yScale(count);
      })
      .attr('fill', d => {
        const count = dailyLogs.get(d as Date)?.length || 0;
        return count > 0 ? '#22c55e' : '#e5e7eb';
      })
      .attr('rx', 1)
      .attr('ry', 1);

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'absolute hidden bg-black text-white px-2 py-1 rounded text-sm pointer-events-none')
      .style('z-index', 1000);

    svg.selectAll('.activity-dot')
      .on('mouseover', (event, d) => {
        const count = dailyLogs.get(d as Date)?.length || 0;
        tooltip
          .html(`${d3.timeFormat('%B %d, %Y')(d as Date)}<br>${count} logs`)
          .classed('hidden', false)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.classed('hidden', true);
      });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [logs]);

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Activity Overview</h3>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: '200px' }}
      />
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>Less</div>
        <div className="flex items-center space-x-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: level === 0 ? '#e5e7eb' : '#22c55e',
                opacity: level === 0 ? 1 : level / 4
              }}
            />
          ))}
        </div>
        <div>More</div>
      </div>
    </div>
  );
} 