"use strict";

angular.module("mtvConnection")
.factory("mtvBboSubscription", function(mtvReConnectionOk) {
  var bboHubProxySubject = new Rx.ReplaySubject(1);

  var reSubscription = mtvReConnectionOk.stream
    .subscribe(function(x){
      bboHubProxySubject.onNext(x.hubs.bboHubProxy);
    });

  function getBboStream(symbolId) {
    var bboUpdates = new Rx.Subject();
    var holder = bboHubProxySubject
      .subscribe(function(x) {
        Rx.Observable.interval(1000)
          .subscribe(function () {
            x.invoke("GetBbo", symbolId)
              .done(function(bbo) {
                bboUpdates.onNext(bbo);
              })
              .fail(function(err) {
                bboUpdates.onError(err);
              });
          });
      });

    return {
      stream: bboUpdates.publish().refCount(),
      //holder: holder
    };
  }

  return {
    getBboStream: getBboStream,
//    holder: reSubscription
  };

})

;