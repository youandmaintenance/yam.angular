(function (angular, exports, undefined) {
  'use strict';
  var yam = exports.yam = angular.module(
    'yam', [
      'yamApp',
//      'ymUtils',
      'ui.sortable',
      'ngResource',
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
      'matchmediaProvider', 'yamEntityManagerProvider',
      function (matchmediaProvider, yamEntityManagerProvider) {
        matchmediaProvider.rules.desktop = '(min-width: 60em)';
        matchmediaProvider.rules.tablet = '(min-width: 40em)';

        // Set alias key mappings to the provider
        yamEntityManagerProvider.keys.alias({
          'fieldType': 'field_type'
        });

        yamEntityManagerProvider.describe('Section');

        yamEntityManagerProvider.describe('SectionFields', {
            type    : 'type.type.field_type',
            name    : 'type.name',
            settings: 'setting.value._setting_',
          }
        );

        yamEntityManagerProvider.readUsing('Section', {
          fields: 'SectionFields'
        });

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


  yam.controller('SectionBluePrintContoller',
                 ['$scope', 'FieldPrototype', 'Section', 'ConsoleManager', 'yamEntityManager', '$http',
         function ($scope, FieldPrototype, Section, ConsoleManager, yamEntityManager, $http) {

    var controller = this;
    var section = Section.create();

    function Prototype(field) {
      this.label = null;
      angular.extend(this, field);
      this.settings = angular.extend({}, this.defaults || {});
    }

    section.$get(function (section) {

      var s = yamEntityManager.read('Section', section);

      console.log('R', s);
      console.log('R', section);

      $scope.section = section;
      $scope.items = controller.prepareFields(section.fields);
      //ConsoleManager.push('remote', section);
      //ConsoleManager.push('remote items', $scope.items);
      //ConsoleManager.push('prototypes', $scope.items);
    });

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

    $scope.items = {};
    $scope.fields = [];

    $http.get('http://yam.dev/myyam/api/v1/section/fieldtypes').success(function (types) {
      $scope.fields = types;
    });

    //$scope.fields = [
    //  {
    //    name: 'Input',
    //    type: 'input',
    //    defaults: {
    //      required: true,
    //      validation: null
    //    }
    //  },
    //  {
    //    name: 'Text',
    //    type: 'text',
    //    defaults: {}
    //  },
    //  {
    //    name: 'Number',
    //    type: 'float',
    //    defaults: {}
    //  }
    //];

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

    $scope.sortOptions = {
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

  yam.controller('TabController', ['$scope', 'matchmedia', function ($scope, matchmedia) {
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

}(this.angular, this));
