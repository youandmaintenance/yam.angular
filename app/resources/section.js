(function (angular, undefined) {
  'use strict';
  angular.module('yamApp')

  .factory('Section', ['$resource', function ($resource) {
    var url = 'http://yam.dev/myyam',
    api = 'v1';

    var Section = $resource(
      url + '/api/' + api + '/section:id',
      {
        id: '@id'
      },
      {
        edit: {
          method: 'PUT'
        },
        delete: {
          method: 'DELETE'
        }
      }
    );
    return {
      create: function () {
        return new Section();
      }
    };
  }]);

}(this.angular));
