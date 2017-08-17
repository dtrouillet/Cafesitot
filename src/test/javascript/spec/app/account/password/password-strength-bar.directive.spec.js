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

describe('Directive Tests', function () {
    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    var elm, scope, $httpBackend;

    beforeEach(inject(function($compile, $rootScope, $injector) {
        $httpBackend = $injector.get('$httpBackend');

        var html = '<password-strength-bar password-to-check="password"></password-strength-bar>';
        scope = $rootScope.$new();
        elm = angular.element(html);
        $compile(elm)(scope);
    }));

    describe('Password strength', function () {
        it("Should display the password strength bar", function() {
            expect(elm.find('ul').length).toEqual(1);
            expect(elm.find('li').length).toEqual(5);
        });

        it("Should change the first 2 points of the strength bar", function() {
            scope.$apply(function() {
                scope.password = "morethan5chars"; // that should trigger the 2 first points
            });

            var firstpointStyle = elm.find('ul').children('li')[0].getAttribute('style');
            expect(firstpointStyle).toContain('background-color: rgb(255, 153, 0)');

            var secondpointStyle = elm.find('ul').children('li')[1].getAttribute('style');
            expect(secondpointStyle).toContain('background-color: rgb(255, 153, 0)');

            var thirdpointStyle = elm.find('ul').children('li')[2].getAttribute('style');
            expect(thirdpointStyle).toContain('background-color: rgb(221, 221, 221)');
        });

        it("Should change the first 4 points of the strength bar", function() {
            scope.$apply(function() {
                scope.password = "mo5ch$=!"; // that should trigger the 3 first points
            });

            var firstpointStyle = elm.find('ul').children('li')[0].getAttribute('style');
            dump(firstpointStyle);
            expect(firstpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var secondpointStyle = elm.find('ul').children('li')[1].getAttribute('style');
            expect(secondpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var thirdpointStyle = elm.find('ul').children('li')[2].getAttribute('style');
            expect(thirdpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var fourthpointStyle = elm.find('ul').children('li')[3].getAttribute('style');
            expect(fourthpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var fifthpointStyle = elm.find('ul').children('li')[4].getAttribute('style');
            expect(fifthpointStyle).toContain('background-color: rgb(221, 221, 221)');
        });
    });
});
