(function (angular, exports, head, undefined) {
  'use strict';

  var baseUrl = head.baseURI;
  var ROOT    = baseUrl.split(location.origin)[1];

  var yam = exports.yam = angular.module(
    'yam', [
      'yamApp',
//      'ymUtils',
      'ngRoute',
      //'ngResource',
      'ui.sortable',
      'yamEntities',
      'matchmedia-ng'
    ],
    [
      '$interpolateProvider',
      function ($interpolateProvider) {
        $interpolateProvider.startSymbol('<%');
        $interpolateProvider.endSymbol('%>');
      }
    ]
  )
  .config(
    [
      '$routeProvider',
      '$locationProvider',
      'matchmediaProvider',
      'yamAppConfigProvider',
      'yamEntityManagerProvider',

      function ($routeProvider, $locationProvider, matchmediaProvider, yamAppConfigProvider, yamEntityManagerProvider) {

      /* =============================================================================
       * Routing
       * -----------------------------------------------------------------------------
       *  Routes:
       *   - section/:uuid
       * =============================================================================
       */

        $routeProvider
        .when(ROOT, {
          controller: function () {
            alert(ROOT);
          },
          template: '<h1>' + ROOT + '</h1>'
        })
        //.when(ROOT + '/scaffolds/section/new', {
        //  controller: 'ScaffoldsSectionEditController',
        //  controllerAs: 'ssec',
        //  templateUrl:  ROOT + '/api/v1/templates/section/section.html',
        //  resolve: {
        //    Section: ['$q', '$route', 'SectionManager', function ($q, $route, SectionManager) {
        //      var deferred = $q.defer();
        //      deferred.resolve(SectionManager.new());
        //      return deferred.promise;
        //    }],
        //    Sections: ['SectionManager', function (SectionManager) {
        //      return SectionManager.all();
        //    }]
        //  }
        //})
        .when(ROOT + '/scaffolds/sections/:uuid', {
          controller: 'ScaffoldsSectionEditController',
          controllerAs: 'ssec',
          templateUrl:  ROOT + '/api/v1/templates/section/section.html',
          resolve: {
            Section: ['$q', '$route', 'SectionManager', function ($q, $route, SectionManager) {
              console.log('hey');
              return SectionManager.fetch($route.current.params.uuid);
            }],
            Sections: ['SectionManager', function (SectionManager) {
              return SectionManager.all();
            }]
          }
        });


        $locationProvider.html5Mode(true);

      /* =============================================================================
       * Media Queries
       * -----------------------------------------------------------------------------
       *  Breakpoints:
       *   - 40em (tablet)
       *   - 60em (desktop)
       * =============================================================================
       */

        matchmediaProvider.rules.desktop = '(min-width: 60em)';
        matchmediaProvider.rules.tablet = '(min-width: 40em)';

      /* =============================================================================
       * Entity Mapping
       * -----------------------------------------------------------------------------
       *  Entitties:
       *   - Section
       * =============================================================================
       */
        yamAppConfigProvider.baseUrl(baseUrl);
        yamAppConfigProvider.api('api/v1');

        //yamEntityManagerProvider.baseUrl(baseUrl);
        //yamEntityManagerProvider.api('api/v1');

        // Set alias key mappings to the provider
        yamEntityManagerProvider.keys.setAliases({
          'fieldType': 'field_type'
        });

        yamEntityManagerProvider.describe('Section', {
          urlOverride: 'sections',
          id: 'uuid',
          methods: yamEntityManagerProvider.methodTypes.ALL,
          synthetic: false
        });

        yamEntityManagerProvider.read('Section', {
          fields: {
            'type.field_type'    : 'type.type.field_type',
            //name    : 'fieldtype.name',
            settings: 'setting.value._setting_',
          }
        });

        //yamEntityManagerProvider.write('Section', {
        //  fields: {
        //    'type.type.field_type'    : 'type.field_type',
        //    'type.name'               : 'name',
        //    'setting.value._setting_' : 'settings',
        //  }
        //});

        console.log('CONF', yamEntityManagerProvider);
        //yamEntitiesProvider.manager.config.baseUrl= $document;
      }
    ]
  );

  yam.run(['$rootScope', '$log', '$window', function ($rootScope, $log, $window) {
    $rootScope.$log = $log;
    $window.addEventListener('load', function() {
        FastClick.attach(document.body);
    }, false);
  }]);


  yam.factory('YamSectionManager', ['yamEntityManager', function (yamEntitiesProvider) {

    return {
      get: function () {

      }
    }

  }]);


  yam.controller('FieldSettingController', ['$scope', function ($scope) {

    $scope.settings = {
      ready: false
    };

    $scope.toggleSettings = function () {
      $scope.settings.ready = !$scope.settings.ready;
    };

    $scope.moveUp = function (object) {
      if ($scope.$index > 0) {
        return $scope.$parent.moveUp(object);
      }
    };

    $scope.moveDown = function (object) {
      if (!$scope.$last) {
        return $scope.$parent.moveDown(object);
      }
    };

  }]);

  /**
   *
   */
  function SectionBluePrintContoller($scope, FieldPrototype, yamEntityManager, Section) {

  }


  yam.controller('SectionBluePrintContoller', ['$scope', 'FieldPrototype', 'yamEntityManager', 'Section', function ($scope, FieldPrototype, yamEntityManager, Section) {

    $scope.items = {left: [], right: []};
    $scope.Section = Section;

    if ($routeParams.uuid) {
      $scope.Section.$get({uuid: $routeParams.uuid}).then(function () {
        $scope.items = controller.prepareFields($scope.Section.fields);
      });
    }

    //_Section.$get({uuid: '249fcb61-4253-47d5-80ab-e012e19e7727'}, function (section) {
    //  $scope.section = section;
    //  $scope.items = controller.prepareFields(section.fields);
    //});
    //

    $scope.alertMe = function () {
      alert('you clicked the button');
    };
    $scope.save = function () {
      var fields = $scope.items.left;
      fields.push.apply(fields, $scope.items.right);
      $scope.Section.fields = fields;

      if ($scope.Section.uuid) {
        $scope.Section.$put(function (section) {
        });
      } else {
        $scope.Section.$save(function (section) {
          $routeParams.uuid = $scope.Section.uuid;
          console.log($routeParams);
          console.log($location);
          var url = [$location.$$path, $scope.Section.uuid].join('/');
          //var url = $location.$$protocol + '://' + $location.$$host + [$location.$$path, $scope.Section.uuid].join('/');
          console.log(url);
          console.log($route);
          //$location.path(url, false);
        });
      }
    };

    $scope.delete = function () {
      $scope.Section.$delete(function (section) {
        $scope.Section = yamEntityManager.getEntity('Section');
      });
    };

    this.prepareFields = function (fields) {
      var items = {left: [], right: []};

      angular.forEach(fields, function (field) {
        if (field.position === 'left') {
          items.left.push(FieldPrototype.createNew(field, $scope));
        } else {
          items.right.push(FieldPrototype.createNew(field, $scope));
        }
      });
      return items;
    };

    $scope.items = {left: [], right: []};
    $scope.fields = [];

    $http.get('http://yam.dev/myyam/api/v1/section/fieldtypes').success(function (types) {
      $scope.fields = types;
    });

    ConsoleManager.push('fields', $scope.fields);

    $scope.removeField = function (object) {
      var index = $scope.items[object.position].indexOf(object.field);
      var field = $scope.items[object.position].splice(index, 1);
      object.index = index;
      return object;
    };

    $scope.moveTo = function (object) {
      object = $scope.removeField(object);
      var position = object.position === 'left' ? 'right' : 'left';

      $scope.items[position].unshift(object.field);
    };

    $scope.moveUp = function (object) {
      object = $scope.removeField(object);
      $scope.items[object.position].splice(object.index - 1 , 0, object.field);
    };

    $scope.moveDown = function (object) {
      object = $scope.removeField(object);
      $scope.items[object.position].splice(object.index + 1 , 0, object.field);
    };


    $scope.addItem = function (field, pos) {

      var proto = FieldPrototype.createNew(field, $scope.$new(true));

      $scope.$watch(proto, function (label) {
        if (!proto.label) {
          return;
        }
        proto.onLabelChange(label);
      }, true);

      $scope.items[pos].push(proto);
    };

  }]);

  yam.controller('SsecTabController', ['$scope', 'matchmedia', function ($scope, matchmedia) {
    var listeners = [];
    $scope.isTablet = matchmedia.isTablet();
    $scope.isDesktop = matchmedia.isDesktop();

    $scope.tabset = {
      disabled: $scope.isDesktop || true
    };

    listeners['desktop'] = matchmedia.onDesktop(function (mediaQueryList) {
      $scope.isDesktop = mediaQueryList.matches;
    });

    //listeners['tablet'] = matchmedia.onDesktop(function (mediaQueryList) {
    //  $scope.isTablet = mediaQueryList.matches;
    //});

    $scope.$watch('isDesktop', function (desk) {
      $scope.tabset.disabled = desk;
    });

    $scope.$parent.sortOptions = {
      handle: 'header.handle',
      containment: '.stage',
      cursor: 'move',
      delay: 150,
      opacity: 0.8,
      forcePlaceholderSize: true,
      placeholder: 'proto-placeholder',
      connectWith: '.field-column',
      update: function () {
        //console.log(arguments);
      }
    };

    console.log($scope);

    //$scope.$watch('isTablet', function (tablet) {
    //  console.log('media tablet');
    //  $scope.tabset.disabled = !tablet;
    //});

  }]);

  yam.controller('ArticleHeaderController', ['$scope', 'Slug', function ($scope, Slug) {
    var oldSlug;

    $scope.updateTitle = function (title) {
      Slug.get(title.title).then(function (slug) {
        $scope.slug = slug.value;
      });
    };

    $scope.updateSlug = function (slug) {

      //alert('rrrr');
      //if (slug.slug === $scope.slug) {
      //  return;
      //}


      Slug.validate(slug.slug).then(function () {
      }, function () {
        $scope.slug = oldSlug;
        oldSlug = $scope.slug;
      }, function () {
      });
    };
  }]);

  yam.controller('SectionHeaderController', ['$scope', '$http', function ($scope, $http) {

    //  var setHandle = _.debounce(function (label) {
    //      if (label) {
    //        $http.get('/myyam/api/v1/slug/'+ label).success(function (data) {
    //          $scope.Section.handle = data.slug && data.slug.value;
    //        });
    //      }
    //  }, 500);

    //$scope.$watch('Section.name', setHandle);

  }]);

  yam.controller('ArticleController', ['$scope', function ($scope) {

    var oldSlug;

    $scope.title = null;
    $scope.slug = null;

  }]);


  yam.directive('ymRevolveOption', function () {
    return {
      transclude: true,
      replace: true,
      scope: {
        cancel: '='
      },
      require: '^ymRevolve',
      restrict: 'AE',
      link: function (scope, element, attrs, ctrl) {
        ctrl.addOption(scope);
        scope.revolve = function () {
          return ctrl.revolve(scope.cancel);
        }

        ctrl.$scope.$watch('options.length', function (length) {
          element.css({width: (100 / length) + '%'});
        });

      },
      template:
      '<div class="ym-revolve-option" ng-transclude ng-click="revolve()"></div>'
    };
  });

  yam.directive('ymRevolve', ['$compile', function ($compile) {

    var getNext = function (list, current) {
      return list[current++] || list[0];
    }

    function YamRevolveController($scope, $element) {
      this.$scope = $scope;
      this.$scope.options = [];
      this.current = $scope.current || 0;

      this.$element = $element;

      this.$scope.$watch('options.length', function (length) {
        $element.css({width: (100 * length) + '%'});
      });
    }

    YamRevolveController.prototype = {
      addOption: function (option) {
        this.$scope.options.push(option);
      },

      revolve: function (cancel) {
        var max = this.$scope.options.length - 1;
        var next = cancel ? 0 : (this.current === max ? 0 : this.current + 1);

        this.$element.css({
          left: next === 0 ? 0 : -(next *  100) + '%'
        });

        this.current = next;
      }
    };

    YamRevolveController.$inject = ['$scope', '$element', '$attrs'];

    return {
      transclude: true,
      replace: true,
      controller: YamRevolveController,
      controllerAs: 'controller',
      restrict: 'A',
      template: function(element, attrs) {
          var tag = element[0].nodeName;
          return '<'+tag+' class="ym-revolve" ng-transclude></'+tag+'>';
      }
    };
  }]);

}(this.angular, this, this.document.head));
