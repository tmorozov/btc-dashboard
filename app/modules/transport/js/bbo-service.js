"use strict";

angular.module("mtvConnection")
.factory("mtvBboSubscription", function(mtvReConnectionOk) {
  var bboHubProxySubject = new Rx.ReplaySubject(1);

  var reSubscription = mtvReConnectionOk.stream
    .subscribe(function(x){
      bboHubProxySubject.onNext(x.hubs.bboHubProxy);
    });

  function getBboStream(symbolKey) {

    var bboUpdates = Rx.Observable.create(function (observer) {
      var intervalSubscription;
      var holder = bboHubProxySubject
        .subscribe(function(x) {
          if(intervalSubscription) {
            intervalSubscription.dispose();
          }

          intervalSubscription = Rx.Observable.interval(1000)
            .subscribe(function () {
              x.invoke("GetBbo", symbolKey)
                .done(function(bbo) {
                  observer.onNext(bbo);
                })
                .fail(function(err) {
                  //observer.onError(err);
                  console.log("bbo", err);
                  observer.onCompleted();
                });
            });
        });

        return function () {
          console.log('disposed id', symbolKey);
          intervalSubscription.dispose();
          holder.dispose();
        };
    });

    var emptyWithDelay = Rx.Observable.empty().delay(5000);
    var bboReUpdates = Rx.Observable.concat(bboUpdates, emptyWithDelay)
      .repeat();

    return {
      stream: bboReUpdates.publish().refCount()
    };
  }

  return {
    getBboStream: getBboStream
  };

})

;