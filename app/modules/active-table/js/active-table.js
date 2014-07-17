/*globals: angular, _*/
'use strict';

angular.module('mtvActiveTable', [])
  .controller("mtvActiveTableAddAxisCtrl", function($scope) {
    function addAxisOne(value) {
      if(value) {
        var items = $scope.query.axises[1];
        var contains = _.indexOf(items, value);
        if(contains < 0) {
          $scope.query.axises[1].push(value);
        }
      }
    }

    $scope.$watch("axis.value", function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        addAxisOne(newVal);
      }
    });
  })
  .directive("mtvOneAxisPivot", function() {
    return {
      templateUrl: "modules/active-table/templates/template-one-axis-pivot.html",
      scope: {
        query: '=',
        data: '='
      }
    };
  })  
  .directive("mtvTwoAxisPivot", function() {
    return {
      templateUrl: "modules/active-table/templates/template-two-axis-pivot.html",
      scope: {
        query: '='
      }
    };
  })
  .directive("mtvCell", function($compile) {
    return {
      link: function(scope, element, attr) {
        $compile('<div '
        + attr.mtvCell
        + ' meta="'+ attr.cellMeta +'" '
        + ' key="' + attr.cellKey + '"></div>')(scope, function(cloned, scope) {
          element.append(cloned);
        });
      }
    };
  })
;