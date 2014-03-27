(function (exports, angular, undefined) {
  'use strict';


  angular.module('yamApp')

  .service('Modernizr', function () {
    return exports.Modernizr;
  })
  .factory('ScrollProvider', ['Modernizr', function (Modernizr) {
    var IScroll = exports.IScroll,
    defaults = {
      scrollbars: 'custom',
      customStyle: 'ym-scrollbars',
      disableTouch: !Modernizr.touch,
      mouseWheel: !Modernizr.touch,
      eventPassthrough: false,
      preventDefault: false
    };
    return {
      create: function (element, options) {
        var opts = angular.extend({}, defaults, options || {});
        return new IScroll(element.get(0), opts);
      }
    };
  }]);

}(this, this.angular));
