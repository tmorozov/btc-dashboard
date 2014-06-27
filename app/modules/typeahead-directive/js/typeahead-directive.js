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

        function substringMatcher(strs) {
          return function findMatches(q, cb) {
            var matches, substringRegex;
            matches = [];
            substrRegex = new RegExp(q, 'i');
            $.each(strs, function(i, str) {
              if (substrRegex.test(str)) {
                matches.push({
                  value: str
                });
              }
            });

            cb(matches);
          };
        }

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
        
        var $typeaheadHolder = element.find(">.typeahead");
        scope.$watchCollection("suggestions", function(newData) {
          if (newData && newData.length) {
            $typeaheadHolder.typeahead('destroy');
            
            $typeaheadHolder.typeahead({
              hint: true,
              highlight: true,
              minLength: 1
            }, {
              name: 'typeahead',
              displayKey: 'value',
              source: substringMatcher(newData)
            });
          }
        });
      } // link -- end
    };
  })