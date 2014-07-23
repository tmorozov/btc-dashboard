/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserOrders', ['mtvUser', 'mtvActiveTable'])
  .directive("mtvUserOrdersBtce", function(mtvUser, mtvBtceUserOrders) {
    return {
      scope: true,
      templateUrl: "/modules/btc-e/modules/user-orders/templates/template-user-orders.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;

        scope.meta = {
          columns: [{
            type: "mtv-row-cell-string",
            name: "Id",
            key: "orderId"
          }, {
            type: "mtv-row-cell-string",
            name: "Pair",
            key: "pair"
          }, {
            type: "mtv-row-cell-string",
            name: "type",
            key: "type"
          }, {
            type: "mtv-row-cell-number",
            name: "amount",
            key: "amount"
          }, {
            type: "mtv-row-cell-number",
            name: "rate",
            key: "rate"
          }, {
            type: "mtv-row-cell-timestamp",
            name: "Time",
            key: "timestamp_created"
          }, {
            type: "mtv-row-cell-string",
            name: "status",
            key: "status"
          }]
        };

        scope.dataSourceOrders = {
          getRows: function() {
            return mtvBtceUserOrders.getOrders();
          }
        };        
      }
    };
  });
