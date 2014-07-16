/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.TradeHistory', ['mtvBtcE.data'])
  .directive("mtvTradeHistoryTable", function(myvBtcePairs, mtvBtceTrades) {
    return {
      scope: {},
      templateUrl: "modules/btc-e/modules/trade-history/templates/template-trade-history-table.html",
      link: function(scope, element, attr) {
        scope.pairs = myvBtcePairs;
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