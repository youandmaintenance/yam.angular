/* globals Klass */
(function (exports, angular, undefined) {
  'use strict';

  /**
   * @class BaseController
   *
   * @param {Object} $scope           controller scope
   * @abstract
   * @description
   */
  var BaseController = Klass.factory(function ScaffoldsSectionEditController($scope) {
    this.$getScope = function () {
      return $scope;
    };
  }, {
    $getScope: function () {
      throw new Error('scope is not defined yet');
    }
  });

  exports.Yam = exports.Yam || {};

  exports.Yam.Controllers = {
    BaseController: BaseController
  };

  return BaseController;

}(this, this.angular));
