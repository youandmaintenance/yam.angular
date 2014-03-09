(function (app, exports, undefined) {
  'use strict';

  app.directive('yamArticleHeader', ['Yam', function (Yam) {
    return {
      restrict: 'E',
      scope: {
        title: '=',
        slug: '=',
        onUpdateTitle: '&',
        onUpdateSlug: '&'
      },
      controller: ['$scope', function ($scope) {
        this.$scope = $scope;
      }],
      controllerAs: 'controller',
      transclude: true,
      replace: true,
      link: function (scope, element, attrs) {

      },
      templateUrl: Yam.paths.templates + '/entry/header.html'
    };
  }]);

  app.directive('yamArticleSlug', function () {
    return {
      restrict: 'CA',
      require: '^yamArticleHeader',
      transclude: true,
      replace: true,
      link: function (scope, element, attrs, controller) {
        element.on('blur', function () {
          controller.$scope.onUpdateSlug({slug:scope.slug});
          scope.$apply();
        });
      },
    };
  });

  app.directive('yamArticleTitle', ['$timeout', function ($timeout) {
    return {
      restrict: 'CA',
      require: '^yamArticleHeader',
      transclude: true,
      replace: true,
      link: function (scope, element, attrs, controller) {

        var timeout;
        element.on('keyup', function () {
          $timeout.cancel(timeout);
          timeout = $timeout(function () {
            controller.$scope.onUpdateTitle({title:scope.title});
          }, 600);

        });

        //element.on('blur', function () {
        //  controller.$scope.onUpdateTitle({title:scope.title});
        //  scope.$apply();
        //});
      },
    };
  }]);
}(this.yam, this));
