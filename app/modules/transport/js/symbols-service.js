"use strict";

angular.module("mtvConnection")
  .run(function(mtvReConnection) {
    mtvReConnection.connect(["http://localhost:8088/"])
  })

.factory("mtvSymbolsStream", function(mtvReConnectionOk) {
  var symbolUpdates = new Rx.Subject();
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
    holder: reSubscription
  };

})

.service("mtvSymbols", function(mtvSymbolsStream) {
  var symbols = {
    keys: {},
    arr: []
  };
  var symbolUpdatedStreamHandle = mtvSymbolsStream.stream
    .map(function(x) {
      x.forEach(function(update) {
        if (update.UpdateType === 0) {
          symbols.keys[update.Symbol.SymbolName] = update.Symbol.Id;
        }
        if (update.UpdateType === 1) {
          delete symbols.keys[update.Symbol.SymbolName];
        }
      });
      return x.length;
    })
    .throttle(2000)
    .subscribe(function(x) {
      symbols.arr = _.map(symbols.keys,  function(v, k) {
        return k;
      });
      console.log("symbols", symbols);
    });

  return {
    symbols: symbols,
    holder: symbolUpdatedStreamHandle
  };

})
;