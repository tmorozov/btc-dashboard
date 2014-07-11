angular.module("mtvTiles", ["mtvConnection"])
  .directive("mtvTile", function (mtvPairsSrv, mtvWidgetsStorage, mtvSymbols, mtvBboSubscription) {
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
        scope.symbols = mtvSymbols.symbols;

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

        var bboSubscription;
        function removeOldSubscription() {
          if (bboSubscription) {
            console.log("dispose previous subscription");
            bboSubscription.dispose();
          }
        }
        scope.$watch("tile.Symbol", function(newVal, oldVal) {
          if (newVal) {
            removeOldSubscription();

            var symbolInfo= mtvSymbols.symbols.keys[newVal];
            bboSubscription = mtvBboSubscription.getBboStream(symbolInfo.Key).stream
            .subscribe(function(bbo) {
              console.log("bbo", bbo);
              scope.tile.PriceSell = splitPrice(bbo.Bid);
              scope.tile.PriceBuy = splitPrice(bbo.Ask);
            });
          }
        });

        scope.$on('$destroy', function() {
          console.log("destroy tile");
          removeOldSubscription();
        });

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
