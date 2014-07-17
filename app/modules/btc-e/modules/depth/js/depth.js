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

        scope.dataSource = mtvBtceDepths;

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