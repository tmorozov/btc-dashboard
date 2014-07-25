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
            type: "mtv-row-cell-price",
            name: "Price",
            key: 0
          }, {
            type: "mtv-row-cell-number",
            name: "Size",
            key: 1
          }]
        };

        scope.formatter = {
          price: function() {
            var meta = mtvBtceReference.getMeta(scope.pair);
            return meta ? meta.decimal_places : 3;
          }
        };

        scope.dataSourceAsks = {
          getRows: function() {
            var rows = scope.pair ? mtvBtceDepths.getDepth(scope.pair).asks :[];
            return rows;
          }
        }
        scope.dataSourceBids = {
          getRows: function() {
            var rows = scope.pair ? mtvBtceDepths.getDepth(scope.pair).bids :[];
            return rows;
          }
        }

        scope.handler = {
          click: function(row, col) {
            console.log(row, col);
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