// set the dimensions and margin of the graph
const canvasMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

const canvasWrapper = d3.select(".header__graph")

// Set outer dimensions
const {
  width,
  height
} = canvasWrapper.node().getBoundingClientRect()

// Init Canvas
const canvasChart = d3.select(".header__graph")
  .append('canvas')
  .attr('width', width)
  .attr('height', height)
  .style('margin-left', canvasMargin.left + 'px')
  .style('margin-top', canvasMargin.top + 'px')
  .attr('class', 'canvas-plot');

const context = canvasChart.node().getContext('2d');

// set radius scale
const sizeScale = d3.scalePow()

if (width > 768) {
  sizeScale.range([1, 2]);
} else {
  sizeScale.range([0.5, 1.5]);
}

const colourScalePastel = d3.scaleOrdinal()
  .domain([2014, 2015, 2016, 2017, 2018, 2019])
  .range(["#f7f7f7", "#cccccc", "#969696", "#374bf5", "#636363", "#252525"]);

const duration = 2400;
const ease = d3.easeLinear;

var timeScale = d3.scaleLinear()
  .domain([0, duration])
  .range([0, 1]);

// circular parameters
const radius = Math.min(width, height) / 2; // radius of the whole chart

const r = d3.scaleLinear()
  .range([0, radius]);

if (width > 600) {
  r.domain([-4, 28])

} else {
  r.domain([-4, 12])
}

const line = d3.lineRadial()
  .radius(function(d) {
    return r(d[1]);
  })
  .angle(function(d) {
    return -d[0] + Math.PI / 2;
  });

const files = ['data/data.csv']

var myTarget = document.querySelector('#home')

window.addEventListener('scroll', function() {
  let distance = myTarget.offsetTop + myTarget.offsetHeight / 2 - window.scrollY
  if (distance <= 0) {
    d3.select(".header__graph").classed("hide", true)
  } else {
    d3.select(".header__graph").classed("hide", false)
  }
})

// Read the data
Promise.all(files.map(url => d3.csv(url)))
  .then(([data]) => {
    const parseDate = d3.timeParse('%Y-%m-%d')


    data.forEach((d) => {
      d.date = parseDate(d.date),
        d.hour_num = +d.hour_num,
        d.words = +d.words,
        d.day_of_the_year = +d.day_of_the_year
    })

    points = data
      .map(d => ({
        day_of_the_year: d.day_of_the_year,
        hour_num: d.hour_num,
        words: d.words,
        year: d.year,
        alpha: 0.4
      }))

    // Add r scale
    sizeScale.domain(d3.extent(data, d => d.words))

    draw(data)
    animate()

  })

const draw = function(inputData) {

  context.save();

  // erase what is on the canvas currently
  context.clearRect(0, 0, width, height);

  // Draw on canvas
  points.forEach(point => {
    drawPoint(point);
  });

  context.restore();
}

function drawPoint(point) {
  let coors = line([[reMap(point.day_of_the_year), point.hour_num]]).slice(1).slice(0, -1).split(",").map(function(x) {
    return parseInt(x, 10);
  });; // removes 'M' and 'Z' from string
  context.beginPath();
  context.globalAlpha = 0.4;
  context.fillStyle = colourScalePastel(point.year);

  context.arc(coors[[0]] + width / 2, coors[[1]] + height / 2, sizeScale(point.words), 0, 2 * Math.PI, true);
  context.fill();
}

const reMap = function(oldValue) {
  var oldMin = 0,
    oldMax = -359,
    newMin = 0,
    newMax = (Math.PI * 2),
    newValue = (((oldValue - 90 - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;

  return newValue;

}

// animate the points to a given layout
function animate() {
  // store the source position
  points.forEach(point => {
    point.swords = point.words;
    point.shour_num = point.hour_num;
    point.sday_of_the_year = point.day_of_the_year;
  });

  function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const rndInt = randomIntFromInterval(1, 6)

  // store the destination position
  points.forEach(point => {
    point.twords = Math.abs(point.words + randomIntFromInterval(-100, 100))
    point.thour_num = point.hour_num + randomIntFromInterval(-0.1, 0.1)
    point.tday_of_the_year = point.day_of_the_year + randomIntFromInterval(0, 3)
  });

  timer = d3.timer((elapsed) => {
    // compute how far through the animation we are (0 to 1)
    const t = Math.min(1, ease(elapsed / duration));

    // update point positions (interpolate between source and target)
    points.forEach(point => {
      point.words = point.swords * (1 - t) + point.twords * t;
      point.hour_num = point.shour_num * (1 - t) + point.thour_num * t;
      point.day_of_the_year = point.sday_of_the_year * (1 - t) + point.tday_of_the_year * t;
    });

    // update what is drawn on screen
    draw();

    // if this animation is over
    if (t === 1) {
      // stop this timer for this layout and start a new one
      timer.stop();

      // start animation for next layout
      animate();
    }
  });
}