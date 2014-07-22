/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserTransactions', ['mtvUser'])
  .directive("mtvUserTransactionsBtce", function(mtvUser, mtvBtceUserTransactions) {
    return {
      templateUrl: "/modules/btc-e/modules/transactions/templates/template-transactions.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;
        scope.transactionsProvider = mtvBtceUserTransactions;
        scope.transactionMeta = [
          "type",
          "amount",
          "currency",
          "desc",
          "status",
          "timestamp"
        ];
      }
    };
  });
