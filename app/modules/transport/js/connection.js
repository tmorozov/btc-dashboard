'use strickt';

// requires SignalR & RxJS
angular.module("mtvConnection", [])
  .run(function(mtvReConnection) {
    mtvReConnection.connect(["http://localhost:8088/"])
  })
.service("mtvConnection", function() {
  return {
    connect: function(server) {
      var connectionInfo = {
        status: "Unknown",
        address: server,
        hubConnection: null,
        hubs: {
          pricingHubProxy: null,
          instrumentsHubProxy: null,
          symbolsHubProxy: null
        }
      };

      var hubConnection = $.hubConnection(server);
      connectionInfo.hubConnection = hubConnection;
      connectionInfo.hubs.instrumentsHubProxy = hubConnection.createHubProxy("instrumentsHub");
      connectionInfo.hubs.symbolsHubProxy = hubConnection.createHubProxy("symbolsHub");

      //      connectionInfo.hubs.pricingHubProxy = hubConnection.createHubProxy("PricingHub");

      var connection = Rx.Observable.create(function(o) {
        function onStatusChange(status) {
          connectionInfo.status = status;
          connectionInfo.transport = hubConnection.transport ? hubConnection.transport.name : "not set";
          o.onNext(connectionInfo);
        }

        function onStatusChangeFn(status) {
          return function() {
            onStatusChange(status);
          };
        }

        hubConnection
          .disconnected(onStatusChangeFn("closed"))
          .connectionSlow(onStatusChangeFn("slow"))
          .reconnected(onStatusChangeFn("reconnected"))
          .reconnecting(onStatusChangeFn("reconnecting"))
          .error(function(error) {
            console.log(error);
            o.onCompleted();
          });

        onStatusChange("connecting");
        hubConnection.start()
          .done(onStatusChangeFn("connected"))
          .fail(function() {
            onStatusChange("closed");
            o.onCompleted();
          });

        return Rx.Disposable.create(function() {
          hubConnection.stop();
        });

      });

      return connection;
    }
  };
})

.service("mtvReConnection", function(mtvConnection) {
  var servers = [];
  var subject;
  var delay;

  function createConnectionStream() {
    var serversStream = Rx.Observable.fromArray(servers)
      .concatMap(function(server) {
        return mtvConnection.connect(server);
      });
    var emptyWithDelay = Rx.Observable.empty().delay(delay);
    var source = Rx.Observable.concat(serversStream, emptyWithDelay)
      .repeat();

    subject = new Rx.ReplaySubject(1);
    source.subscribe(subject);

    return subject;
  }

  return {
    connect: function(serversArr, delayMs) {
      delay = delayMs || 2000;
      servers = serversArr;
      return createConnectionStream();
    },

    get stream() {
      return subject || createConnectionStream();
    }
  };
})

.service("mtvReConnectionOk", function(mtvReConnection) {
  var connectedStream = mtvReConnection.stream
    .filter(function(x) {
      return x.status === "connected" || x.status === "reconnected";
    });
  return {
    stream: connectedStream
  };
})

.factory("mtvSafeDigest", function() {
  return function(scope) {
    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
      scope.$digest();
    }
  };
})

.directive("mtvConnectionStatus", function(mtvSafeDigest, mtvReConnection) {
  return {
    scope: {},
    templateUrl: "modules/transport/templates/template-mtv-connection-status.html",
    link: function(scope, element, attr) {
      mtvReConnection.stream.subscribe(
        function(x) {
          scope.connection = x;
          mtvSafeDigest(scope);
        });
    }
  };
})

.factory("mtvInstrumentsStream", function(mtvReConnectionOk) {
  var instrumentUpdates = new Rx.Subject();
  var reSubscription = mtvReConnectionOk.stream
    .subscribe(function(x){
      var instrumentsHubProxy = x.hubs.instrumentsHubProxy;
      instrumentsHubProxy.on("OnInstrumentUpdate", function(instrument) {
        instrumentUpdates.onNext([instrument]);
      });

      instrumentsHubProxy.invoke("GetInstruments")
        .done(function(instruments) {
          instrumentUpdates.onNext(instruments);
        })
        .fail(function(err) {
          instrumentUpdates.onError(err);
        });
    });

  return {
    stream: instrumentUpdates.publish().refCount(),
    holder: reSubscription
  };

})

.service("mtvInstruments", function(mtvInstrumentsStream) {
  var pairs = {
    keys: {},
    arr: []
  };
  var pairsUpdatedStreamHandle = mtvInstrumentsStream.stream
    .map(function(x) {
      x.forEach(function(update) {
        if (update.UpdateType === 0) {
          pairs.keys[update.Instrument.Instrument] = update.Instrument.Id;
        }
        if (update.UpdateType === 1) {
          delete pairs.keys[update.Instrument.Instrument];
        }
      });
      return x.length;
    })
    .throttle(2000)
    .subscribe(function(x) {
      pairs.arr = _.map(pairs.keys,  function(v, k) {
        return k;
      });
      console.log("pairs", pairs);
    });

  return {
    get holder() {
      return pairsUpdatedStreamHandle;
    },
    get pairs() {
      return pairs;
    }
  };

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