let baseTemp;

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
        .then(res => res.json())
        .then(data => {
            baseTemp = data.baseTemperature;
            createViz(data.monthlyVariance);
        });
});

function createViz(data) {
    const tempDisplay = [
        {
            min: 2.8,
            max: 3.9,
            fill: "#3d4e87"
        },
        {
            min: 3.9,
            max: 5.0,
            fill: "#5a71bf"
        },
        {
            min: 5.0,
            max: 6.1,
            fill: "#96aeff"
        },
        {
            min: 6.1,
            max: 7.2,
            fill: "#cdd7f7"
        },
        {
            min: 7.2,
            max: 8.3,
            fill: "#f6f7cd"
        },
        {
            min: 8.3,
            max: 9.5,
            fill: "#FDDA63"
        },
        {
            min: 9.5,
            max: 10.6,
            fill: "#faa032"
        },
        {
            min: 10.6,
            max: 11.7,
            fill: "#fc2c03"
        },
        {
            min: 11.7,
            max: 12.8,
            fill: "#822100"
        }
    ];

    const tempToColor = (temp) => {
        if (temp < tempDisplay[0].min) {
            return tempDisplay[0].fill;
        }
        if (temp > tempDisplay[tempDisplay.length - 1].max) {
            return tempDisplay[tempDisplay.length - 1].fill;
        }
        for (let i = 0; i < tempDisplay.length; i++) {
            if (temp > tempDisplay[i].min && temp <= tempDisplay[i].max) {
                return tempDisplay[i].fill;
            }
        }
    };

    const width = 1300;
    const height = 400;
    const padding = 75;

    let minYear = d3.min(data, d => d.year);
    let maxYear = d3.max(data, d => d.year);
    let barWidth = width / (maxYear - minYear);
    let barHeight = height / 12;

    const svg = d3.select('#viz')
                  .append('svg')
                  .attr('width', width + padding)
                  .attr('height', height + 30);

    const tooltip = d3.select('#viz')
                      .append('div')
                      .attr('id', 'tooltip')
                      .style('opacity', 0);

    const xScale = d3.scaleLinear().domain([minYear - 1, maxYear + 1]).range([0, width]);
    const yScale = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).rangeRound([0, height]);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0).ticks(20).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0).tickValues(yScale.domain()).tickFormat(month => {
        let date = new Date();
        date.setMonth(month);
        return date.toLocaleString('default', { month: 'long' });
    });
    svg.append('g')
       .call(xAxis)
       .attr('id', 'x-axis')
       .attr('transform', 'translate(' + (padding + 3) + ', ' + (height - 3) + ')');
    svg.append('g')
       .call(yAxis)
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + (padding + 3)  + ', -3)');

    svg.selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr('class', 'cell')
       .attr('data-month', d => d.month - 1)
       .attr('data-year', d => d.year)
       .attr('data-temp', d => baseTemp + d.variance)
       .attr('width', barWidth)
       .attr('height', barHeight)
       .attr('x', d => xScale(d.year))
       .attr('y', d => yScale(d.month - 1))
       .attr('fill', d => tempToColor(baseTemp + d.variance))
       .attr('transform', 'translate(' + padding + ', -2)')
       .on('mouseover', function(d, i) {
            let month = new Date()
            month.setMonth(d.month - 1)
            month = month.toLocaleString('default', { month: 'long' });
            let temp = Math.round((baseTemp + d.variance) * 10) / 10;
            let newVariance = Math.round(d.variance * 10) / 10;
            tooltip.style('opacity', 0.9)
            .attr('data-year', d.year)
            .style('left', xScale(d.year) - 10 + 'px')
            .style('top', yScale(d.month - 1) - 100 + 'px')
            .html(d.year + ' - ' + month + '<br>' + temp + "\u00B0C" + '<br>' + newVariance + '\u00B0C');
       })
       .on('mouseout', function() {
           tooltip.style('opacity', 0)
       });

       const legend = d3.select('#container')
                        .append('svg')
                        .attr('id', 'legend')
                        .attr('width', 370)
                        .attr('height', 60);

        const legendScale = d3.scaleBand().domain([...tempDisplay.map(item => item.min), 12.8]).rangeRound([0, 300]);
        const legendAxis = d3.axisBottom(legendScale).tickSizeOuter(0).ticks(10).tickFormat(d3.format(".1f"));
        legend.append('g')
              .call(legendAxis)
              .attr('transform', 'translate(34, 30)');
        legend.selectAll('rect')
              .data(tempDisplay)
              .enter()
              .append('rect')
              .attr('width', 30)
              .attr('height', 30)
              .attr('fill', d => d.fill)
              .attr('x', (d, i) => i * 30 + 50)
              .attr('y', (d, i) => 0);
}