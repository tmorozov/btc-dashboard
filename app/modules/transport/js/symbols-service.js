"use strict";

angular.module("mtvConnection")

.factory("mtvSymbolsStream", function(mtvReConnectionOk) {
  var symbolUpdates = new Rx.ReplaySubject(1);
  var reSubscription = mtvReConnectionOk.stream
    .subscribe(function(x){
      var symbolsHubProxy = x.hubs.symbolsHubProxy;
      symbolsHubProxy.on("OnSymbolUpdate", function(symbol) {
        symbolUpdates.onNext([symbol]);
      });

      symbolsHubProxy.invoke("GetSymbols")
        .done(function(symbols) {
          symbolUpdates.onNext(symbols);
        })
        .fail(function(err) {
          symbolUpdates.onError(err);
        });
    });

  return {
    stream: symbolUpdates.publish().refCount(),
    //holder: reSubscription
  };

})

.service("mtvSymbols", function(mtvSymbolsStream) {
  var symbols = {
    keys: {},
    arr: []
  };
  var symbolUpdatedStreamHandle = mtvSymbolsStream.stream
    .map(function(x) {
      var updated = 0;
      x.forEach(function(update) {
        if (update.UpdateType === 0) {
          if(typeof symbols.keys[update.Symbol.SymbolName] === 'undefined') {
            symbols.keys[update.Symbol.SymbolName] = update.Symbol.Id;
            updated += 1;
          } else {
            if (symbols.keys[update.Symbol.SymbolName] !== update.Symbol.Id ) {
              console.log("collision with id", symbols.keys[update.Symbol.SymbolName], update);
            }
          }
        }
        if (update.UpdateType === 1) {
          delete symbols.keys[update.Symbol.SymbolName];
          updated += 1;
        }
      });
      return updated;
    })
    .filter(function(x) {
      return x > 0;
    })
    //.throttle(2000)
    .subscribe(function(x) {
      symbols.arr = _.map(symbols.keys,  function(v, k) {
        return k;
      });
      console.log("symbols", symbols);
    });

  return {
    symbols: symbols,
    //holder: symbolUpdatedStreamHandle
  };

})
;