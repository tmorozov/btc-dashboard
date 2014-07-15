/*globals: angular, _*/
'use strict';

angular.module('mtvTradeHistory', [])
  .service("mtvBtceTrades", function($http, $timeout) {
    var cache = {};

    function connectTrades(pair) {      
      function getTrades() {
        $http.get("/btce/api/2/"+pair+"/trades")
          .success(function(data) {
            cache[pair] = data;
            $timeout(getTrades, 1000);
          });
      }

      getTrades();
    }

    return {
      getTrades: function(pair) {
        if(!pair) {
          return [];
        }
        if(!cache[pair]) {
          cache[pair] = [];
          connectTrades(pair);
        }
        return cache[pair];
      }
    }
  })
  .directive("mtvTradeHistoryTable", function(mtvBtceTrades) {
    return {
      scope: {},
      templateUrl: "modules/trade-history/templates/template-trade-history-table.html",
      link: function(scope, element, attr) {
        scope.pairs = ["btc_usd", "ltc_usd"];
        scope.pair;
        scope.meta = {
          columns: [{
            name: "Date",
            key: "date"
          }, {
            name: "Type",
            key: "trade_type"
          }, {
            name: "Price",
            key: "price"
          }, {
            name: "Size",
            key: "amount"
          }]
        };
        scope.data = {
          trades: []
        };

        scope.dataSource = mtvBtceTrades;
        scope.$watch("pair.value", function(newVal){
          if(newVal) {
            mtvBtceTrades.getTrades(newVal);
          }
        });

        scope.serialize = function () {
          return {
            type: "trade-history-table",
            settings: {
              symbol: scope.pair
            }
          };
        };

      }
    }

  })
  ;