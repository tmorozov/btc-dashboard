/*globals: angular, _*/
'use strict';

angular.module('mtvBtcE.data', [])
  .service("mtvBtceReference", function ($http) {
    var info = {};
    var pairs = [];

    function loadInfo () {
      $http.get("/btce_api3/info")
        .success(function(data) {
          info = data;          
          pairs = _.keys(info.pairs);
        });
    }

    loadInfo();

    return {
      get pairs() {
        return pairs;
      }
    };
  })
  .service("mtvBtceTickers", function($http, $timeout) {
    var cache = {};

    function connectTicker (pair) {
      function getTicker() {
        $http.get("/btce_api2/"+pair+"/ticker")
          .success(function (data) {
            if(data && !angular.equals(cache[pair], data.ticker)) {
              cache[pair] = data.ticker;
            }

            $timeout(getTicker, 1000);
          });
      }
      getTicker();
    }
    return {
      getTicker: function(pair) {
        if(!pair) {
          return;
        }

        if(!cache[pair]) {
          cache[pair] = {};
          connectTicker(pair);
        }

        return cache[pair];
      }
    }
  })
  .service("mtvBtceDepths", function($http, $timeout) {
    var cache = {};

    function connectDepth(pair) {    
      function getDepth() {
        $http.get("/btce_api3/depth/"+pair+"?limit=20")
          .success(function(data) {
            // ignore same data
            if(data && !angular.equals(cache[pair], data[pair])) {
              cache[pair] = data[pair];
            }
            $timeout(getDepth, 1000);
          });
      }

      getDepth();
    }

    return {
      getDepth: function(pair) {
        if(!pair) {
          return [];
        }
        if(!cache[pair]) {
          cache[pair] = [];
          connectDepth(pair);
        }
        return cache[pair];
      }
    }
  })
  .service("mtvBtceTrades", function($http, $timeout) {
    var cache = {};

    function connectTrades(pair) {    
      function getTrades() {
        $http.get("/btce_api2/"+pair+"/trades")
          .success(function(data) {
            // ignore same data
            if(data.length && !angular.equals(cache[pair][0], data[0])) {
              cache[pair] = data;
            }
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