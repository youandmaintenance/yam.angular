(function (angular, Showdown, undefined) {
  'use strict';

  function mapValue(map, object) {
    var key, len, _o;

    if (angular.isString(key)) {
      return object;
    }

    len = map.length;

    while (len > 0 && object !== null) {
      key = map.shift();
      _o = _o || object;
      _o = _o[key] || null;
      len--;
    }
    return _o;
  }

  function EntityMapper(data) {
    this.map = {};
    this.data = data;
    this.entity = angular.extend({}, data);
  }

  EntityMapper.prototype = {
    describe: function (target, source) {
      var _source = source.split('.');
      this.map[target] = _source.length === 1 ? function (object) {
        return object[source];
      } : function (object) {
        return mapValue(_source, object);
      };
    },

    getEntity: function () {
      var that = this;
      angular.forEach(this.map, function (fn, key) {
        that.entity[key] = fn(that.data);
      });
      return this.entity;
    }
  };

  angular.module('yamApp')

  .factory('Showdown', function () {
    var instance;

    function getInstance() {
      if (!instance) {
        instance = new Showdown.converter();
      }
      return instance;
    }

    return {
      makeHtml: function (string) {
        return getInstance().makeHtml(string);
      }
    };

  })

  .factory('ConsoleManager', ['$timeout', '$q', function ($timeout, $q) {

    var defer = $q.defer();

    function ConsoleManager() {

    }

    ConsoleManager.prototype = {
      push: function (label, model) {
        var that = this;
        defer.promise.then(function (manager) {
          manager.console.add({label: label, model: model});
        });
      },

      registerConsole: function (controller) {
        this.console = this.console || controller;
        defer.resolve(this);
      }

    };
    return new ConsoleManager();
  }])

  .factory('FieldAdaptor', function ($http, $timeout) {
    function FieldAdaptor(field) {
      this.field = field;
      this.clone = angular.copy(field);
      this.convert();
      return this.clone;
    }

    FieldAdaptor.prototype = {
      convert: function () {
        this.clone.name = this.field.type.name;
        this.clone.type = this.field.type.type.field_type;
      }
    };

    return {
      create: function (field) {
        return new FieldAdaptor(field);
      }
    };
  })
  .factory('FieldPrototype', ['$http', '$timeout', 'FieldAdaptor', function ($http, $timeout, FieldAdaptor) {

    function setListener(field, scope) {
      var promise;
      scope.field = field;

      var fn = _.debounce(function (label) {
          if (label) {
            promise = $http.get('/myyam/api/v1/slug/'+ field.label).success(function (data) {
              field.handle = data.slug && data.slug.value;
            });
          }
      }, 2000);


      field.$unwatch = scope.$watch('field.label', fn);

      var unwatch = scope.$watch('field.handle', function (handle) {
        if (handle) {
         field.$unwatch();
         unwatch();
        }
      });
    }

    var defaultFields = ['label', 'handle', 'type_id', 'section_uuid', 'required', 'validate'];

    function FieldPrototype(field, $scope) {
      var that = this;
      var promise = this;

      //this.label   = field.label;
      //this.handle  = field.handle;
      //this.type_id = field.type_id;


      angular.forEach(defaultFields, function (key) {
        that[key] = field[key] || null;
      });

      this.handle = 'new_field';

      this.info = {
        name: field.name
      };

      console.log('PROTOOOO', this, field);

      //angular.extend(this, field);
      this.settings = angular.extend({}, this.defaults || {});
      setListener(this, $scope);
    }

    FieldPrototype.prototype = {
      onLabelChange: function (label) {
      }
    };

    return {

      createNew: function (field, scope) {
        var f = new FieldPrototype(field, scope);
        f.type_id = f.type_id || field.id;
        return f;
      },

      createExisting: function (field, scope) {
        var proto = this.createNew(field, scope);

        console.log('Field', field);
        angular.extend(proto, {id:field.id, fieldtype: field.fieldtype});
        return proto;
      },

      createFromExisting: function (field, scope) {
        var e = new EntityMapper(field);
        e.describe('name', 'type.name');
        e.describe('type', 'type.type.field_type');

        field = e.getEntity();
        return new FieldPrototype(field, scope);
      },

    };

  }]);
}(this.angular, this.Showdown));
