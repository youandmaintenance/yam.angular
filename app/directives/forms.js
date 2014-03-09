(function (angular, undefined) {
  'use strict';
  var inputTypes = {};
  var compiled = {};

  function typeSupported(type) {
    return inputTypes.hasOwnProperty(type.toLowerCase());
  }

  function nativeSupported(element, type) {
    return element[0].type.toLowerCase() === type;
  }

  function replaceController(scope, ctrl) {
    scope.controller = ctrl;
  }

  var inputTemplate = '<div class="ym-input"></div>';

  /**
   * @name ym:input type text
   *
   */
  inputTypes.text = (function () {

    function observeValue($model, $timeout) {
      $model.$viewChangeListeners.push(function (val) {
        $timeout(function () {
        }, 1000);
      });
    }

    return function (scope, element, attrs, controllers, transclusion, $compile, $window, $timeout) {

      observeValue(controllers, $timeout);

      if (attrs.ymInputNowrap) {
        return;
      }

      if (!compiled.text) {
        compiled.text = $compile(inputTemplate);
      }
      compiled.text(scope, function (clone) {
        clone.addClass('input-' + attrs.type.toLowerCase());
        if (!(element instanceof jQuery)) {
          element.after(clone);
        }
        element.wrap(clone);
      });
    };
  }());

  /**
   * @name ym:input type url
   *
   * @description
   * @example
   * <input type="url" ng-model="model" name="url"/>
   */
  inputTypes.url = (function () {
    var inputFn = inputTypes.text;
    return function (scope, element, attrs, controllers, transclusion, $compile, $window, $timeout) {
      if (!attrs.placeholder) {
        attrs.placeholder = 'http://example.com';
        element[0].placeholder = attrs.placeholder;
        inputFn(scope, element, attrs, controllers, transclusion, $compile, $window, $timeout);
      }
    };
  }());

  /**
   * @name ym:input type number
   *
   * @description
   * @example
   * <input type="number" ng-model="model" name="number"/>
   *
   */
  inputTypes.number = (function () {

    var wrapperTemplate =
    '<div class="ym-input input-number">' +
    '  <div class="spinners">' +
    '    <div class="spinner-up"></div>' +
    '    <div class="spinner-down"></div>' +
    '  </div>' +
    '</div>',
    spinnerTemplate = '<div class="spinners"></div>',

    stepUp,
    stepDown;

    function createFn(native) {
      if (stepDown && stepUp) {
        return;
      }

      if (native) {
        stepUp = function (Ctrl) {
          Ctrl.$element[0].stepUp();
          Ctrl.$model.$setViewValue(Ctrl.$element[0].value);
        };
        stepDown = function (Ctrl) {
          Ctrl.$element[0].stepDown();
          Ctrl.$model.$setViewValue(Ctrl.$element[0].value);
        };

      } else {
        stepUp = function (Ctrl) {
          Ctrl.$model.$setViewValue(Ctrl.$model.$modelValue + Ctrl.steps);
        };
        stepDown = function (Ctrl) {
          Ctrl.$model.$setViewValue(Ctrl.$model.$modelValue - Ctrl.steps);
        };
      }

    }

    function setDefaultValue(Ctrl) {
      if (isNaN(Ctrl.$model.$modelValue)) {
        Ctrl.$model.$setViewValue(Ctrl.min || 0);
        Ctrl.$model.$render();
        Ctrl.$scope.$apply();
        return false;
      }
      return true;
    }

    function InputNumberController($scope, $model, $element, $attrs) {
      var native = nativeSupported($element, 'number');
      this.$scope = $scope;
      this.$model = $model;
      this.$element = $element;
      this.steps = $attrs.step ? parseInt($attrs.step, 10) : 1;
      this.min   = $attrs.min  ? parseInt($attrs.min, 10) : false;
      this.max   = $attrs.max  ? parseInt($attrs.max, 10) : false;
      this.$native = nativeSupported($element, 'number') && $element[0].stepUp;
      createFn(this.$native);
    }

    function maxReached(Ctrl) {
      return Ctrl.max && (Ctrl.$model.$modelValue + Ctrl.steps) > Ctrl.max;
    }

    function minReached(Ctrl) {
      return Ctrl.min && Ctrl.$model.$modelValue - Ctrl.steps < Ctrl.min;
    }

    InputNumberController.prototype = {
      increment: function () {
        if (setDefaultValue(this)) {
          if (!maxReached(this)) {
            stepUp(this);
            this.$scope.$apply();
            this.$model.$render();
          }
        }
      },
      decrement: function () {
        if (setDefaultValue(this)) {
          if (!minReached(this)) {
            stepDown(this);
            this.$scope.$apply();
            this.$model.$render();
          }
        }
      },
    };


    return function (scope, element, attrs, controllers, transclusion, $compile, $window, $timeout) {

      if (!compiled.number) {
        compiled.number = $compile(wrapperTemplate);
      }

      var controller = new InputNumberController(scope, controllers, element, attrs);

      compiled.number(scope, function (clone, $scope) {
        var spinners = clone.children().children(),
        up = spinners.eq(0),
        down = spinners.eq(1);

        up.on('click', function (e) {
          e.preventDefault();
          controller.increment();
        });
        down.on('click', function (e) {
          e.preventDefault();
          controller.decrement();
        });

        element.after(clone);
        clone.prepend(element);
      });
    };

  }());

  inputTypes.range = (function () {
    return function (scope, element, attrs, controllers, transclusion, $compile, $window, $timeout) {
      if (nativeSupported(element, 'range')) {
        console.log('native range');
      } else {
        console.log('not native range');
      }
    };
  }());


  var checkableTemplates = {
    checkbox:
    '<div class="ym-input input-checkbox">' +
    '  <div class="checkbox"></div>' +
    '</div>',
    radio:
    '<div ng-model="ngModel" class="ym-input input-radio" >' +
    '  <div class="radio"></div>' +
    '</div>',
  };

  function CheckableController($scope, $element, $attrs, $model) {
    this.$scope = $scope;
    this.$element = $element;
    this.$model = $model;
    this.$id    = $attrs.ngModel.toLowerCase();
    this.$type = $attrs.type.toLowerCase();
    this.trueVal = $attrs.trueValue ? $attrs.ngTrueValue : true;
  }

  CheckableController.prototype = {
    getTemplate: function () {
      return checkableTemplates[this.$type];
    },
    onChange: function (element, $animate, $timeout) {
      var that = this,
      listener = that.$type === 'radio' ? function (event, model) {
        if (that.$model.$viewValue === model.$viewValue) {
          $animate.addClass(element, 'checked');
        } else {
          $animate.removeClass(element, 'checked');
        }
      } : function (event, model) {
        if (!event) {
          return that.$scope.$broadcast('attrschanged.' + that.$id, that.$model);
        }
        if (that.$model.$viewValue) {
          $animate.addClass(element, 'checked');
        } else {
          $animate.removeClass(element, 'checked');
        }
      };

      this.$scope.$on('attrschanged.' + this.$id, listener);

      // set the inital classname
      this.$scope.$watch(function (value) {
        $timeout(function () {
          that.$scope.$broadcast('attrschanged.' + that.$id, listener);
        }, 200);
      });

      this.$model.$viewChangeListeners.push(listener);
      return listener;
    }
  };

  var radioGroups = {};

  function getCheckableController(scope, element, attrs, controllers) {

    var crl;

    if (attrs.type.toLowerCase() === 'radio') {
      if (radioGroups[attrs.ngModel]) {
        return radioGroups[attrs.ngModel];
      } else {
        radioGroups[attrs.ngModel] = new CheckableController(scope, element, attrs, controllers);
        return radioGroups[attrs.ngModel];
      }
    }
    return new CheckableController(scope, element, attrs, controllers);
  }

  /**
   * @see angularjs issue #4970
   */
  inputTypes.checkbox = (function () {
    return function (scope, element, attrs, controllers, transclusion, $compile, $window, $timeout, $animate) {
      var listener,
      controller = new CheckableController(scope, element, attrs, controllers);

      if (!compiled.checkable) {
        compiled.checkable = $compile(controller.getTemplate());
      }

      compiled.checkable(scope, function (clone, $scope) {
        var elements = clone.children(),
        fakeBox = elements.eq(0);
        element.after(clone);
        clone.append(element);
        listener = controller.onChange(fakeBox, $animate, $timeout);
      });
    };
  }());

  inputTypes.radio = inputTypes.checkbox;

  inputTypes.date = (function () {
    return function (scope, element, attrs, controllers, transclusion, $compile, $window, $timeout) {
      if (nativeSupported(element, 'date')) {
        console.log('native date');
      } else {
        console.log('not native date');
      }
    };
  }());

  var inputDirective = ['$compile', '$window', '$timeout', '$animate', function ($compile, $window, $timeout, $animate) {
    return {
      priority: 12000,
      restrict: 'EA',
      require: '?ngModel',
      compile: function (tElement, tAttrs, transclusion) {
        console.log('__compile__');
        compiled[tAttrs.type] = false;
        return function (scope, element, attrs, controllers) {
          if (controllers && typeSupported(attrs.type)) {
            inputTypes[attrs.type.toLowerCase()](scope, element, attrs, controllers, transclusion, $compile, $window, $timeout, $animate);
          }
        };
      }
    };
  }];

  angular.module('yamApp')
  .directive('input', inputDirective)
  .directive('ymEditField', function ($compile) {

    return {
      priority: 11000,
      replace: true,
      tranclude: 'element',
      scope: {},
      restrict: 'A',
      compile: function (element, attrs, linker) {

        var tmpl = '<div class="ym-edit-field fpp">'+
        '  <div class="button edit" ng-class="{true:\'active\'}[!disabled]"ng-click="toggleActive()"><span>edit</span></div>'+
        '  <div class="ym-input"></div>'+
        '</div>';
        var compiler = $compile(tmpl);

        return function (scope, element, attrs) {
          var compiled;
          scope.disabled = true;
          scope.toggleActive = function () {
            scope.disabled = false;//!scope.disabled;
            element.select();

            if (!scope.disabled) {
              element.select();
            }
          };

          //attrs.$set('ngDisabled', scope.disabled);
          //scope.$eval(attrs.ngDisabled);

          element.on('blur', function () {
            scope.$apply(function () {
              scope.disabled = true;
            });
          });

          compiler(scope, function (clone) {
            //element.wrap(clone);
            element.after(clone);
            clone.find('.ym-input').append(element);
          });
        };
      }
      , template: '<input ym-input-nowrap="true" ng-disabled="disabled"/>'
    };
  })
  .directive('ymLoadUnlock', ['$window', function ($window) {
    return {
      restrict: 'A',
      treminal: true,
      priority: 120000,
      scope: {
        trigger: '&'
      },
      link: function (scope, element, attrs) {

        scope.unlocked = false;

        element.on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          if (scope.unlocked) {
            scope.trigger();
            return unload();
          }

          scope.unlocked = true;
          attrs.$addClass('unlocked');
          angular.element($window.document).on('click', unload);
          scope.$apply();
        });

        function unload() {
          scope.unlocked = false;
          attrs.$removeClass('unlocked');
          angular.element($window.document).off('click', unload);
          scope.$apply();
        }
      }
    };
  }]);

}(this.angular));