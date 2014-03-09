(function () {
  'use strict';
  angular.module('yam')

  /**
   * Controlls the behaviour of the article editor.
   *
   * @class ArticleController
   * @param {object} $scope
   */
  .controller('ArticleController', ['$scope', function ($scope) {

    console.log($scope.slug);
    $scope.title = 'foo';
    $scope.slug = 'bat';

  }])

  /**
   * Controlls the behaviour of the title and slug inputs.
   *
   * @class ArticleHeaderController
   * @param {object} $scope
   * @param {object} Slug
   */
  .controller('ArticleHeaderController', ['$scope', '$timeout', 'Slug', function ($scope, $timeout, Slug) {
    var prevSlug = $scope.slug;

    $scope.updateTitle = function (title) {
      Slug.get(title.title).then(function (slug) {
        //if (!$scope.slug) {
          $scope.slug = slug.value;
          prevSlug = slug.value;
        //}
      });
    };

    //$scope.updateSlug = function (slug) {

    //  Slug.validate(slug.slug).then(function () {
    //  }, function () {
    //    $scope.slug = prevSlug;
    //  }, function () {
    //  });
    //};
  }]);

}());
