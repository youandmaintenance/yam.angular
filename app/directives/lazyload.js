(function (angular, undefined) {
  'use strict';
  angular.module('yamApp')

  .directive('ymLazyLoad', function () {
    return {
      transclude: 'element',
      priority: 1200,
      terminal: true,
      restrict: 'A',
      compile: function (element, attrs, linker) {
        return function (scope, element, attrs) {
          var hasBeenCalled = false;
          var unwatch = scope.$watch(attrs.ymLazyLoad, function (value) {
            if (value && !hasBeenCalled) {
              hasBeenCalled = true;
              linker(scope, function (clone) {
                element.after(clone);
              });
              unwatch();
            }
          });
        };
      }
    };
  });
}(this.angular));
