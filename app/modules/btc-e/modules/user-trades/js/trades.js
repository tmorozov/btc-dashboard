/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserTrades', ['mtvUser', 'mtvActiveTable'])
  .directive("mtvUserTradesBtce", function(mtvUser, mtvBtceUserTrades) {
    return {
      scope: true,
      templateUrl: "/modules/btc-e/modules/user-trades/templates/template-user-trades.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;

        scope.meta = {
          columns: [{
            type: "mtv-row-cell-string",
            name: "Id",
            key: "tradeId"
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
            type: "mtv-row-cell-string",
            name: "OrderId",
            key: "order_id"
          }, {
            type: "mtv-row-cell-string",
            name: "IsYours",
            key: "is_your_order"
          }, {
            type: "mtv-row-cell-timestamp",
            name: "Time",
            key: "timestamp"
          }]
        };

        scope.dataSourceTrades = {
          getRows: function() {
            return mtvBtceUserTrades.getTrades();
          }
        };           
      }
    };
  });
