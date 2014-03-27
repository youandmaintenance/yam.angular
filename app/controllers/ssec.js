(function (exports, angular, undefined) {
  'use strict';

  var BaseController = exports.Yam.Controllers.BaseController;

  /**
   * @class ScaffoldsSectionEditController
   *
   * @param {Object} $scope           controller scope
   * @param {Object} FieldPrototype   factory:FieldPrototype
   * @param {Object} yamSectionFields factory:yamSectionFields
   * @param {Object} yamEntityManager class:EntityManager
   * @param {Object} Section class:Resource
   *
   * @description
   * the ScaffoldsSectionEditController will be use to handle the creation and
   * update of a section Scaffold.
   */
  var ScaffoldsSectionEditController = (function () {
    var $scope, FieldConstructor;

    function concatFields($scope) {
      var fields = [];
      fields.push.apply(fields, $scope.items.left);
      fields.push.apply(fields, $scope.items.right);
      angular.forEach(fields, function (f) {
        console.log('Sorting:', f.sorting);
      });
      return fields;
    }

    function prepareFields(fields, $scope) {
      var items = {left: [], right: []};

      angular.forEach(fields, function (field, index) {
        fields[index] = FieldConstructor.createExisting(field, $scope);
        items[field.position].push(fields[index]);
      });
      return items;
    }

    return BaseController.extend(function ScaffoldsSectionEditController($$scope, FieldPrototype, yamSectionFields, SectionManager, Section, Sections) {
      this.parentConstruct($$scope);

      console.log('Sections', Sections);
      FieldConstructor = FieldPrototype;

      $scope = $$scope;
      $scope.Section = Section;
      $scope.items = prepareFields($scope.Section.fields, $scope);
      $scope.sections = Sections.data;

      if (!$scope.fields) {
        yamSectionFields.get().success(function (fieldTypes) {
          $scope.fields = fieldTypes;
        });
      }
      $scope.fields = [];
    }, {
      save: function () {

        var fields = concatFields($scope);
        console.log(fields);
        console.log(fields.length);
        $scope.Section.fields = fields;

        if ($scope.Section.uuid) {
          $scope.Section.$put(function () {
          });
        } else {
          $scope.Section.$save(function () {

            //var items = prepareFields($scope.Section.fields, $scope);

            //angular.extend($scope.items, items);


            //$routeParams.uuid = $scope.Section.uuid;
            //console.log($routeParams);
            //console.log($location);
            //var url = [$location.$$path, $scope.Section.uuid].join('/');
            ////var url = $location.$$protocol + '://' + $location.$$host + [$location.$$path, $scope.Section.uuid].join('/');
            //console.log(url);
            //console.log($route);
            //$location.path(url, false);
          });
        }
      },

      removeField: function (object) {
        var $scope = this.$getScope();
        var index = $scope.items[object.position].indexOf(object.field);
        $scope.items[object.position].splice(index, 1);
        object.index = index;
        return object;
      },

      moveTo: function (object) {
        object = this.removeField(object);
        var position = object.position === 'left' ? 'right' : 'left';

        $scope.items[position].unshift(object.field);
      },

      moveUp: function (object) {
        var $scope = this.$getScope();
        object = this.removeField(object);
        $scope.items[object.position].splice(object.index - 1 , 0, object.field);
      },

      moveDown: function (object) {
        var $scope = this.$getScope();
        object = this.removeField(object);
        $scope.items[object.position].splice(object.index + 1 , 0, object.field);
      },

      addItem: function (field, pos) {

        var proto = FieldConstructor.createNew(field, $scope.$new(true));

        $scope.$watch(proto, function (label) {
          if (!proto.label) {
            return;
          }
          proto.onLabelChange(label);
        }, true);

        $scope.items[pos].push(proto);
      }

    });
  }());


  /**
   * @class ScecFieldSelectController
   * @param {Object} $scope
   *
   * @description
   * controlls the field setting, index and position values:
   */
  var ScecFieldSelectController = (function () {
    var $scope;

    /**
     * @name  yamSectionFields
     * @private
     * @function
     */
    function fetchFields($scope, yamSectionFields) {
      yamSectionFields.get().success(function (fieldTypes) {
        $scope.fields = fieldTypes;
      });
    }

    return BaseController.extend(function ScecFieldController($$scope, yamSectionFields) {
      $scope = $$scope;
      this.parentConstruct($scope);

      if (!$scope.fields) {
        fetchFields($scope, yamSectionFields);
      }

    }, {

    });
  }());

  /**
   * @class ScecPrototypeController
   * @param {Object} $scope
   *
   * @description
   * controlls the field setting, index and position values:
   */
  var ScecPrototypeController = BaseController.extend(
    function ScecPrototypeController($scope) {
      this.parentConstruct($scope);

      $scope.settings = {
        ready: false
      };

      $scope.$watch('$index', function (index) {
        $scope.proto.sorting = index;
      });

      $scope.$watch('position', function (position) {
        var ready = $scope.settings.ready;
        $scope.settings.ready = $scope.proto.settings.ready;
        $scope.proto.position = position;
      });
    }, {
      toggleSettings: function () {
        var $scope = this.$getScope();
        $scope.settings.ready = !$scope.settings.ready;
        $scope.proto.settings.ready = $scope.settings.ready;
      }
    }
  );

  // get the app module
  angular.module('yamApp')

  .controller(
    'ScaffoldsSectionEditController',
    ['$scope', 'FieldPrototype', 'yamSectionFields', 'SectionManager', 'Section', 'Sections', ScaffoldsSectionEditController]
  )
  .controller(
    'ScecFieldSelectController',
    ['$scope', 'yamSectionFields', ScecFieldSelectController]
  )
  .controller(
    'ScecPrototypeController',
    ['$scope', ScecPrototypeController]
  );
}(this, this.angular));
