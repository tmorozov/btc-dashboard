/*globals: angular, _*/
'use strict';

angular.module('mtvActiveTable')
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
;