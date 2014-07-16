/*globals: angular, _*/
'use strict';

angular.module('mtvActiveTable')
  .directive("mtvRowCellTimestamp", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key] | date : "MMM d HH:mm:ss"}}</div>',
      replace: true
    };
  })
  .directive("mtvRowCellSide", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key]}}</div>',
      replace: true
    };
  })
  .directive("mtvRowCellNumber", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key] | number}}</div>',
      replace: true
    };
  })
;