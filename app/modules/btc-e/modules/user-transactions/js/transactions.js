/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserTransactions', ['mtvUser', 'mtvActiveTable'])
  .directive("mtvUserTransactionsBtce", function(mtvUser, mtvBtceUserTransactions) {
    return {
      scope: true,
      templateUrl: "/modules/btc-e/modules/user-transactions/templates/template-transactions.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;

        scope.meta = {
          columns: [{
            type: "mtv-row-cell-string",
            name: "Id",
            key: "transactionId"
          }, {
            type: "mtv-row-cell-string",
            name: "type",
            key: "type"
          }, {
            type: "mtv-row-cell-number",
            name: "amount",
            key: "amount"
          }, {
            type: "mtv-row-cell-string",
            name: "currency",
            key: "currency"
          }, {
            type: "mtv-row-cell-string",
            name: "desc",
            key: "desc"
          }, {
            type: "mtv-row-cell-string",
            name: "status",
            key: "status"
          }, {
            type: "mtv-row-cell-timestamp",
            name: "Time",
            key: "timestamp"
          }]
        };

        scope.dataSourceTransactions = {
          getRows: function() {
            return mtvBtceUserTransactions.getTransactions();
          }
        };          
      }
    };
  });
