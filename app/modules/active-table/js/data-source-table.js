/*globals: angular, _*/
'use strict';

angular.module('mtvActiveTable')
  .directive("mtvDataSourceTable", function() {
    return {
      templateUrl: "modules/active-table/templates/template-data-source-table.html",
      scope: {
        meta: '=',
        data: '=',
        formatter: '=',
        handler: '='
      }
    };
  })  
