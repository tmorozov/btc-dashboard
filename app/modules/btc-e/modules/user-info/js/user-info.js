/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.UserInfo', ['mtvUser'])
  .directive("mtvUserFundsBtce", function(mtvUser) {
    return {
      templateUrl: "/modules/btc-e/modules/user-info/templates/template-user-funds.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;
      }
    };
  });