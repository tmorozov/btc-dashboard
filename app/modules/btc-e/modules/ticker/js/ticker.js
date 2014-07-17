/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.Ticker', ['mtvBtcE.data', 'mtvActiveTable'])
  .directive("mtvTickerBtce", function(mtvBtceReference, mtvBtceTickers) {
    return {
      scope: {},
      controller: "mtvActiveTableAddAxisCtrl",
      templateUrl: "modules/btc-e/modules/ticker/templates/ticker.html",
      link: function(scope, element, attr) {
        scope.Reference = mtvBtceReference;
        scope.pair;

        var columnsMeta = [{
          name: "Bid",
          type: "mtv-datasource-cell-number",
          key: "buy"
        }, {
          name: "Ask",
          type: "mtv-datasource-cell-number",
          key: "sell"
        }, {
          name: "High",
          type: "mtv-datasource-cell-number",
          key: "high"
        }, {
          name: "Low",
          type: "mtv-datasource-cell-number",
          key: "low"
        }, {
          name: "Volume",
          type: "mtv-datasource-cell-number",
          key: "vol_cur"
        }, {
          name: "Last",
          type: "mtv-datasource-cell-number",
          key: "last"
        }];

        scope.query = {
          axisNames: ["Pair"],
          axises: [
            columnsMeta, // axis 0
            [], // axis 1
            [] //axis 2
          ]
        };

        scope.dataSource = {
          getValue: function(rowKey, colKey) {
            var ticker = mtvBtceTickers.getTicker(rowKey);
            return ticker[colKey];
          }
        };

        scope.serialize = function () {
          return {
            type: "ticker-btce",
            settings: {
              symbol: scope.pair
            }
          };
        };

      }
    }

  })
  
  .directive("mtvDatasourceCellNumber", function(mtvMockDataService) {
    return {
      template: '<div class="mtv-number-cell">{{data.getValue(ax1, col.key) | number}}</div>',
      replace: true
    };
  })
  ;