/*globals: angular, _*/
'use strict';

angular.module('mtvActiveTable')
  .directive("mtvRowCell", function($compile) {
    return {
      link: function(scope, element, attr) {
        $compile('<div ' + attr.mtvRowCell + '></div>')(scope, function(cloned, scope) {
          element.append(cloned);
        });
      }
    };
  })
  .directive("mtvRowCellTimestamp", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key]*1000 | date:"MMM d HH:mm:ss"}}</div>',
      replace: true
    };
  })
  .directive("mtvRowCellString", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key]}}</div>',
      replace: true
    };
  })  
  .directive("mtvRowCellSide", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key]}}</div>',
      replace: true
    };
  })
  .directive("mtvRowCellPrice", function () {
    return {
      template: '<div class="mtv-number-cell">{{row[col.key].toFixed(formatter.price)}}</div>',
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