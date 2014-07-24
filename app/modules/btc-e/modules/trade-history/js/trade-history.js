/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.TradeHistory', ['mtvBtcE.data', 'mtvActiveTable'])
  .directive("mtvTradeHistoryBtce", function(mtvBtceReference, mtvBtceTrades) {
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
            type: "mtv-row-cell-price",
            name: "Price",
            key: "price"
          }, {
            type: "mtv-row-cell-number",
            name: "Size",
            key: "amount"
          }]
        };

        scope.formatter = {
          price: function() {
            var meta = mtvBtceReference.getMeta(scope.pair);
            return meta ? meta.decimal_places : 3;
          }
        };

        scope.dataSource = {
          getRows: function() {
            var rows = scope.pair ? mtvBtceTrades.getTrades(scope.pair) :[];
            return rows;
          }
        }

        scope.serialize = function () {
          return {
            type: "trade-history-btce",
            settings: {
              symbol: scope.pair
            }
          };
        };

      }
    }

  })
  ;