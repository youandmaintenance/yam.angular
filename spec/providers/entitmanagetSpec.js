'use strict';

describe('EntityManager', function () {

  var manager;

  beforeEach(function () {
    // Initialize the service provider
    // by injecting it to a fake module's config block
    var fakeModule = angular.module('test.app.manager', function () {});
    fakeModule.config(function (provider) {
      manager = provider;
    });
    // Initialize test.app injector
    module('app.config', 'test.app.manager');

    // Kickstart the injectors previously registered
    // with calls to angular.mock.module
    inject(function () {});
  });

  describe('describe', function () {
    it('Sould do something');
    manager.describe('SomeEntity');
    expect(manager.hasEntity('SomeEntity').toBe(true));
  });
});
