// Code goes here

angular.module("typeahead.module", [])
  .directive("mtvTypeahead", function() {
    return {
      scope: {
        suggestions: "=",
        value: "=",
        placeholder: "@"
      },
      template: '<input class="typeahead" type="text" placeholder="{{placeholder}}" />',
      link: function(scope, element, attr) {

        function findMatches(q, cb) {
          var matches, substringRegex;
          matches = [];
          substrRegex = new RegExp(q, 'i');
          $.each(scope.suggestions, function(i, str) {
            if (substrRegex.test(str)) {
              matches.push({
                value: str
              });
            }
          });
          cb(matches);
        };

        function updateScope(object, suggestion, dataset) {
          scope.$apply(function() {
            scope.value = suggestion.value;
          });
        }

        // Update the value binding when a value is manually selected from the dropdown.
        element.bind('typeahead:selected', function(object, suggestion, dataset) {
          updateScope(object, suggestion, dataset);
        });

        // Update the value binding when a query is autocompleted.
        element.bind('typeahead:autocompleted', function(object, suggestion, dataset) {
          updateScope(object, suggestion, dataset);
        });

        element.find(">.typeahead").typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        }, {
          name: 'typeahead',
          displayKey: 'value',
          source: findMatches
        });

      } // link -- end
    };
  })