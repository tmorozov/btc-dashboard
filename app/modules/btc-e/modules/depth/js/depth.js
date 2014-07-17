/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.Depth', ['mtvBtcE.data', 'mtvActiveTable'])
  .directive("mtvDepthBtce", function(mtvBtceReference) {
    return {
      scope: {},
      templateUrl: "modules/btc-e/modules/depth/templates/template-depth.html",
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

        scope.dataSource = {};

        scope.serialize = function () {
          return {
            type: "depth-btce",
            settings: {
              symbol: scope.pair
            }
          };
        };

      }
    }

  })
  ;