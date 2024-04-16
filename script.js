const educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
      countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const body = d3.select('body');

const svg = d3.select('svg');

const color = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeGreens[9]);

const tooltip = body
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const x = d3.scaleLinear().domain([3, 66]).rangeRound([660, 842])
const legendAxis = d3
  .axisBottom(x)
  .tickValues(d3.range(3, 75.1, (75.1 - 3) / 8))
  .tickSize(10, 1)
  .tickFormat(d => d.toFixed(0) + "%");

const path = d3.geoPath();

const legend = svg
  .append('g')
  .attr('class', 'key')
  .attr('id', 'legend');

legend
  .selectAll('rect')
  .data(color.range())
  .enter()
  .append('rect')
  .attr('width', 25)
  .attr('height', 8)
  .style('fill', (d, i) => {
    if (i > 0 && i < color.range().length - 1) {
      return d
    } else {
      return '#FFF'
    }
  })
  .attr('x', (d, i) => 610 + i * 26)
  .attr('y', 40);

legend
  .append('g')
  .call(legendAxis)
  .attr('transform', `translate(-25, 40)`);

Promise.all([d3.json(educationURL), d3.json(countyURL)])
  .then(data => {ready(data[0], data[1]); console.log(data)})
  .catch(e => console.error(e));

function ready(education, us) {
  console.log(topojson.feature(us, us.objects.counties).features);
  console.log(education);

  svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', d => d.id)
    .attr('data-education', (d, i) => (education.find(item => item.fips === d.id)).bachelorsOrHigher)
    .attr('fill', (d, i) => {
      const area = education.find(item => item.fips === d.id);

      switch (true) {
        case area.bachelorsOrHigher > 57:
          return color.range()[7];

        case area.bachelorsOrHigher > 48:
          return color.range()[6];

        case area.bachelorsOrHigher > 39:
          return color.range()[5];
    
        case area.bachelorsOrHigher > 30:
          return color.range()[4];

        case area.bachelorsOrHigher > 21:
          return color.range()[3];

        case area.bachelorsOrHigher > 12:
          return color.range()[2];

        case area.bachelorsOrHigher > 3:
          return color.range()[1];
    
        default:
          return color.range()[0];
      }
    })
    .attr('d', path)
    .on('mouseover', (event, d) => {
      const area = education.find(item => item.fips === d.id);

      tooltip
        .attr('data-education', area.bachelorsOrHigher)
        .style('opacity', 0.9)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 40}px`)
        .text(`${area.area_name}, ${area.state}: ${area.bachelorsOrHigher}`);
    })
    .on('mouseout', event => {
      tooltip.style('opacity', 0);
    });
}