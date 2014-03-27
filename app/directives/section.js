(function (angular, undefined) {
  'use strict';

  var baseFieldSettings = {
    transclude: true,
    replace: false,
    scope: {
      settings: '='
    },
    restrict: 'A',
    template:
    '<div class="ym-field-foo-settings">'+
    '  <div class="whatever" ng-transclude></div>' +
    '  <label>Validation'+
    '    <input ym-input type="text" ng-model="settings.validation"/>'+
    '  </label>'+
    '  <label>required'+
    '    <input ym-input type="checkbox" ng-model="settings.required"/>'+
    '  </label>'+
    '</div>'
  };

  angular.module('yamApp')

  /**
   * @name yam.directive:ymFieldPrototype
   *
   * @description
   *
   */
  //.directive('ymFieldPrototype', function () {
  //  return {
  //    restrict: 'A',
  //    link: function (scope, element, attrs) {
  //      var model = scope.$eval(attrs.model);
  //      attrs.$observe('sorting', function (sorting) {
  //        model.sorting = scope.$eval(attrs.sorting);
  //      });
  //      attrs.$observe('position', function (position) {
  //        model.position = scope.$eval(attrs.position);
  //      });
  //    }
  //  };
  //})
  .directive('yymFieldPrototype', function () {
    return {
      scope: {
        ngModel: '=',
        position: '=',
        index: '=',
        count: '=',
        remove: '&',
        up: '&',
        down: '&',
        switchColumn: '&',
        placeholder: '@'
      },
      transclude: true,
      replace: true,
      require:'^ngModel',
      restrict: 'AE',
      link: function (scope, element) {

        scope.doMoveUp = function (message) {
          if (!scope.first) {
            return scope.up(message);
          }
        };

        scope.doMoveDown = function (message) {
          if (!scope.last) {
            return scope.down(message);
          }
        };

        scope.doMoveToColumn = function (message) {
          return scope.switchColumn(message);
        };

        scope.first = false;
        scope.last = false;

        scope.$watch('index', function () {
          scope.first = scope.index === 0;
          scope.last = scope.index === (scope.count - 1);
        });

        console.log(scope);

      },
      template:
      '<div class="ym-field-prototype">' +
      '  <div class="fieldtype-header">' +
      '    <div ng-click="doMoveUp()" class="button icon-up" ng-class="{true: \'disabled\'}[first]">move up</div>' +
      '    <div ng-click="doMoveDown()" class="button icon-down" ng-class="{true: \'disabled\'}[last]">move down</div>' +
      '    <div ng-click="switchColumn()" class="button icon-move-{{position}}">move to</div>' +
      '    <div class="icon icon-fieldtype"></div>{{ngModel.type}}' +
      '  </div>' +
      '  <input type="text" name="{{ngModel.name | lowercase}}" ng-model="ngModel.label" placeholder="{{placeholder}}"/>' +
      '  <div ng-transclude></div>' +
      '</div>'
    };
  })

  /**
   * @name yam.directive:ymFieldSetting
   *
   * @description
   *
   */
  .directive('ymFieldSetting', ['$compile', function ($compile) {
    var templates = {},
      getTemplate = function (type) {
        var template = '<div ym-settings-' + type + ' settings="settings">'+
        '</div>';
        return template;
      };
    return {
      scope: {
        settings: '='
      },
      transclude: false,
      replace: true,
      restrict: 'A',
      template: '<div class="ym-settings" ></div>',
      compile: function (element, attrs) {
        return function (scope, element, attrs) {
          var compiled;

          if (!templates[attrs.fieldtype]) {
            templates[attrs.fieldtype] = $compile(getTemplate(attrs.fieldtype));
          }

          templates[attrs.fieldtype](scope, function (clone) {
            element.append(clone);
          });
        };
      }
    };
  }])

  /**
   * @name yam.directive:ymSettingsInput
   *
   * @description
   *
   */
  .directive('ymSettingsInput', function () {
    return angular.extend({
      link: function (scope, element, attrs) {
        console.log(scope, element);
      }
    }, baseFieldSettings);
  })

  .directive('ymSettingsText', function () {
    return angular.extend({
      link: function (scope, element, attrs) {
        console.log(scope, element);
      }
    }, baseFieldSettings);
  })
  .directive('ymSettingsMarkdown', function () {
    return angular.extend({
      link: function (scope, element, attrs) {
        console.log(scope, element);
      }
    }, baseFieldSettings);
  })

  .directive('ymSettingsFloat', function () {
    return {
      transclude: false,
      scope: {
        field: '='
      },
      restrict: 'A',
      //require: '^ymFieldSetting',
      link: function (scope, element) {
        console.log(element);
        console.log('i\'ve been linked');
      },
      template:
        '<div><h3>Im a number field, look at me!</h3></div>'
    };
  });

}(this.angular));
