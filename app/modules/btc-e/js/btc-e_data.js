/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.data', [])
  .service("myvBtcePairs", function () {
    return ["btc_usd", "ltc_usd"];
  })
  .service("mtvBtceTrades", function($http, $timeout) {
    var cache = {};

    function connectTrades(pair) {      
      function getTrades() {
        $http.get("/btce_api/"+pair+"/trades")
          .success(function(data) {
            cache[pair] = data;
            $timeout(getTrades, 1000);
          });
      }

      getTrades();
    }

    return {
      getTrades: function(pair) {
        if(!pair) {
          return [];
        }
        if(!cache[pair]) {
          cache[pair] = [];
          connectTrades(pair);
        }
        return cache[pair];
      }
    }
  })
;  