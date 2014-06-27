angular.module("mtvCharts", [])
  .directive("mtvChart", function(mtvWidgetsStorage) {
    return {
      scope: {},
      replace: true,
      templateUrl: "modules/candle-chart/templates/template-candle-chart.html",
      link: function(scope, element, attr) {

        var widgetData = mtvWidgetsStorage.getWidgetDataByKey(attr.key);
        var rangeInfo = {
          name: "M1",
          step: 60000
        };

        if(widgetData.settings) {
          scope.symbol = widgetData.settings.symbol;
          rangeInfo = widgetData.settings.rangeInfo;
        }


        var endTime = new Date().getTime();
        scope.activeRange = {
          timeStep: rangeInfo.step,
          endTime: endTime,
          startTime: endTime - 120 * rangeInfo.step
        };

        scope.serialize = function() {
          return {
            type: "chart",
            settings: {
              symbol: scope.symbol,
              rangeInfo: rangeInfo
            }
          };
        };
      }
    };
  })
  .directive("candleChart", function() {
    return {
      restrict: 'AE',
      scope: {
        symbol: "=",
        domain: "="
      },
      controller: "CandleChartController",
      //require: ["^priceChart", "candleChart"],
      link: function(scope, element, attrs, candleChartController) {
        // var priceChartManagerController = controllers[0];
        // var candleChartController = controllers[1];

        // priceChartManagerController.registerForResize($scope);

        scope.$on("widget:resize", function(event, arg) {
          candleChartController.update();
        });

        scope.$watch("domain", function(newDomain) {
          if (newDomain) {
            candleChartController.renderChart(element, newDomain);

          }
        }, true);
      }
    };
  })
  .controller("CandleChartController", function($scope, $timeout, TimeFramesService) {
    var priceData = {
      bars: []
    };

    var domain;
    var timeStep;
    var margin;
    var dimensions;
    var timeFormatter;

    var width;
    var height;
    var xScale;
    var yScale;
    var xScaleDepth;
    var xAxis;
    var yAxis;
    var zoom;

    var containerElement;


    // graphic elements
    var chart;
    var canvas;
    var mouseHolder;
    var xAxisG;
    var yAxisG;
    var xAxisDepthG;

    var xCross;
    var yCross;

    var title;
    var items;
    var bars;
    var lines;

    var depthItems;
    var bidsArea;
    var asksArea;
    var bidsLine;
    var asksLine;


    function init() {
      domain = calculateDomain();

      initScales();
      initCanvas();
      initAxes();

      updateDimensions(); //initCross needs dimensions
      initItems();
      initMouseHolder();
      initCross();

    }

    function calculateDomain() {
      return {
        x: [
          d3.min(priceData.bars, function(bar) {
            return bar[0];
          }),
          d3.max(priceData.bars, function(bar) {
            return bar[0] + timeStep;
          })
        ],
        y: [
          d3.min(priceData.bars, function(bar) {
            return bar[3];
          }),
          d3.max(priceData.bars, function(bar) {
            return bar[2];
          })
        ]
      };
    }

    function initScales() {
      xScale = d3.time.scale().domain(domain.x);
      yScale = d3.scale.linear().domain(domain.y).nice();

      xAxis = d3.svg.axis().orient("bottom").ticks(5);
      yAxis = d3.svg.axis().orient("right").ticks(5);

      var onZoom = function() {
        zoomed();
      };

      //I told Vitaliy I'm bringing the zoom back even if it's not perfect.
      //Its very annoying to look back at history with just panning
      zoom = d3.behavior.zoom()
        .scaleExtent([1, 1])
        .on("zoom", onZoom)
        .on("zoomstart", function() {
          d3.event.sourceEvent.stopPropagation();
        });
    }

    function initCanvas() {
      chart = d3.select(containerElement[0])
        .append("svg")
        .attr("class", "price-chart-svg");

      canvas = chart.append("g");


    }

    function initMouseHolder() {
      mouseHolder = canvas.append("rect")
        .attr("class", "price-chart-mouse")
        .on("mousemove", function() {
          onMousemove();
        })
        .on("mouseleave", function() {
          onMouseleave();
        });
    }
    function initAxes() {
      xAxisG = canvas.append("g")
        .attr("class", "price-chart-axis-x");

      yAxisG = canvas.append("g")
        .attr("class", "price-chart-axis-y");
    }

    function initItems() {

      items = canvas
        .append("svg")
        .attr("class", "price-chart-items");

      title = items
        .append("text")
        .attr("class", "price-chart-title")
        .attr("text-anchor", "middle")
        .text($scope.symbol);
    }

    function initCross() {
      xCross = canvas.append("g")
        .attr("class", "price-chart-crosshair hidden");
      xCross.append("line")
        .attr("class", "price-chart-crosshair-line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("y2", 0);
      xCross.append("text")
        .attr("class", "price-chart-crosshair-text")
        .attr("x", width)
        .attr("dy", "0.35em");
      xCross.insert("rect", "text")
        .attr("class", "price-chart-crosshair-rect")
        .attr("y", -9)
        .attr("height", "18px");

      yCross = canvas.append("g")
        .attr("class", "price-chart-crosshair hidden");
      yCross.append("line")
        .attr("class", "price-chart-crosshair-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0);
      yCross.append("text")
        .attr("class", "price-chart-crosshair-text")
        .attr("dy", "1.25em")
        .attr("text-anchor", "middle");
      yCross.insert("rect", "text")
        .attr("class", "price-chart-crosshair-rect")
        .attr("x", -60)
        .attr("width", 120)
        .attr("height", "18px");
    }

    function update() {
      if (!containerElement) return;

      updateDimensions();

      updateScales();
      updateCanvas();
      updateAxes();
      updateTitle();
      updateItems();
      updateMouseHolder();
      updateCross();

    }

    function updateDimensions() {
      var el = d3.select(containerElement[0]);

      dimensions.w = parseFloat(el.style("width")) || dimensions.w;
      dimensions.h = parseFloat(el.style("height")) || dimensions.h;

      width = dimensions.w - margin.left - margin.right,
      height = dimensions.h - margin.top - margin.bottom;

    }

    function updateScales() {
      xScale.range([0, width]);
      yScale.range([height, 0]);

      xAxis.scale(xScale).tickSize(-height);
      yAxis.scale(yScale).tickSize(-width);
      zoom.x(xScale).y(yScale);
    }

    function updateCanvas() {
      chart
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      canvas
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
    }

    function updateMouseHolder() {
      mouseHolder
        .attr("width", width + margin.right)
        .attr("height", height);

    }

    function updateAxes() {
      xAxisG
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      yAxisG
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxis);
    }

    function updateTitle() {
      title.attr("x", width / 2);
      title.attr("y", height /2);
    }

    function updateItems() {

      items
        .attr("width", width)
        .attr("height", height);


      bars = items.selectAll("rect")
        .data(priceData.bars, function(bar) {
          return bar[0];
        });

      bars.enter()
        .append("rect")
        .attr("class", function(bar) {
          return bar[1] > bar[4] ? 'price-chart-bar-down' : 'price-chart-bar-up';
        });

      bars
        .attr("x", function(bar) {
          return xScale(bar[0]);
        })
        .attr("y", function(bar) {
          return yScale(Math.max(bar[1], bar[4]));
        })
        .attr("height", function(bar) {
          var top = yScale(Math.max(bar[1], bar[4]));
          var bottom = yScale(Math.min(bar[1], bar[4]));
          return bottom - top;
        })
        .attr("width", function(bar) {
          var start = xScale(bar[0]);
          var end = xScale(bar[0] + timeStep);
          return end - start;
        });

      bars.exit().remove();


      function lineX(bar) {
        var start = xScale(bar[0]);
        var end = xScale(bar[0] + timeStep);
        var barX = start + (end - start) / 2;
        return barX;
      }

      lines = items.selectAll("line")
        .data(priceData.bars, function(bar) {
          return bar[0];
        });

      lines.enter()
        .append("line")
        .attr("class", function(bar) {
          return bar[1] > bar[4] ? 'price-chart-line-down' : 'price-chart-line-up';
        });

      lines
        .attr("x1", lineX)
        .attr("x2", lineX)
        .attr("y1", function(bar) {
          return yScale(bar[2]);
        })
        .attr("y2", function(bar) {
          return yScale(bar[3]);
        });

      lines.exit().remove();
    }

    function updateCross() {

      xCross.select("line")
        .attr("x2", width + margin.right);

      xCross.select("text").attr("x", width);
      xCross.select("rect").attr("x", width);

      yCross.select("line")
        .attr("y2", height);
      yCross.select("text")
        .attr("y", height);
      yCross.select("rect")
        .attr("y", height + 1);
    }

    function onMousemove() {
      crossMove();
    }

    function onMouseleave() {
      crossHide();
    }

    function normalizeX(val) {
      var HALF_STEP = timeStep / 2;
      var res = val;
      var domainX = xScale.invert(val);
      var arr = priceData.bars;
      var l = arr.length;
      for (var i = 0; i < l; i++) {
        if (Math.abs(arr[i][0] - domainX) < HALF_STEP) {
          res = xScale(arr[i][0] + HALF_STEP);
          break;
        }
      }
      return res;
    }

    function crossHide() {
      xCross.classed("hidden", true);
      yCross.classed("hidden", true);
    }

    function crossMove() {
      var p = d3.mouse(mouseHolder[0][0]);
      var xNormal = normalizeX(p[0]);

      var valX = xScale.invert(xNormal);
      var valY = yScale.invert(p[1]);

      var mouseOnDepth = p[0] > width;

      xCross.classed("hidden", false);
      yCross.classed("hidden", mouseOnDepth);

      xCross
        .attr("transform", "translate(0," + p[1] + ")")

      xCross.select("text")
        .attr("dx", mouseOnDepth ? "-0.35em" : "0.35em")
        .attr("text-anchor", mouseOnDepth ? "end" : "start")
        .text(valY.toFixed(5));

      xCross.select("rect")
        .attr("x", mouseOnDepth ? width - 65 : width)
        .attr("width", mouseOnDepth ? 65 : margin.right);

      yCross
        .attr("transform", "translate(" + xNormal + ", 0)");
      yCross.select("text")
        .text(timeFormatter(valX));
    }

    function zoomed() {
      var domainX = xScale.domain();
      if (domain.x[0] > domainX[0] || domain.x[1] < domainX[1]) {
        var dataPromise = TimeFramesService.getPriceData(
          $scope.symbol,
          timeStep,
          domainX[0],
          domainX[1]);

        dataPromise.then(function(data) {
          if(data.bars.length > 10) {
            priceData.bars = data.bars;
          }

          // update Y scale to accomodate whole height
          var newDomain = calculateDomain();
          domain.y = newDomain.y;
          yScale.domain(newDomain.y);
          yAxis.scale(yScale);

          domain.x = newDomain.x;
          xScale.domain(newDomain.x);
          xAxis.scale(xScale);

          updateItems();
          updateAxes();
        });
      } else {
        updateItems();
        updateAxes();
      }

    }

    this.renderChart = function(element, range) {
      var dataPromise = TimeFramesService.getPriceData(
        $scope.symbol,
        range.timeStep,
        range.startTime,
        range.endTime);

      $timeout(function() {
        containerElement = element;

        dataPromise.then(function(data) {
          timeStep = range.timeStep;

          priceData.bars = data.bars;

          //clear old
          angular.element(containerElement[0])
            .children().remove();

          init();
          update();
        });
      }, 100);
    };

    this.update = update;

    margin = {
      top: 10,
      right: 50,
      bottom: 20,
      left: 10
    };
    dimensions = {
      w: 360,
      h: 180
    };

    timeFormatter = d3.time.format("%Y-%m-%d %H:%M:%S");
  })

.service("TimeFramesService", function($q) {
  var cache = [];

  function generateMockData(symbol, timeStep, intervalStart, intervalEnd) {
    var timestamp;
    var data = [];
    var seed = 22.5;

    for (timestamp = intervalStart; timestamp < intervalEnd; timestamp += timeStep) {
      var open = seed;
      var close = open + (0.5 - Math.random());
      var high = _.max([open, close]) + Math.random() / 10;
      var low = _.min([open, close]) - Math.random() / 10;
      var volume = 100 * Math.random();
      var bar = [timestamp, open, high, low, close, volume];

      seed = close;

      data.push(bar);
    }
    return data;
  }

  function getPriceData(symbol, timeStep, intervalStart, intervalEnd) {
    var deffered = $q.defer();

    // use chaching
    if (!cache[symbol]) {
      cache[symbol] = {};
    }

    if (!cache[symbol][timeStep]) {
      //TODO: load real data
      var end = intervalEnd - (intervalEnd % timeStep) + timeStep;
      var start = end - 5000 * timeStep;
      cache[symbol][timeStep] = generateMockData(symbol, timeStep, start, end);
    }

    //TODO: load older then cached
    var cachedBars = cache[symbol][timeStep];
    var normalizedStart = intervalStart - (intervalStart % timeStep);
    var normalizedEnd = intervalEnd - (intervalEnd % timeStep) + timeStep;
    //TODO: use fast search using divide by two
    var bars = _.filter(cachedBars, function(bar) {
      return bar[0] > normalizedStart && bar[0] < normalizedEnd;
    });

    deffered.resolve({
      bars: bars
    });

    return deffered.promise;
  }
  return {
    getPriceData: getPriceData
  };
});