/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserTrades', ['mtvUser'])
  .directive("mtvUserTradesBtce", function(mtvUser, mtvBtceUserTrades) {
    return {
      templateUrl: "/modules/btc-e/modules/user-trades/templates/template-user-trades.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;
        scope.tradesProvider = mtvBtceUserTrades;
        scope.tradesMeta = [
          "pair",
          "type",
          "amount",
          "rate",
          "order_id",
          "is_your_order",
          "timestamp"
        ];
      }
    };
  });
