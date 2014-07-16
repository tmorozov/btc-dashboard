/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.TradeHistory', ['mtvBtcE.data', 'mtvActiveTable'])
  .directive("mtvRowCellTimestamp", function () {
    return {
      scope: {
        key: "@",
        meta: "@",
        row: "&"
      },
      template: '<div class="mtv-number-cell">{{value | date : "MMM d HH:mm:ss"}}</div>',
      replace: true,
      link: function(scope, element, attr) {
        scope.value = scope.$parent.$parent.row[scope.key];
      }
    };
  })
  .directive("mtvRowCellSide", function () {
    return {
      scope: {
        key: "@",
        meta: "@"
      },
      template: '<div class="mtv-number-cell">{{value}}</div>',
      replace: true,
      link: function(scope, element, attr) {
        scope.value = scope.$parent.$parent.row[scope.key];
      }
    };
  })
  .directive("mtvRowCellNumber", function () {
    return {
      scope: {
        key: "@",
        meta: "@"
      },
      template: '<div class="mtv-number-cell">{{value | number}}</div>',
      replace: true,
      link: function(scope, element, attr) {
        scope.value = scope.$parent.$parent.row[scope.key];
      }
    };
  })
  .directive("mtvTradeHistoryTable", function(mtvBtceReference, mtvBtceTrades) {
    return {
      scope: {},
      templateUrl: "modules/btc-e/modules/trade-history/templates/template-trade-history-table.html",
      link: function(scope, element, attr) {
        scope.Reference = mtvBtceReference;
        //scope.pairs = mtvBtcePairs;
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