(function (exports) {
  'use strict';
  /**
   * A Klass Constructor Factory
   * @name seleneClass
   *
   * class.js 1.0.2
   *
   * © 2011 Thomas Appel <http://thomas-appel.com>
   *
   * class.js is dual licensed under the
   * MIT <http://dev.thomas-appel.com/licenses/mit.txt> and
   * GPL <http://dev.thomas-appel.com/licenses/gpl.txt> license.
   *
   */
  var extend,
  // creates an empty object. See [factory.createObject](#section-6)
  objectCreate = (function () {
    if (typeof Object.create === 'undefined') {

      return (function () {
        function Prototype() {}
        return function (obj) {
          Prototype.prototype = obj;
          return new Prototype();
        };
      } ());
    } else {
      return Object.create;
    }
  }()),

  Factory;

  function mixin(strg, obj) {
    var i = 0, l, method,
    newObj = {};
    strg = strg.split(' ');
    l = strg.length;

    for (; i < l; i++) {
      method = strg[i];
      if (_hasProp.call(obj, method)) {
        newObj[method] = obj[method];
      }
    }
    return newObj;
  }

  function Mixin() {
    var methods = splice.call(arguments, 0, 1), mixins = splice.call(arguments, 0);
    mixins = mixins.join(',');
    return mixin(mixins, this.prototype);
  }

  // ### The Klass Constructor
  // - namespace: jQuery
  // - name factory
  //
  Factory = (function () {
    var O = Object.prototype,
    _hasProp = O.hasOwnProperty;

    function parentConstruct(Parent) {
      return function () {
        Parent.apply(this, arguments);
      };
    }


    // - prameters:
    //      - parent: the parent Constructor which should be extended. Note,
    //      that it has to be a constructor function build with jquery.factory
    //      - constructor: (type: Function) the actual constructor function. Put your
    //      initializing code here
    //      - methods: (type: Object or String) an Object which becomes the constructor prototype
    //      - obj: (type: Object) Additional, for creating Mixins. The Object you want to lend methods and
    //      properties form. Note: if you set the 'obj' param, pass param 'methods' as string representing the method/property names of the 'obj' object separated by a single space
    //

    return function (parent, constructor, methods, beforeParent) {
      var prototype,
      __super__;

      if (!_.isFunction(constructor)) {
        beforeParent = methods;
        methods = constructor;
        constructor = parent || function () {};
      };

      prototype = objectCreate(parent && parent.prototype || O);

      //methods = (typeof parent === 'function' && typeof constructor === 'object') ? constructor : methods;
      //constructor = typeof constructor === 'object' ? function () {} : constructor;

      _.extend(prototype, methods);

      prototype.constructor = constructor;
      __super__ = parent ? parent.prototype.constructor : prototype.constructor;
      prototype.parentConstruct = parentConstruct(__super__);
      prototype.__super__ = __super__;

      constructor = prototype.constructor;
      constructor.prototype = prototype;
      constructor.extend = extend;
      constructor.mixin = Mixin;

      return constructor;
    };
  }());

  extend = function (constructor, prototype, beforeParent) {

    if (!_.isFunction(constructor)) {
      beforeParent = prototype;
      prototype = constructor;
      constructor = this;
    }

    prototype = !_.isObject(prototype) ? constructor.prototype : prototype;
    beforeParent = typeof beforeParent === 'boolean' ? beforeParent : false;

    return Factory(this.prototype.constructor || null, constructor, prototype, mixin, beforeParent);
  };

  Factory.create = objectCreate;
  exports.Klass =  {
    factory: Factory,
    extend:  extend,
    object:  objectCreate,
    mixin: Mixin
  };
}(this));
