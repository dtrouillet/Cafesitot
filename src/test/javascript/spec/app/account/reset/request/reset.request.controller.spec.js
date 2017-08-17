/*
 *
 *  * Copyright (c) 2017 dtrouillet
 *  * All rights reserved.
 *  *
 *  * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *  *
 *  *  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *  *  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *  *  Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *  *
 *  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *  
 */

'use strict';

describe('Controller Tests', function() {

    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    describe('RequestResetController', function() {

        var $rootScope, $scope, $q; // actual implementations
        var MockState, MockTimeout, MockAuth; // mocks
        var createController; // local utility function

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockState = jasmine.createSpy('MockState');
            MockTimeout = jasmine.createSpy('MockTimeout');
            MockAuth = jasmine.createSpyObj('MockAuth', ['resetPasswordInit']);

            var locals = {
                '$rootScope': $rootScope,
                '$scope': $scope,
                '$state': MockState,
                '$timeout': MockTimeout,
                'Auth': MockAuth
            };
            createController = function() {
                return $injector.get('$controller')('RequestResetController as vm', locals);
            };
        }));

        it('should define its initial state', function() {
            // given
            createController();

            // then
            expect($scope.vm.success).toBeNull();
            expect($scope.vm.error).toBeNull();
            expect($scope.vm.errorEmailNotExists).toBeNull();
            expect($scope.vm.resetAccount).toEqual({});
        });

        it('registers a timeout handler set set focus', function() {
            // given
            var MockAngular = jasmine.createSpyObj('MockAngular', ['element']);
            var MockElement = jasmine.createSpyObj('MockElement', ['focus']);
            MockAngular.element.and.returnValue(MockElement);
            MockTimeout.and.callFake(function(callback) {
                withMockedAngular(MockAngular, callback)();
            });
            createController();

            // then
            expect(MockTimeout).toHaveBeenCalledWith(jasmine.any(Function));
            expect(MockAngular.element).toHaveBeenCalledWith('#email');
            expect(MockElement.focus).toHaveBeenCalled();
        });

        it('notifies of success upon successful requestReset', function() {
            // given
            MockAuth.resetPasswordInit.and.returnValue($q.resolve());
            createController();
            $scope.vm.resetAccount.email = 'user@domain.com';
            // when
            $scope.$apply($scope.vm.requestReset);
            // then
            expect(MockAuth.resetPasswordInit).toHaveBeenCalledWith('user@domain.com');
            expect($scope.vm.success).toEqual('OK');
            expect($scope.vm.error).toBeNull();
            expect($scope.vm.errorEmailNotExists).toBeNull();
        });
        it('notifies of unknown email upon email address not registered/400', function() {
            // given
            MockAuth.resetPasswordInit.and.returnValue($q.reject({
                status: 400,
                data: 'email address not registered'
            }));
            createController();
            $scope.vm.resetAccount.email = 'user@domain.com';
            // when
            $scope.$apply($scope.vm.requestReset);
            // then
            expect(MockAuth.resetPasswordInit).toHaveBeenCalledWith('user@domain.com');
            expect($scope.vm.success).toBeNull();
            expect($scope.vm.error).toBeNull();
            expect($scope.vm.errorEmailNotExists).toEqual('ERROR');
        });

        it('notifies of error upon error response', function() {
            // given
            MockAuth.resetPasswordInit.and.returnValue($q.reject({
                status: 503,
                data: 'something else'
            }));
            createController();
            $scope.vm.resetAccount.email = 'user@domain.com';
            // when
            $scope.$apply($scope.vm.requestReset);
            // then
            expect(MockAuth.resetPasswordInit).toHaveBeenCalledWith('user@domain.com');
            expect($scope.vm.success).toBeNull();
            expect($scope.vm.errorEmailNotExists).toBeNull();
            expect($scope.vm.error).toEqual('ERROR');
        });

    });
});
