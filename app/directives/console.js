(function (angular, undefined) {
  'use strict';
  angular.module('yamApp')

  /**
   * @name directive:ymCodeMirror
   *
   * @description
   *
   */
  .directive('ymCodemirror', ['$filter', '$log', '$timeout',  '$window', function ($filter, $log, $timeout, $window) {
    var CodeMirror = $window.CodeMirror;

    if (typeof CodeMirror === undefined) {
      throw new Error('CodeMirror is required but not found');
    }

    function setUp(element, options) {
      var el = element.get(0);
      var editor = new CodeMirror(el, options);
      return editor;
    }

    return {
      restrict: 'AE',
      require: '?ngModel',
      link: function (scope, element, attrs, ngModel) {
        var editor = setUp(element, {});
        // setup options
        var unwatch = scope.$watch(function () {
          var options = angular.extend({}, scope.$eval(attrs.ymCodemirror), scope.$eval(attrs.ymCodemirrorOptions));

          angular.forEach(options, function (option, key) {
            if (options.hasOwnProperty(key)) {
              editor.setOption(key, option);
            }
          });
          unwatch();
        });


        scope.$watch(attrs.ymCmUpdate, function (update) {
          if (update) {
            $timeout(function () {
              ngModel.$render();
            });
          }
        });

        if (!ngModel) {
          $log.info('no model found, returning');
          return;
        }
        $log.info('model found');

        ngModel.$formatters.push(function (value) {

          if (angular.isUndefined(value)) {
            return '';
          }

          if (angular.isObject(value) || angular.isArray(value)) {
            return $filter('json')(value);
          }

          if (!angular.isString(value)) {
            if (angular.isFunction(value)) {
              return value.toString();
            }
            $log.error('value could not be converted to string');
            return null;
          }
          return value;
        });

        ngModel.$render = function () {
          var value = ngModel.$viewValue || '';
          editor.setValue(value);
        };
      },
      template:
      '<div></div>'
    };
  }])

  /**
   * @name directive:ymConsole
   */
  .directive('ymConsole', ['$filter', '$timeout', 'ConsoleManager', function ($filter, $timeout, ConsoleManager) {

    function ConsoleController ($scope) {
      this.$scope = $scope;
      this.$scope.models = [];
      this.$scope.writers = [];
      ConsoleManager.registerConsole(this);
    }

    ConsoleController.prototype = {
      add: function (data) {
        this.$scope.models.push(data);
      },
      registerWriter: function (writerScope) {
        this.$scope.writers.push(writerScope);
      },
      forceUpdate: function (scope) {
        console.log(scope);
      },
      setActive: function (promise, $index) {
        if (this.$scope.writers[$index]) {
          this.$scope.writers[$index].toggle();
        }
        promise.resolve();
      },
      notify: function (writerScope) {
        console.log('been notified', writerScope);
      },
      bind: function (fn) {
        var that = this;
        return function () {
          return fn.apply(that, arguments);
        };
      }
    };

    return {
      replace: true,
      restrict: 'E',
      controller: ConsoleController,
      controllerAs: 'ctrl',
      //link: function (scope, element, attrs, ngModel) {
      //},
      template:
      '<div class="ym-console"><h1>Console</h1>' +
      '  <div class="ym-console-header">' +
      '    <div class="toggle" ng-click="toggle()">toggle</div>' +
      '  </div>' +
      '  <div class="ym-console-body">' +
      '    <div ym-tabset>' +
      '      <div ym-tab ng-repeat="data in models" label="{{data.label}}" ym-tab-resolving="ctrl.bind(ctrl.setActive)">' +
      '        <ym-console-writer ng-model="data.model"></div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    };
  }])

  /**
   * @name directive:ymConsoleWriter
   */
  .directive('ymConsoleWriter', ['$filter', function ($filter) {

    var defaultOpts = {
      lineWrapping : true,
      lineNumbers: true,
      readOnly: 'nocursor',
      mode: {
        name: 'javascript',
        json: true
      },
      theme: 'smyck'
    };

    return {
      transclude: false,
      replace: true,
      scope: {
        ngModel: '='
      },
      restrict: 'E',
      require: ['^ngModel', '^ymConsole'],
      link: function (scope, element, attrs, controllers) {

        //var ngModel = controllers[0];
        var ctrl     = controllers[1];

        ctrl.registerWriter(scope);

        scope.update = false;

        scope.options = angular.extend({}, defaultOpts);

        scope.update = scope.showOnStart || false;

        scope.toggle = function () {
          scope.update = !scope.update;
          scope.parseCode();
        };

        scope.parseCode = function () {
          scope.code = $filter('json')(scope.ngModel);
        };

        scope.$watch('ngModel', scope.parseCode, true);

      },
      template:
      '<div class="ym-console-writer">' +
      '  <div ym-codemirror="options" ym-cm-update="update" ng-model="code"></div>' +
      '</div>'
    };
  }]);

}(this.angular));
