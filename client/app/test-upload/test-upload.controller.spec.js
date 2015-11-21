'use strict';

describe('Controller: TestUploadCtrl', function () {

  // load the controller's module
  beforeEach(module('vadsenceNodeApp'));

  var TestUploadCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TestUploadCtrl = $controller('TestUploadCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
