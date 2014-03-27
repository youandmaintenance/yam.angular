/* global Klass */
(function (angular, undefined) {
  'use strict';

  var registry = {},
  $Q,
  $appConfig;

  /**
   * @class Manager
   */
  var Manager = Klass.factory(function Manager(name, entityManager) {

    //if (!entityManager instanceof 'EntityManager') {
      //throw new Error('Manager expects 2nd argument to be instance of EntityManager');
    //}

    if (!entityManager.hasEntity(name)) {
      throw new Error('An entity named ' + name + ' is not registered');
    }

    this.name = name;
    this.manager = entityManager;

  }, {
    new: function () {
      return this.manager.getEntity(this.name);
    }
  });

  /**
   * @class SectionManager
   */
  var SectionManager = (function () {
    var $http;
    return Manager.extend(function SectionManager(entityManager, $$http) {
      $http = $http || $$http;
      this.parentConstruct('Section', entityManager);
      registry.Section = registry.Section || {};
    }, {
      save: function (section) {
        return section.$save();
      },

      delete: function (section) {
        return section.$delete();
      },

      update: function (section) {
        return section.$put();
      },

      fetch: function (uuid) {
        var deferred = $Q.defer();

        if (registry.Section[uuid]) {
          deferred.resolve(registry.Section[uuid]);
        } else {
          var Section = this.new();
          Section.uuid = uuid;
          Section.$get({uuid: uuid}).then(function () {
            registry.Section[uuid] = Section;
            deferred.resolve(Section);
          });
        }
        return deferred.promise;
      },

      all: function () {
        var url = [$appConfig.url, $appConfig.api].join('/') + '/sections';
        return $http.get(url);
      }
    });
  }());

  /**
   * @class Manager
   */
  angular.module('yamApp')

  .factory('SectionManager', ['yamEntityManager', '$q', 'yamAppConfig', '$http', function (yamEntityManager, $q, yamAppConfig, $http) {
    $Q = $q;
    $appConfig = yamAppConfig;
    return new SectionManager(yamEntityManager, $http);
  }]);

}(this.angular));
