/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.data', [])
  .service("mtvBtceReference", function ($http) {
    var pairs = ["btc_usd", "ltc_usd"];

    function loadInfo () {
      $http.get("/btce_api3/info")
        .success(function(data) {
          pairs = _.keys(data.pairs);
        });
    }

    loadInfo();

    return {
      get pairs() {
        return pairs;
      }
    };
  })
  .service("mtvBtceTrades", function($http, $timeout) {
    var cache = {};

    function connectTrades(pair) {      
      function getTrades() {
        $http.get("/btce_api2/"+pair+"/trades")
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