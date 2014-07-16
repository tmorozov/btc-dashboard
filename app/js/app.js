var app = angular.module("gridApp", [
  "mtvCharts",
  "mtvActiveTable",
  "typeahead.module",
  "tabs.module",
  //"mtvTiles",
  //"mtvConnection",
  "mtvGridster",
  "mtvBtcE"
  //"mtvTradeHistory"
  ])
  .directive("mtvBook", function() {
    return {
      template: "Book",
      scope: {},
      link: function (scope, element, attr) {
        scope.serialize = function() {
          return {
            type: "book",
          };
        };
      }
    };
  })
  .directive("mtvUpsAndDowns", function($timeout) {
    return {
      scope: {},
      replace: true,
      templateUrl: 'templates/template-ups-and-downs.html',
      link: function(scope, element, attr) {
        scope.serialize = function() {
          return {
            type: "ups-and-downs",
          };
        };

        var matrix = [
          [10, 2, 3, 4, 5],
          [11, 2, 3, 4, 5],
          [12, 2, 3, 4, 5]
        ];

        function draw(matrix) {
          var container = d3.select(element[0]);
          container.select("tbody").selectAll("tr").remove();
          var td = container.select("tbody").selectAll("tr")
            .data(matrix)
            .enter().append("tr")
            .selectAll("td")
            .data(function(d, i) {
              return d;
            })
            .enter().append("td")
            .text(function(d) {
              return d > 4 ? "\u2b07" : "\u2b06";
            })
            .style("color", function(d) {
              var color = "#fff";
              var bright = Math.round(Math.abs(d - 4) * 150 / 10) + 100;
              if (d > 4) {
                return "rgb(" + bright + ",0,0)";
              } else {
                return "rgb(0," + bright + ",0)";
              }

              return color;
            });
        }

        function mockUpdate() {
          angular.forEach(matrix, function(row) {
            row.sort(function(a, b) {
              return Math.round(Math.random());
            });
          });
          draw(matrix);
          $timeout(mockUpdate, 2000);
        }

        mockUpdate();
      }
    };
  })
  ;