(function (angular, Modernizr, undefined) {
  'use strict';

  angular.module('ymUtils', [])

  .service('Yam', ['$document', function ($document) {
    console.log($document);
    var path = $document[0].head.baseURI,
    api = path + '/api/v1';
    return {
      path: path,
      paths: {
        api: api,
        templates: api + '/templates'
      }
    };

    console.log(path);
    return yam;
  }])
  .service('Modernizr', function () {
    return Modernizr;
  })
  .service('Slug', ['$http', '$location', 'Yam', '$q', function ($http, $location, Yam, $q) {
    var url = Yam.paths.api + '/slug/';
    return {
      get: function (name) {
        var deferred = $q.defer();
        $http.get(url + encodeURIComponent(name)).then(function (data) {
          deferred.resolve(data.data.slug);
        });
        return deferred.promise;
      },
      validate: function (slug) {
        var deferred = $q.defer();
        $http.post(url + encodeURIComponent(slug)).then(function (data) {
          deferred.resolve(data.data.slug);
        }, function () {
            deferred.reject('slug ' + slug + ' is invalid');
        });
        return deferred.promise;

      }
    };
  }])
  .factory('ScrollProvider', ['Modernizr', function (Modernizr) {
    var defaults = {
      scrollbars: 'custom',
      customStyle: 'yam-scrollbars',
      disableTouch: !Modernizr.touch,
      mouseWheel: !Modernizr.touch,
      eventPassthrough: false,
      preventDefault: false
    };
    return {
      create: function (element, options) {
        var opts = angular.extend({}, defaults, options || {});
        return IScroll(element.get(0), opts);
      }
    };
  }])
  .directive('yamScrollable', ['Modernizr', 'ScrollProvider', function (Modernizr, ScrollProvider) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var scrollable = ScrollProvider.create(element, {
          interactiveScrollbars: attrs.interactive !== false
        });

        if (Modernizr.touch && document.addEventListener) {
          element.parent().get(0).addEventListener('touchmove', function (e) {
            e.preventDefault();
          }, false);
        }

        scope.$watch(function (val) {
          if (val !== undefined) {
            scrollable.refresh();
          }
        });
      }
    };
  }])
  .directive('yamSnapBox', [function () {
    return {
      restrict: 'E',
      link: function () {
      }
    };
  }])
  .directive('yamToolTip', [function () {
    return {
      restrict: 'A',
      link: function () {
      }
    };
  }])

  /**
   * Provides the markdown converter service
   *
   * @author Thomas Appel <mail@thomas-appel.com>
   * @license MIT
   */
  .service('MarkdowParserService', function () {
    var instance;
    return {
      get: function () {
        if (!instance) {
          return this.create();
        }
        return instance;
      },
      instance: function () {
        if (!instance) {
          instance = this.create();
        }
        return instance;
      },
      create: function () {
        return new Showdown.converter();
      }
    };

  })

  /**
   * A text to markdown filter
   *
   * @author Thomas Appel <mail@thomas-appel.com>
   * @license MIT
   */
  .filter('yamMarkdown', ['$timeout', 'MarkdowParserService', function ($timeout, MarkdowParserService) {

    var converter = MarkdowParserService.instance();

    return function (text) {
      return text ? converter.makeHtml(text) : '';
    };

  }]);
}(this.angular, this.Modernizr));
