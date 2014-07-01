"use strict";

angular.module("mtvConnection")
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

;