angular.module("mtvTiles", ["mtvConnection"])
  .directive("mtvTile", function (mtvPairsSrv, mtvWidgetsStorage, mtvInstruments, mtvSafeDigest) {
    return {
      templateUrl: "modules/tiles/templates/template-mtv-tile.html",
      scope: {},
      link: function (scope, element, attr) {
        function splitPrice(number) {
          var str = String(number);
          return {
            price: number,
            part1: +str.substr(0, 4),
            part2: +str.substr(4, 2),
            part3: +str.substr(6),
          };
        }

        // for typeahead
        scope.pairs = mtvInstruments.pairs;
        // mtvReferenceData.stream
        //   .map(function(x) {
        //     x.forEach(function(update) {
        //       if (update.UpdateType === 0) {
        //         scope.pairs.push(update.Instrument.Instrument);
        //       }
        //       // if (update.UpdateType === 1) {
        //       //   delete $scope.symbols[update.CurrencyPair.Symbol];
        //       // }
        //     });
        //     return x.length;
        //   })
        //   .throttle(500)
        //   .subscribe(function(x) {
        //     console.log("pairs", scope.pairs);
        //     mtvSafeDigest(scope);
        //   });

        // mtvPairsSrv.get().then(function (data) {
        //   scope.pairs = data;
        // });

        scope.tile = {
          Symbol: "",
          PriceSell: splitPrice(1.36455),
          PriceBuy: splitPrice(1.36465)
        };

        scope.order = {
          Symbol: "BTC",
          Size: 10000
        };

        // load settings
        var widgetData = mtvWidgetsStorage.getWidgetDataByKey(attr.key);
        if (widgetData.settings) {
          scope.tile.Symbol = widgetData.settings.symbol;
          scope.order = widgetData.settings.order;
        }

        scope.serialize = function () {
          return {
            type: "Tile",
            settings: {
              symbol: scope.tile.Symbol,
              order: scope.order
            }
          };
        };

      }
    };
  });
