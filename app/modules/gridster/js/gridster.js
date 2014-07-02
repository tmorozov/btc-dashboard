angular.module("mtvGridster", [])
  .factory("mtvGridConfigDefaults", function() {
    return {
        widget_margins: [5, 5],
        widget_base_dimensions: [60, 60],
        widget_selector: "li.widget",
        min_cols: 10,
        autogenerate_stylesheet: false,
        resize: {
          enabled: true
        }
    };
  })
  .factory("mtvWidgetsStorage", function() {
    var demoWidgets = {
      "mainGrid//1": {
        type: "indexes-table",
        position: {
          xSize: 6,
          ySize: 2
        }
      },
      "mainGrid//2": {
        type: "chart",
        settings: {
          symbol: "BTC/LCT",
          rangeInfo: {
            name: "M1",
            step: 60000
          }
        },
        position: {
          xSize: 9,
          ySize: 3
        }
      },
      "mainGrid//3": {
        type: "ups-and-downs",
        position: {
          xSize: 3,
          ySize: 2
        }
      },
      "mainGrid//4": {
        type: "sparklines-table",
        position: {
          xSize: 5,
          ySize: 2
        }
      },
      "mainGrid//5": {
        type: "summary-table",
        position: {
          xSize: 9,
          ySize: 2
        }
      }
    };
    var demoTiles = {
      "tilesGrid//1": {
        type: "tile",
        position: {
          xSize: 3,
          ySize: 2
        }
      },
    };

    var storage = {};
    storage.mainGrid = demoWidgets;
    storage.tilesGrid = demoTiles;

    return {
      getWidgetDataByKey: function(key) {
        if (!key) {
          return {};
        }
        var gridKey = key.split("//")[0];
        return storage[gridKey][key] ;
      },
      loadWidgets: function(gridKey) {
        return storage[gridKey];
      },
      saveWidgets: function(gridKey, widgetArr) {
        gridStorage = {};
        _.forEach(widgetArr, function(itemData, i) {
          var key = gridKey + "//" + i;
          gridStorage[key] = itemData;
        });
        storage[gridKey] = gridStorage;
      }
    };
  })
  .directive("mtvGridster", function($compile, $http,  $templateCache,
    mtvWidgetsStorage, mtvGridConfigDefaults) {

    return {
      templateUrl: "modules/gridster/templates/template-grid-start.html",
      transclude: true,
      link: function(scope, element, attr) {
        var gridKey = attr.mtvGridster;
        var dashboardCfg = angular.extend({}, mtvGridConfigDefaults);

        function getWidgetScope($w) {
          var widgetInternalPart = $w.find(".mtv-widget-content").children().eq(0);
          var s = angular.element(widgetInternalPart).scope();
          return s;
        }

        function serializeWidget($w, wgd) {
          var s = getWidgetScope($w);
          var serialized = {
            position: {
              col: wgd.col,
              row: wgd.row,
              xSize: wgd.size_x,
              ySize: wgd.size_y
            }
          };
          if (s && s.serialize) {
            widgetData = s.serialize();
            angular.extend(serialized, widgetData);
          }
          return serialized;
        }

        function onResize(e, ui, $widget) {
          scope.$broadcast("widget:resize", $widget);
        }

        dashboardCfg.serialize_params = serializeWidget;
        dashboardCfg.resize.stop = onResize;

        // Set min_col to accomodate full width
        var bodyWidth = angular.element(document.body).width();
        var collumnsCount = Math.floor(bodyWidth/70);
        var widestWidget = _.max(mtvWidgetsStorage.loadWidgets(gridKey), function(w){
          return w.position.xSize;
        });
        dashboardCfg.min_cols = _.max([
          collumnsCount,
          widestWidget.position ? widestWidget.position.xSize : 0,
          dashboardCfg.min_cols]);

        var gridsterEngine = element.find("ul.dashboard-content")
          .gridster(dashboardCfg).data('gridster');
        gridsterEngine.generate_stylesheet();

        function createWidget(widgetData, widgetKey) {
          var templateStr = $templateCache.get('template-mtv-widget.html');
          var template = _.template(templateStr, {
            name: 'mtv-' + widgetData.type,
            settingsKey: widgetKey
          });

          if (template) {
            var pos = widgetData.position;
            var newWidget = gridsterEngine.add_widget(template, pos.xSize, pos.ySize, pos.col, pos.row);
            var compiled = $compile(newWidget);
            compiled(scope);
          }
        }

        scope.addWidget = function(type, xS, yS) {
          var data = {
            type: type,
            position: {
              xSize: xS,
              ySize: yS
            }
          };

          createWidget(data); // no key for new widget!
        };

        scope.removeWidget = function(event) {

          var $widget = $(event.target).parent();
          var widgetScope = getWidgetScope($widget);
          if(widgetScope) {
            widgetScope.$destroy();
          }
          gridsterEngine.remove_widget($widget);
        };

        scope.save = function() {
          var dashboardData = gridsterEngine.serialize();
          //console.log("dashboardData", gridKey, dashboardData);
          mtvWidgetsStorage.saveWidgets(gridKey, dashboardData);
        };

        scope.load = function() {
          var widgetList = gridsterEngine.$widgets;
          angular.forEach(widgetList, function(w) {
            var s = getWidgetScope(angular.element(w));
            if(s) {
              s.$destroy();
            }
          });

          gridsterEngine.remove_all_widgets();
          delete gridsterEngine.$widgets.prevObject;

          angular.forEach(mtvWidgetsStorage.loadWidgets(gridKey), createWidget);
        };

        scope.load();
      }
    };
  })
  ;