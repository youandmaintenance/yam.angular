(function (angular, undefined) {
  'use strict';
  angular.module('yamApp')

  /**
   *
   */
  .directive('ymMdEditor', [function () {
    return {
      restrict: 'E',
      transclide: false,
      replace: true,
      link: function () {
      },
      template:
      '<div class="ym-editor">' +
      ' <div class="ym-md-edit"><textarea></textarea></div>' +
      ' <div class="ym-md-edit-preview"></div>' +
      '</div>'
    };
  }])

  /**
   *
   */
  .directive('ymMdEditPreview', [function () {
    return {
      restrict: 'E',
      transclide: false,
      replace: true,
      link: function () {
      },
      template:
      '<div class="ym-editor">' +
      '  <div class="ym-md-edit"><textarea></textarea></div>' +
      '  <div class="ym-md-edit-preview"></div>' +
      '</div>'
    };
  }])

  /**
   *
   */
  .directive('ymMdEdit', [function () {
    return {
      restrict: 'E',
      transclide: false,
      replace: true,
      link: function () {
      },
      template:
      '<div class="ym-editor">' +
      '  <div class="ym-md-edit"><textarea></textarea></div>' +
      '  <div class="ym-md-edit-preview"></div>' +
      '</div>'
    };
  }])

  /**
   *
   */
  .directive('ymTextBox', [function () {
    return {
      restrict: 'E',
      transclide: false,
      replace: true,
      link: function () {
      },
      template:
      '<div class="ym-editor">' +
      '  <div class="ym-md-edit"><textarea></textarea></div>' +
      '  <div class="ym-md-edit-preview"></div>' +
      '</div>'
    };
  }])

  /**
   *
   */
  .directive('ymTextInput', [function () {
    return {
      restrict: 'E',
      transclide: false,
      replace: true,
      link: function () {
      },
      template:
      '<div class="ym-editor">' +
      '  <div class="ym-md-edit"><textarea></textarea></div>' +
      '  <div class="ym-md-edit-preview"></div>' +
      '</div>'
    };
  }])

  /**
   *
   */
  .directive('ymTextCheckbox', [function () {
    return {
      restrict: 'E',
      transclide: false,
      replace: true,
      link: function () {
      },
      template:
      '<div class="ym-editor">' +
      '  <div class="ym-md-edit"><textarea></textarea></div>' +
      '  <div class="ym-md-edit-preview"></div>' +
      '</div>'
    };
  }]);

}(this.angular));
