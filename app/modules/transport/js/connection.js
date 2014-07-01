"use strict";

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

;