/* global Class */
/* global _ */

(function (undefined) {

  'use strict';

  var ENM_PREFIX = 'enm_';
  var registry = {};

  /**
   * @name objectGet
   * @private
   * @param  {String}  ns:     configuration object;
   * @param  {mixed}   value:  configuration object;
   * @param  {Object}  object: configuration object;
   * @return {mixed}
   */
  function objectGet(ns, object) {
    var key, keys, len, _o;

    if (!angular.isString(ns)) {
      return object;
    }

    keys = ns.split('.');
    len = keys.length;
    _o = object;

    while (len > 0 && object !== null) {
      key = keys.shift();
      _o = _o[key] || null;
      len--;
    }
    return _o;
  }

  /**
   * @name objectSet
   * @private
   * @param  {String}  ns:     configuration object;
   * @param  {mixed}   value:  configuration object;
   * @param  {Object}  object: configuration object;
   * @return void
   */
  function objectSet(ns, value, object) {
    var _o,
    keys = ns.split('.'),
    key,
    len = keys.length;
    _o = _o || object;

    while (len > 0) {
      key = keys.shift();
      _o[key] = (len === 1) ? value : (_o[key] || {});
      _o = _o[key];
      len--;
    }
  }

  /**
   * @class UnregisteredEntityException
   */
  var UnregisteredEntityException = Class.factory(Error, function EntityUnregisteredException () {
    this.parentConstruct();
  });

  /**
   * @function unregisteredEntityException
   * @param {string} entity: configuration object;
   * @return Error
   */
  function unregisteredEntityException(entity) {
    return new UnregisteredEntityException('entity ' + entity + ' is not defined');
  }

  /**
   * @class EntityKeys
   */
  var EntityKeys = Class.factory(function EntityKeys(manager) {
    this.manager = manager;
    registry[this.manager.uuid] = {};
  }, {
    alias: function (key) {
      return registry[this.manager.uuid].aliases[key] || key;
    },

    setAlias: function (alias, key) {
      registry[this.manager.uuid].aliases[alias] = key;
    },

    setAliases: function (aliases) {
      var that = this;
      _.each(aliases, function (key, alias) {
        that.setAlias(alias, key);
      });
    },

    getDefault: function (object, key, defaultValue) {
      return object[key] || defaultValue;
    }
  });

  /**
   * @class EntityMapper
   */
  var EntityMapper = Class.factory(
    null,
    function EntityMapper() {
      this.map = {};
      //this.entity = angular.extend({}, data);
    }, {

      /**
       * @member EntityMapper.describe
       *
       * @param  {string}  target
       * @param  {string}  source
       */
      describe: function (target, source) {
        console.log(target);
        this.map[target] = _.isFunction(source) ?
          function () {
          return source.apply(null, arguments);
        } :
          source.indexOf('.') === -1 ? function (object) {
          return object[source];
        } : function (object) {
          return objectGet(source, object);
        };
      },

      /**
       * @member EntityMapper.getEntity
       *
       * @param  {string}  target
       * @param  {string}  source
       */
      getEntity: function () {
        var that = this;
        angular.forEach(this.map, function (fn, key) {
          objectSet(key, that.entity , fn(that.data));
        });
        return this.entity;
      },
      get: function (data) {
        var clone = angular.copy(data);
        angular.forEach(this.map, function (fn, key) {
          objectSet('$originalAttributes.' + key, objectGet(key, data), data);
          objectSet(key, fn(data, key), clone);
        });
        angular.extend(data, clone);
        return data;
      }
    }
  );

  function mapUsing(withMapper, mapper, mapKey) {
    withMapper.describe(mapKey, function (val, key) {
      var value;
      if (val[key]) {
        if (_.isArray(val[key])) {
          value = [];
          _.each(val[key], function (v) {
            value.push(mapper.get(v));
          });
        } else {
          value = mapper.get(val);
        }
      }
      return value;
    });
  }

  function configure(mamager) {
    // do something;
  }

  /**
   * @class EntityManager
   * @param {object} config: configuration object;
   */
  var EntityManager = Class.factory(
    function EntityManager() {
    this.config = {};
    this.uuid = _.uniqueId(ENM_PREFIX);
    registry[this.uuid] = {};
    this.keys = new EntityKeys(this);
  }, {

    /**
     * @member EntityManager.$get
     *
     * @param  {String}  entity
     * @param  {String}  read
     * @param  {Object}  write
     * @throws {Object}  UnregisteredEntityException
     */
    $get: [function () {
      configure(this);
      return this;
    }],

    /**
     * @member EntityManager.defineRead
     *
     * @param  {String}  entity
     * @param  {String}  read
     * @param  {Object}  write
     * @throws {Object}  UnregisteredEntityException
     */
    describe: function (entity, read, write) {
      var that = this;
      registry[this.uuid][entity] = registry[this.uuid][entity] || {};
      objectSet('read.mapper',  new EntityMapper(this), registry[this.uuid][entity]);
      objectSet('write.mapper', new EntityMapper(this), registry[this.uuid][entity]);

      angular.forEach(read || {}, function (source, target) {
        registry[that.uuid][entity].read.mapper.describe(target, source);
      });

      angular.forEach(write || {}, function (source, target) {
        registry[that.uuid][entity].write.mapper.describe(target, source);
      });

      return this;
    },

    /**
     * @member EntityManager.readUsing
     *
     * @param  {String}  entity
     * @param  {Object}  definition
     * @throws {Error}   UnregisteredEntityException
     */
    readUsing: function (entity, definition) {
      var that;

      if (!registry[this.uuid][entity]) {
        return unregisteredEntityException(entity);
      }

      that = this;

      angular.forEach(definition, function (key, value) {
        mapUsing(registry[that.uuid][entity].read.mapper, registry[that.uuid][key].read.mapper, value);
      });

      return registry[this.uuid][entity].read.mapper.map;
    },

    /**
     * @member EntityManager.defineRead
     *
     * @param  {string}  entity
     * @param  {string}  key
     * @param  {string}  value
     * @throws {Error}   UnregisteredEntityException
     */
    defineRead: function (entity, key, value) {
      if (!registry[this.uuid][entity]) {
        return unregisteredEntityException(entity);
      }

      registry[this.uuid][entity].read.mapper.describe(key, value);
    },

    /**
     * @member EntityManager.defineRead
     *
     * @param  {string}  entity
     * @param  {string}  key
     * @param  {string}  value
     * @throws {Error}   UnregisteredEntityException
     */
    read: function (entity, data) {
      return registry[this.uuid][entity].read.mapper.get(data);
    },

    /**
     * @member EntityManager.defineRead
     *
     * @param  {string}  entity
     * @param  {string}  key
     * @param  {string}  value
     * @throws {Error}   UnregisteredEntityException
     */
    writeUsing: function (entity, data) {
      return registry[this.uuid][entity].read.mapper.get(data);
    },

    /**
     * @member EntityManager.defineWrite
     *
     * @param  {string}  entity
     * @param  {string}  key
     * @param  {string}  value
     * @throws {Error}   UnregisteredEntityException
     */
    defineWrite: function (entity, key, value) {

      if (!registry[this.uuid][entity]) {
        return unregisteredEntityException(entity);
      }

      registry[this.uuid][entity].write.mapper.describe(key, value);
    }
  });

  EntityManager.prototype.$get = [function () {
    return this;
  }];

  angular.module('yamEntities', ['ngResource'])

  .value('yamEntityManagerConfig', {
    url: undefined,
    api: undefined
  })

  .provider('yamEntityManager', EntityManager);
}());
