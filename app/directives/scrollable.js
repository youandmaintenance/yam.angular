(function (angular, undefined) {
  'use strict';

  angular.module('yamApp')
  .directive('ymScrollable', ['Modernizr', 'ScrollProvider', function (Modernizr, ScrollProvider) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var scrollable = ScrollProvider.create(element, {
          interactiveScrollbars: scope.$eval(attrs.interactive) !== false
        });

        if (Modernizr.touch && document.addEventListener) {
          element.parent().get(0).addEventListener('touchmove', function (e) {
            e.preventDefault();
          }, false);
        }

        scope.$watch(function (val) {
          if (val !== undefined) {
            scrollable.refresh();
          }
        });
      }
    };
  }]);
}(this.angular));
