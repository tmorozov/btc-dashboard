"use strict";

angular.module("mtvConnection")
.factory("mtvSafeDigest", function() {
  return function(scope) {
    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
      scope.$digest();
    }
  };
})

.directive("mtvConnectionStatus", function(mtvSafeDigest, mtvReConnection) {
  return {
    scope: {},
    templateUrl: "modules/transport/templates/template-mtv-connection-status.html",
    link: function(scope, element, attr) {
      mtvReConnection.stream.subscribe(
        function(x) {
          scope.connection = x;
          mtvSafeDigest(scope);
        });
    }
  };
})

;