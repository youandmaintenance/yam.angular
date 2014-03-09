(function (angular, undefined) {
  'use strict';

  angular.module('yamApp')

  /**
   * @name filter:yam:ucfirst
   *
   * @description ucfirst takes an input string and casts the first character
   * into an uppercase representation.
   *
   * @param {string} value: the input string
   * @return {string}
   */
  .filter('ucfirst', function () {
    return function ($value) {
      if ($value.length) {
        return $value.substr(0, 1).toUpperCase() + $value.substr(1);
      }
    };
  })

  /**
   * @name filter:yam:markdown
   *
   * @description markdown takes an input string (markdown notation ) and
   * converts it to its html representation using the showdown js library.
   *
   * @param {string} value: the input string
   * @return {string} the converted html as string
   *
   */
  .filter('markdown', ['$sce', 'Showdown', function ($sce, Showdown) {
    return function (value) {
      value = value !== undefined ? value : '';
      if (value.length) {
        return $sce.trustAsHtml(Showdown.makeHtml(value));
      }
    };
  }]);

}(this.angular));
