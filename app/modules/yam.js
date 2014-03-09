(function (angular, undefined) {
  'use strict';
  angular.module('yamApp', ['ui.codemirror'])
  .config([function () {
    return {
      url: 'http://yam.dev/yam',
      apiVersion: 'v1',
    };
  }]);
}(this.angular));
