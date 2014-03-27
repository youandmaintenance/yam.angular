(function (angular, undefined) {
  'use strict';
  angular.module('yamApp', ['ui.codemirror'])
  .config([function () {
    return {
      url: 'http://yam.dev/yam',
      apiVersion: 'v1',
    };
  }])
  .provider('yamAppConfig', function () {

    var options = {
      url: undefined,
      api: undefined
    };

    this.baseUrl = function (url) {
      options.url = url;
    };

    this.api = function (api) {
      options.api = api;
    };

    this.$get = [function () {
      return angular.extend({}, options);
    }];

  });
}(this.angular));
