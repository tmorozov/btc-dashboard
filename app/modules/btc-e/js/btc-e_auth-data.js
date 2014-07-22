/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.AuthData', [])
  .service("mtvBtceRequest", function ($http, $q, mtvUser) {
    var nonce = 0;

    function sendRequest(keys, params, deferred) {
      var data = params+"&"+"nonce="+nonce;
      nonce = nonce + 1;
      var signedData = CryptoJS.HmacSHA512(data, keys.priv);

      var config = {
        method: 'POST', 
        url: '/btce_tapi',
        data: data,
        headers: {
          Key: keys.pub,
          Sign: signedData,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      $http(config)
      .success(function(data) {
        console.log("responce", data);
        if(data.success === 0 
          && data.error 
          && data.error.indexOf("you should send:") !== -1) {
          var newNonceStr = data.error.replace(/.*you should send:(.*)$/, '$1');
          if(newNonceStr && newNonceStr.length) {
            nonce = +newNonceStr;
          }
        }

        if(data.success === 1 && data.return) {
          deferred.resolve(data.return);
        } else if(data.success === 0) {
          deferred.reject(data.error);
        }

      })

    }
    return {
      request: function(params) {
        var deferred = $q.defer();
        var keys = mtvUser.keys;

        if(keys && keys.priv && keys.pub) {
          sendRequest(keys, params, deferred);
        } else {
          deferred.reject("no keys");
        }

        return deferred.promise;
      }
    }

  })
  .service("mtvBtceUserFunds", function($http, $timeout, mtvBtceRequest) {
    var cache;

    function connectFunds () {
      function getFunds() {
        var requestData = "method=getInfo";
        var promise = mtvBtceRequest.request(requestData);
        promise
        .then(
          function(data) {
            if(data.funds && !angular.equals(cache, data.funds) ) {
              cache = data.funds;
            }
            $timeout(getFunds, 5000);
          },
          function() {
            $timeout(getFunds, 1000);
          }
        );
      }
      getFunds();
    }
    return {
      getFunds: function() {
        if(!cache) {
          cache = {};
          connectFunds();
        }

        return cache;
      }
    }
  })
  .service("mtvBtceUserTransactions", function($http, $timeout, mtvBtceRequest) {
    var cache;

    function connectTransactions() {
      function getTransactions() {
        var requestData = "method=TransHistory";
        var promise = mtvBtceRequest.request(requestData);
        promise
        .then(
          function(data) {
            if(data && !angular.equals(cache, data) ) {
              cache = data;
            }
            $timeout(getTransactions, 5000);
          },
          function() {
            $timeout(getTransactions, 1000);
          }
        );
      }
      getTransactions();
    }
    return {
      getTransactions: function() {
        if(!cache) {
          cache = {};
          connectTransactions();
        }

        return cache;
      }
    }
  })  
  .service("mtvBtceUserTrades", function($http, $timeout, mtvBtceRequest) {
    var cache;

    function connectTrades() {
      function getTrades() {
        var requestData = "method=TradeHistory";
        var promise = mtvBtceRequest.request(requestData);
        promise
        .then(
          function(data) {
            if(data && !angular.equals(cache, data) ) {
              cache = data;
            }
            $timeout(getTrades, 5000);
          },
          function() {
            $timeout(getTrades, 1000);
          }
        );
      }
      getTrades();
    }
    return {
      getTrades: function() {
        if(!cache) {
          cache = {};
          connectTrades();
        }

        return cache;
      }
    }
  })
  .service("mtvBtceUserOrders", function($http, $timeout, mtvBtceRequest) {
    var cache;

    function connectOrders() {
      function getOrders() {
        var requestData = "method=ActiveOrders";
        var promise = mtvBtceRequest.request(requestData);
        promise
        .then(
          function(data) {
            if(data && !angular.equals(cache, data) ) {
              cache = data;
            }
            $timeout(getOrders, 5000);
          },
          function() {
            $timeout(getOrders, 1000);
          }
        );
      }
      getOrders();
    }
    return {
      getOrders: function() {
        if(!cache) {
          cache = {};
          connectOrders();
        }

        return cache;
      }
    }
  })
  ;