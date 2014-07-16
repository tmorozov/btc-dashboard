/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.TradeHistory', ['mtvBtcE.data', 'mtvActiveTable'])
  .directive("mtvTradeHistoryTable", function(mtvBtceReference, mtvBtceTrades) {
    return {
      scope: {},
      templateUrl: "modules/btc-e/modules/trade-history/templates/template-trade-history-table.html",
      link: function(scope, element, attr) {
        scope.Reference = mtvBtceReference;
        scope.pair;
        scope.meta = {
          columns: [{
            type: "mtv-row-cell-timestamp",
            name: "Date",
            key: "date"
          }, {
            type: "mtv-row-cell-side",
            name: "Type",
            key: "trade_type"
          }, {
            type: "mtv-row-cell-number",
            name: "Price",
            key: "price"
          }, {
            type: "mtv-row-cell-number",
            name: "Size",
            key: "amount"
          }]
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