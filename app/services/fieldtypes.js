(function (angular, undefined) {
  'use strict';
  angular.module('yamApp')

  .factory('yamSectionFields', ['$http', 'yamAppConfig', function ($http, yamAppConfig) {
    var base = yamAppConfig.url;
    var api = yamAppConfig.api;
    return {
      get: function () {
        return $http.get([base, api].join('/') + '/section/fieldtypes');
      }
    };
  }]);

}(this.angular));
