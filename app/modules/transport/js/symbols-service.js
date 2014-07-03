"use strict";

angular.module("mtvConnection")

.service("mtvSymbols", function(mtvReConnectionOk) {
  var symbols = {};

  function clearSymbols () {
    symbols.keys = {};
    symbols.arr = [];
  }

  function applyUpdates(arr) {
    var updated = 0;
    arr.forEach(function(update) {
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
  }

  clearSymbols();

  var symbolUpdatedStreamHandle = Rx.Observable.create(function (observer) {
    var reSubscription = mtvReConnectionOk.stream
      .subscribe(function(x){
        clearSymbols();

        var symbolsHubProxy = x.hubs.symbolsHubProxy;
        symbolsHubProxy.on("OnSymbolUpdate", function(symbol) {
          observer.onNext([symbol]);
        });

        symbolsHubProxy.invoke("GetSymbols")
          .done(function(symbols) {
            observer.onNext(symbols);
          })
          .fail(function(err) {
            observer.onError(err);
          });
      });

    return function () {
      console.log("dispose symbolUpdates.reSubscription");
      reSubscription.dispose();
    }
  })
  .map(applyUpdates) // will return number of applied
  .filter(function(x) {
    return x > 0;
  })
  //.throttle(2000)
  .subscribe(function(x) {
    symbols.arr = _.keys(symbols.keys);
    console.log("symbols", symbols);
  });

  return {
    symbols: symbols,
  };

})
;