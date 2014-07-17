/*globals: angular, _*/
'use strict';

angular.module('mtvActiveTable')
  .controller("mtvPivotExampleLoadPairsCtrl", function($scope, mtvPairsSrv) {
    $scope.pairs = [];
    mtvPairsSrv.get().then(function(data) {
      $scope.pairs = data;
    });
  })
  .controller("mtvPivotExampleCtrl", function($scope, $controller) {
    $controller("mtvPivotExampleLoadPairsCtrl", {$scope: $scope});
    $controller("mtvActiveTableAddAxisCtrl", {$scope: $scope});
  })
  .directive("mtvSummaryTable", function(mtvActiveTableMeta) {
    return {
      templateUrl: "modules/active-table/templates/template-two-axis-pivot-example.html",
      controller: "mtvPivotExampleCtrl",
      scope: {},
      replace: true,
      link: function(scope, element, attr) {
        scope.tableName = "Summary Table";
        scope.query = {
          axisNames: ["Pair", "Exchange"],
          axises: [
            mtvActiveTableMeta.getCollumns("summary"), // axis 0
            ["BTC/USD"], // axis 1
            ["btce", "ltce", "mtce"] //axis 2
          ]
        };

        scope.serialize = function() {
          return {
            type: "summary-table",
          };
        };
      }
    };
  })
  .directive("mtvIndexesTable", function(mtvActiveTableMeta) {
    return {
      templateUrl: "modules/active-table/templates/template-two-axis-pivot-example.html",
      controller: "mtvPivotExampleCtrl",
      scope: {},
      replace: true,
      link: function(scope, element, attr) {
        scope.tableName = "Indexes Table";
        scope.query = {
          axisNames: ["Pair", "Exchange"],
          axises: [
            mtvActiveTableMeta.getCollumns("indexes"), // axis 0
            ["BTC/USD"], // axis 1
            ["btce", "ltce", "mtce"] //axis 2
          ]
        };

        scope.serialize = function() {
          return {
            type: "indexes-table",
          };
        };

      }
    };
  })
  .directive("mtvSparklinesTable", function(mtvActiveTableMeta) {
    return {
      templateUrl: "modules/active-table/templates/template-two-axis-pivot-example.html",
      controller: "mtvPivotExampleCtrl",
      scope: {},
      replace: true,
      link: function(scope, element, attr) {
        scope.tableName = "Sparklines Table";
        scope.query = {
          axisNames: ["Pair", "Exchange"],
          axises: [
            mtvActiveTableMeta.getCollumns("sparklines"), // axis 0
            ["BTC/USD", "LTC/USD"], // axis 1
            ["btce", "ltce", "mtce"] //axis 2
          ]
        };

        scope.serialize = function() {
          return {
            type: "sparklines-table",
          };
        };

      }
    };
  })
  .directive("mtvStringCell", function() {
    return {
      scope: {
        key: "@"
      },
      template: "<div>{{key}}</div>",
      replace: true
    };
  })
  .directive("mtvNumberCell", function(mtvMockDataService) {
    return {
      scope: {
        key: "@",
        meta: "@"
      },
      template: '<div class="mtv-number-cell">{{dataSource() | number}}</div>',
      replace: true,
      link: function(scope, element, attr) {
        scope.dataSource = function() {
          return 1+1/(1+mtvMockDataService.getIndex(scope.key, scope.meta));
        };
      }
    };
  })
  .directive("mtvIndexCell", function(mtvMockDataService) {
    return {
      scope: {
        key: "@",
        meta: "@"
      },
      template: '<div style="color:{{dataSource().color}};">{{dataSource().val}}</div>',
      replace: true,
      link: function(scope, element, attr) {
        scope.dataSource = function() {
          var value = mtvMockDataService.getIndex(scope.key, scope.meta);
          var val = value;
          var color;

          switch(value) {
            case 1: val = "-"; color="#f00"; break;
            case 2: val = "-"; color="#a00"; break;
            case 3: val = "="; color="#555"; break;
            case 4: val = "+"; color="#0a0"; break;
            case 5: val = "+"; color="#0f0"; break;
          }
          return {
            val: val,
            color: color
          };
        };
      }
    };
  })
  .directive("mtvSparklineCell", function(mtvMockDataService) {
    return {
      scope: {
        key: "@",
        meta: "@"
      },
      template: "<div></div>",
      replace: true,
      link: function(scope, element, attr) {
        var linesParam = {
          type:'line',
          height:'1.5em',
          width:'3em',
          lineColor: '#aaa',
          fillColor:false,
          spotColor:'red',
          minSpotColor:'',
          maxSpotColor:''
        };
        var metaArr = scope.meta.split("||");
        var series = mtvMockDataService.getSeries(scope.key, metaArr[0]);
        if(metaArr.length === 2) {
          element.sparkline(series, {type: metaArr[1]});
        } else {
          element.sparkline(series, linesParam);
        }

      }
    }
  })
  .service("mtvMockDataService", function($timeout) {
    var cache = {};
    var seriesCache = {};

    function mockUpdateIndex() {
      angular.forEach(cache, function(index, key) {
        cache[key] = Math.round(Math.random() * 5);
      });

      $timeout(mockUpdateIndex, 3000);
    }

    //mockUpdateIndex();

    return {
      getIndex: function(key, index){
        var compositeKey = key+index;
        if (!cache[compositeKey]) {
          cache[compositeKey] = Math.round(Math.random() * 5);
        }
        return cache[compositeKey];
      },
      getSeries: function(key, index) {
        var compositeKey = key+index;
        if (!seriesCache[compositeKey]) {
          var newSeries = [];
          for(var i=0; i< 10; i++) {
            newSeries.push(Math.round(Math.random()*100));
          }
          seriesCache[compositeKey] = newSeries;
        }
        return seriesCache[compositeKey];
      }
    };
  })
  .service("mtvPairsSrv", function($http) {
    var url = 'coin-pairs.json';
    return {
      get: function() {
        return $http.get(url).then(function(resp) {
          return resp.data;
        });
      }
    };
  })
  .service("mtvPriceService", function() {
    var prices = {};
    return {
      getPrice: function(key) {
        if (!prices[key]) {
          prices[key] = Math.random() * 100;
        }
        return prices[key];
      }
    };
  })
  .service("mtvActiveTableMeta", function() {
    var templates = {
      "sparklines": [{
        name: "Last Price",
        type: "mtv-sparkline-cell",
        meta: "lastPrice"
      }, {
        name: "Volume",
        type: "mtv-sparkline-cell",
        meta: "volume||bar"
      }],
      "summary": [{
          name: "Bid Size",
          type: "mtv-number-cell",
          meta: "bs"
        }, {
          name: "Bid Price",
          type: "mtv-number-cell",
          meta: "bp"
        }, {
          name: "Ask Size",
          type: "mtv-number-cell",
          meta: "as"
        }, {
          name: "Ask Price",
          type: "mtv-number-cell",
          meta: "ap"
        }, {
          name: "Open",
          type: "mtv-number-cell",
          meta: "op"
        }, {
          name: "High",
          type: "mtv-number-cell",
          meta: "hi"
        }, {
          name: "Low",
          type: "mtv-number-cell",
          meta: "lo"
        }, {
          name: "Volume",
          type: "mtv-number-cell",
          meta: "vo"
        }, {
          name: "Change",
          type: "mtv-number-cell",
          meta: "ch"
        }],
      "indexes": [{
        name: "m1",
        type: "mtv-index-cell",
        meta: "m1"
      }, {
        name: "m5",
        type: "mtv-index-cell",
        meta: "m5"
      }, {
        name: "m10",
        type: "mtv-index-cell",
        meta: "m10"
      }, {
        name: "m15",
        type: "mtv-index-cell",
        meta: "m15"
      }, {
        name: "m30",
        type: "mtv-index-cell",
        meta: "m30"
      }, {
        name: "H1",
        type: "mtv-index-cell",
        meta: "H1"
      }, {
        name: "H4",
        type: "mtv-index-cell",
        meta: "H4"
      }, {
        name: "H12",
        type: "mtv-index-cell",
        meta: "H12"
      }, {
        name: "D1",
        type: "mtv-index-cell",
        meta: "D1"
      }, {
        name: "D2",
        type: "mtv-index-cell",
        meta: "D2"
      }, {
        name: "W1",
        type: "mtv-index-cell",
        meta: "W1"
      }, {
        name: "M1",
        type: "mtv-index-cell",
        meta: "M1"
      }]
    };

    return {
      getCollumns: function(template) {
        return templates[template];
      }
    };
  })
  
  ;
