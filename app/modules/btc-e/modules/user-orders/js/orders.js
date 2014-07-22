/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserOrders', ['mtvUser'])
  .directive("mtvUserOrdersBtce", function(mtvUser, mtvBtceUserOrders) {
    return {
      templateUrl: "/modules/btc-e/modules/user-orders/templates/template-user-orders.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;
        scope.ordersProvider = mtvBtceUserOrders;
        scope.ordersMeta = [
          "pair",
          "type",
          "amount",
          "rate",
          "timestamp_created",
          "status"
        ];
      }
    };
  });
