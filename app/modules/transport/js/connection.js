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
          pricingHubProxy: null
        }
      };

      var hubConnection = $.hubConnection(server);
      connectionInfo.hubConnection = hubConnection;
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

.service("mtvReferenceData", function(mtvReConnectionOk) {
  var metaDataStream = mtvReConnectionOk.stream
    .flatMap(function(x) {
      var referenceDataHubProxy = x.hubConnection.createHubProxy("instrumentsHub");
      var instrumentUpdates = new Rx.Subject();
      referenceDataHubProxy.on("OnInstrumentUpdate", function(currencyPair) {
        instrumentUpdates.onNext([currencyPair]);
      });

      referenceDataHubProxy.invoke("GetInstruments")
        .done(function(instruments) {
          instrumentUpdates.onNext(instruments);
        })
        .fail(function(err) {
          instrumentUpdates.onError(err);
        });

      return instrumentUpdates.publish().refCount();
    });

  return {
    stream: metaDataStream
  };
})

.service("mtvInstruments", function(mtvReferenceData) {
  var pairs = {
    keys: {},
    arr: []
  };
  var pairsKey = {};
  var pairsUpdatedStreamHandle = mtvReferenceData.stream
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
    .throttle(5000)
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

// .factory("mtvAllPricesStream", function(mtvReConnectionOk) {
//   var allPrices = new Rx.Subject();
//   var reSubscription = mtvReConnectionOk.stream
//     .subscribe(function(x){
//       x.hubs.pricingHubProxy.on("OnNewPrice", function(price) {
//         allPrices.onNext(price);
//       });
//     });

//   return {
//     stream: allPrices.publish().refCount(),
//     holder: reSubscription
//   };

// })

// .factory("mtvPriceStream", function(mtvReConnectionOk, mtvAllPricesStream) {

//   return function(symbol) {
//     var priceStream = mtvAllPricesStream.stream
//       .filter(function(x) {
//         return x.s === symbol;
//       });

//     var reConnection = mtvReConnectionOk.stream
//       .subscribe(function(x){
//         x.hubs.pricingHubProxy.invoke("SubscribePriceStream", {
//           CurrencyPair: symbol
//         })
//           .done(function() {
//             console.log("Subscribed to " + symbol);
//           })
//           .fail(function(ex) {
//             console.log("Subscribed to " + symbol + "fail", ex);
//           });
//       });

//     return {
//       stream: priceStream.publish().refCount(),
//       holder: reConnection
//     };
//   };
// })

;