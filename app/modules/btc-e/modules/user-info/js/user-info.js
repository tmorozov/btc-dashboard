/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserInfo', ['mtvUser', 'mtvActiveTable'])
  .directive("mtvUserFundsBtce", function(mtvUser, mtvBtceUserFunds) {
    return {
      templateUrl: "/modules/btc-e/modules/user-info/templates/template-user-funds.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;
        scope.fundProvider = mtvBtceUserFunds;

        scope.meta = {
          columns: [{
            type: "mtv-row-cell-string",
            name: "Instrument",
            key: "instrument"
          }, {
            type: "mtv-row-cell-number",
            name: "Volume",
            key: "volume"
          }]
        };

        scope.dataSourceFunds = {
          getRows: function() {
            return mtvBtceUserFunds.getFunds();
          }
        }        
      }
    };
  });