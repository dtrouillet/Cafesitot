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

    describe('ActivationController', function() {

        var $scope, $httpBackend, $q; // actual implementations
        var MockAuth, MockStateParams; // mocks
        var createController; // local utility function

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $scope = $injector.get('$rootScope').$new();
            $httpBackend = $injector.get('$httpBackend');
            MockAuth = jasmine.createSpyObj('MockAuth', ['activateAccount']);
            MockStateParams = jasmine.createSpy('MockStateParams');
            MockStateParams.key = 'ABC123';

            var locals = {
                '$scope': $scope,
                '$stateParams': MockStateParams,
                'Auth': MockAuth
            };
            createController = function() {
                $injector.get('$controller')('ActivationController as vm', locals);
            };
        }));

        it('calls Auth.activateAccount with the key from stateParams', function() {
            // given
            MockAuth.activateAccount.and.returnValue($q.resolve());
            // when
            $scope.$apply(createController);
            // then
            expect(MockAuth.activateAccount).toHaveBeenCalledWith({
                key: 'ABC123'
            });
        });

        it('should set set success to OK upon successful activation', function() {
            // given
            MockAuth.activateAccount.and.returnValue($q.resolve());
            // when
            $scope.$apply(createController);
            // then
            expect($scope.vm.error).toBe(null);
            expect($scope.vm.success).toEqual('OK');
        });

        it('should set set error to ERROR upon activation failure', function() {
            // given
            MockAuth.activateAccount.and.returnValue($q.reject());
            // when
            $scope.$apply(createController);
            // then
            expect($scope.vm.error).toBe('ERROR');
            expect($scope.vm.success).toEqual(null);
        });
    });
});
