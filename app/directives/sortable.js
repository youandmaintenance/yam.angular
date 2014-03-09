(function (app, exports, undefined) {
  'use strict';

  app.directive('yamSortableItem', function () {
    return {
      transclude: false,
      replace: true,
      scope: {
      },
      require: '^yamSortableList',
      restrict: 'AE',
      link: function (scope, element, attrs, ctrl) {
        scope.index = parseInt(attrs.index, 10);
        scope.currentIndex = ctrl.$scope.currentIndex;

        element.on('mousedown', function (e) {
          element.on('mousemove', function (e) {
            e.preventDefault();
          });
        });


        element.on('mouseup', function () {
          ctrl.setCurrentElement(undefined);

          element.off('mousemove', function (e) {

          });
        });

        scope.$watch('index', function (index) {
          console.log('changed:', scope);
        });

        console.log('ctrl', ctrl);
      },
      template: '<div class="yam-sortable-item" ng-transclude></div>'
    };

  });
  app.directive('yamSortableList', function ($timeout) {

    var currentElement, currentIndex;
    var initialY;
    var pathMoved = 0;
    var dragfn;

    function startTrackDragging(element, e) {
        e.preventDefault();
        e.stopPropagation();
        var index, item, that = this;

        if (!initialY) {
          initialY = e.pageY;
        }

        pathMoved = e.pageY - initialY;

        this.setPathMoved(pathMoved);
        if (Math.abs(pathMoved) >= this.getCurrentElement()[0].clientHeight) {
          initialY = 0;

          index = this.getCurrentIndex();
          index = Math.min(Math.max(0, pathMoved >= 0 ? index + 1 : index - 1), this.$scope.items.length - 1);
          item = this.$scope.items.splice(this.getCurrentIndex(), 1);

          $timeout(function () {
            that.$scope.items.splice(index, 0, item[0]);
            that.setCurrentIndex(index);
          });
        }
    }

    function bindDrag(element, controller) {
      dragfn = dragfn || angular.bind(controller, startTrackDragging, element);
      element.on('mousemove', dragfn);
    }

    function unbindDrag(element) {
      initialY  = 0;
      pathMoved = 0;
      element.off('mousemove', dragfn || startTrackDragging);
    }

    function DragController($scope, $element) {
      this.$scope = $scope;
      this.$element = $element;

      var that = this;
    }

    DragController.prototype = {

      initDrag: function ($index, $event) {
        this.setCurrentIndex($index);
        this.setCurrentElement(angular.element($event.srcElement));
      },
      setCurrentElement: function (element) {
        currentElement = element;
      },

      setCurrentIndex: function (index) {
        this.$scope.currentIndex = index;
      },

      setPathMoved: function (path) {
        this.$scope.movedPath = path;
      },

      getPathMoved: function () {
        return this.$scope.movedPath;
      },

      getCurrentIndex: function (index) {
        return this.$scope.currentIndex;
      },

      getCurrentElement: function (element) {
        return currentElement;
      },

      onElementDragStart: function () {

      },

      onElementDragStop: function () {

      },
    }

    DragController.$inject = ['$scope', '$element'];

    return {
      transclude: true,
      scope: {
        items: '='
      },
      controller: DragController,
      controllerAs: 'controller',
      restrict: 'AE',
      link: function (scope, element, attrs, controller) {

        scope.currentIndex = 0;
        console.log(scope);
        element.on('mousedown', function (e) {
          e.stopPropagation();
          console.log('dragsrart');
          bindDrag(element, scope.controller);
          scope.$apply();
        });
        element.on('mouseup', function () {
          console.log('dragstop');
          unbindDrag(element);
        });

      },
      template: '<div class="yam-sortable">' +
        '<ul>' +
        '<li ng-repeat="item in items track by $index">' +
          '<yam-sortable-item ng-mousedown="(controller.initDrag($index, $event))" index="{{$index}}">' +
            '<div ng-transclude></div>' +
          '</yam-sortable-item>' +
        '</li>' +
        '</ul>' +
        '</div>'
    };
  });
}(this.yam, this));

