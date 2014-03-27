/* global Klass */
/* global _ */

(function (undefined) {

  'use strict';

  var ENM_PREFIX = 'enm_';
  var registry = {};
  var methodTypes = {
    ALL   : ['get', 'post', 'put', 'delete'],
    GET   : 'get',
    POST  : 'post',
    PUT   : 'put',
    DELETE: 'delete'
  };

  /**
   * @name objectGet
   * @private
   * @param  {String}  ns:     configuration object;
   * @param  {mixed}   value:  configuration object;
   * @param  {Object}  object: configuration object;
   * @return {mixed}
   */
  function objectGet(ns, object) {
    var key, keys, len, pointer,
    a, alen;

    if (!angular.isString(ns)) {
      return object;
    }

    keys = ns.split('.');
    len = keys.length;
    pointer = object;

    while (len > 0 && object !== null) {
      key = keys.shift();

      if (!pointer[key]) {
        return;
      }

      if (_.isArray(pointer[key]) && len > 1) {
        var i = 0;
        a = [];
        ns = keys.join('.');
        alen = pointer[keys].length;
        for (; i < alen; i++) {
          a.push(objectGet(ns, pointer[keys][i]));
        }
        pointer = a;
        break;
      }

      pointer = pointer[key] || null;
      len--;
    }
    return pointer;
  }

  /**
   * @name objectSet
   * @private
   * @param  {String}  ns:     configuration object;
   * @param  {mixed}   value:  configuration object;
   * @param  {Object}  object: configuration object;
   * @return void
   */
  function objectSet(ns, value, object, distributeValue) {

    if (!object) {
      return;
    }

    var pointer,
    keys = ns.split('.'),
    key,
    alen,
    len = keys.length;
    pointer = pointer || object;

    while (len > 0) {
      key = keys.shift();
      pointer[key] = (len === 1) ? value : (pointer[key] || {});

      if (_.isArray(pointer[key])) {
        var i = 0, distribute = distributeValue && _.isArray(value);
        ns = keys.join('.');
        alen = pointer[key].length;

        for (; i < alen; i++) {
          objectSet(ns, distribute ? value[i] : value, pointer[keys][i]);
        }
        break;
      }

      pointer = pointer[key];
      len--;
    }
  }

  /**
   * @Klass UnregisteredEntityException
   */
  var UnregisteredEntityException = Klass.factory(Error, function EntityUnregisteredException () {
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
   * @Klass EntityKeys
   */
  var EntityKeys = Klass.factory(function EntityKeys(manager) {
    this.manager = manager;
    registry[this.manager.uuid] = {
      aliases: {}
    };
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
   * @Klass PropertyMapper
   */
  var PropertyMapper = Klass.factory(
    null,
    function PropertyMapper() {
      this.map = {};
      //this.entity = angular.extend({}, data);
    }, {

      /**
       * @member PropertyMapper.describe
       *
       * @param  {string}  target
       * @param  {string}  source
       */
      describe: function (target, source) {
        var that = this;
        if (angular.isObject(source)) {
          return this.describe(target, function(object, clone) {
            angular.forEach(source, function (sval, skey) {
              objectSet(skey, objectGet(sval, clone), object);
            });
            return object;
          });
        }

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

      apply: function (data) {
        var clone = angular.copy(data);

        angular.forEach(this.map, function (fn, key) {

          var kval = objectGet(key, clone);

          if (angular.isArray(kval)) {
            angular.forEach(kval, function (kdata) {
              applyMapping(kdata, angular.copy(kdata), key, fn);
            });
          } else {
            applyMapping(data, clone, key, fn);
          }
        });

        angular.extend(data, clone);
        return data;
      }
    }
  );

  function applyMapping(data, clone, key, fn) {
    //objectSet('$originalAttributes.' + key, objectGet(key, data), data);
    objectSet(key, fn(data, clone, key), clone);
  }

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

  function configure(manager, $resource, $config) {
    // do something;
    registry[manager.uuid].$resource = $resource;
    manager.config = angular.extend({}, {url: $config.url, api: $config.api});
  }

  function createMapper(registry, mapperKey, mapper, entity, properties, rw) {

    if (!registry[entity]) {
      return unregisteredEntityException();
    }

    objectSet(mapperKey, mapper, registry[entity]);
    registry[entity][rw].properties = properties;

    angular.forEach(properties || {}, function (source, target) {
      registry[entity][rw].mapper.describe(target, source);
    });
  }

  function applyTransform(manager, entity, data, method) {
    var object = angular.fromJson(data);

    if (_.isArray(object)) {
      _.each(object, function (obj) {
        manager[method](entity, obj);
      });
    } else {
      manager[method](entity, object);
    }

    return object;//angular.toJson(object);
  }

  function isScalar(value) {
    return !angular.isArray(value) || !angular.isObject(value);
  }

  function flipKeys(object) {
    var o = {};
    angular.forEach(object, function (value, key) {
      if (angular.isObject(value)) {
        o[key] = flipKeys(value);
      } else if (angular.isString(value)) {
        o[value] = key;
      } else {
        o[key] = value;
      }
    });
    return o;
  }

  function createResourceConstructor(manager, options, entity) {
    var id,
    methods = {},

    transformResponse = function (data) {
      if (!data) {
        return data;
      }

      if (!manager.hasReader(entity)) {
        return data;
      }
      return applyTransform(manager, entity, data, 'readProperties');
    },

    transformRequest = function (data) {
      console.log('transform', data);
      if (!data) {
        return data;
      }

      if (!manager.hasWriter(entity)) {
        if (manager.hasReader(entity)) {
          // invert key/values if a read mapping exists

          console.log(registry[manager.uuid][entity].read.properties);
          manager.write(entity, flipKeys(registry[manager.uuid][entity].read.properties));
          console.log(registry[manager.uuid][entity].write.properties);
        } else {
          return data;
        }
      }
      var obj = applyTransform(manager, entity, data, 'writeProperties');
      console.log('write Applied', angular.copy(obj));
      return angular.toJson(obj);
    };

    angular.forEach((_.isArray(options.methods) ? options.methods : [options.methods]) || methodTypes.ALL, function (method) {
      methods[method] = {
        method: method.toUpperCase(),
        transformResponse: transformResponse,
        transformRequest: transformRequest,
      };
    });

    methods['save'] = {
      action: 'save',
      method: 'POST',
      transformResponse: transformResponse,
      transformRequest: transformRequest,
    };

    return function (manager, entity) {
      var idParam = {}, Constructor,
      url = [manager.config.url, manager.config.api, options.urlOverride || entity.toLowerCase()].join('/');
      id  = options.id || 'id';
      idParam[id] = '@' + id;

      Constructor = manager.getResource()(url + '/:' + id, idParam, methods);

      return Constructor;
    };
  }

  /**
   * @Klass EntityManager
   * @param {object} config: configuration object;
   */
  var EntityManager = Klass.factory(
    function EntityManager() {
    this.uuid = _.uniqueId(ENM_PREFIX);
    registry[this.uuid] = {};
    this.keys = new EntityKeys(this);
    registry[this.uuid].config = {};
  }, {

    /**
     * @member EntityManager.$get
     *
     * @param  {String}  entity
     * @param  {String}  read
     * @param  {Object}  write
     * @throws {Object}  UnregisteredEntityException
     */
    $get: ['$resource', 'yamAppConfig', function ($resource, yamAppConfig) {
      configure(this, $resource, yamAppConfig);
      var that = this;

      this.getResource = function () {
        return $resource;
      };

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
    describe: function (entity, config) {
      config = config || {
        synthetic: true
      };

      registry[this.uuid][entity] = registry[this.uuid][entity] || {};

      if (!config.sythetic) {
        registry[this.uuid][entity].resource = {
          constructor: createResourceConstructor(this, config, entity)
        };
      }
      return this;
    },
    /**
     * @member EntityManager.read
     *
     * @param  {string}  entity
     * @param  {string}  key
     * @param  {string}  value
     * @throws {Error}   UnregisteredEntityException
     */
    read: function (entity, properties) {
      createMapper(registry[this.uuid], 'read.mapper', new PropertyMapper(this), entity, properties, 'read');
    },

    /**
     * @member EntityManager.hasReader
     *
     * @param   {string}  entity
     * @return  {Boolean} value
     */
    hasReader: function (entity) {
      return !!registry[this.uuid][entity].read;
    },

    /**
     * @member EntityManager.hasWriter
     *
     * @param   {string}  entity
     * @return  {Boolean} value
     */
    hasWriter: function (entity) {
      return !!registry[this.uuid][entity].write;
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

    write: function (entity, properties) {
      createMapper(registry[this.uuid], 'write.mapper', new PropertyMapper(this), entity, properties, 'write');
    },

    /**
     * @member EntityManager.getEntity
     *
     * @param  {String} entity
     * @return {Object} value
     * @throws {Error}  UnregisteredEntityException
     */
    getEntity: function (entity) {
      var instance = new (this.getEntityConstructor(entity));
      console.log(instance);
      return instance;
    },

    /**
     * @member EntityManager.getEntity
     *
     * @param  {String} entity
     * @return {Object} value
     * @throws {Error}  UnregisteredEntityException
     */
    hasEntity: function (entity) {
      return !!registry[this.uuid][entity];
    },

    /**
     * @member EntityManager.getEntityConstructor
     *
     * @param  {String}   entity
     * @return {Function} value
     * @throws {Error}    UnregisteredEntityException
     */
    getEntityConstructor: function(entity) {
      var Res;

      if (!registry[this.uuid][entity]) {
        return unregisteredEntityException(entity);
      }

      if (!registry[this.uuid][entity].Constructor) {
        Res = registry[this.uuid][entity].resource.constructor(this, entity);
        registry[this.uuid][entity].Constructor = Res;
      }
      return registry[this.uuid][entity].Constructor;
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

    readProperties: function (entity, data) {
      registry[this.uuid][entity].read.mapper.apply(data);
    },

    writeProperties: function (entity, data) {
      registry[this.uuid][entity].write.mapper.apply(data);
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
    },

    methodTypes: methodTypes,

  });

  angular.module('yamEntities', ['ngResource'])

  .value('yamEntityManagerConfig', {
    url: undefined,
    api: undefined
  })

  .provider('yamEntityManager', [function (config) {
    return new EntityManager();
  }]);
}());
