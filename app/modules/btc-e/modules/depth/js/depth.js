/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.Depth', ['mtvBtcE.data', 'mtvActiveTable'])
  .directive("mtvDepthBtce", function(mtvBtceReference, mtvBtceDepths) {
    return {
      scope: {},
      templateUrl: "modules/btc-e/modules/depth/templates/template-depth.html",
      link: function(scope, element, attr) {
        scope.Reference = mtvBtceReference;
        scope.pair;
        scope.meta = {
          columns: [{
            type: "mtv-row-cell-number",
            name: "Price",
            key: 0
          }, {
            type: "mtv-row-cell-number",
            name: "Size",
            key: 1
          }]
        };

        scope.dataSourceAsks = {
          getRows: function() {
            var rows = scope.pair && scope.pair.value ? mtvBtceDepths.getDepth(scope.pair.value).asks :[];
            return rows;
          }
        }
        scope.dataSourceBids = {
          getRows: function() {
            var rows = scope.pair && scope.pair.value ? mtvBtceDepths.getDepth(scope.pair.value).bids :[];
            return rows;
          }
        }

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