/*globals: angular, _*/
'use strict';

angular.module('mtvUser', [])
  .service("mtvUser", function() {
    var userInfo = {
      isLoggedIn: false,
    }
    return {
      get name() {
        return userInfo.name;
      },
      isLoggedIn: function () {
        return userInfo.isLoggedIn;
      },
      // mock Login
      login: function(loginInfo) {
        userInfo.isLoggedIn = true;
        userInfo.name = "Test User";
      },
      // mock Logout
      logout: function(login, password) {
        userInfo.name = null;
        userInfo.isLoggedIn = false;
      }
    };
  })
  .directive("mtvLogon", function(mtvUser) {
    return {
      templateUrl: "/modules/user/templates/template-logon.html",
      link: function(scope, element, attr) {
        scope.user = mtvUser;
      }
    };
  })
;  