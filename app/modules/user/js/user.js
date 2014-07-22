/*globals: angular, _*/
'use strict';

angular.module('mtvUser', [])
  .service("mtvUser", function() {
    var userInfo = {
      isLoggedIn: false,
    };
    var keys;
    return {
      get name() {
        return userInfo.name;
      },
      get keys() {
        if(this.isLoggedIn()) {
          return keys;  
        }
      },
      isLoggedIn: function () {
        return userInfo.isLoggedIn;
      },
      // mock Login
      login: function(loginInfo) {
        userInfo.isLoggedIn = true;
        userInfo.name = "Test User";

        //TODO: we need other way to save keys!
        keys = {
          pub: "V90V41LO-TOLI57WZ-YDU0XFNE-MVF5DM6G-VDZBS2CU",
          priv: "515d1153f177f8948d986bbda981345fab30cafe74715fdb193befaa4eade6b6"
        };
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