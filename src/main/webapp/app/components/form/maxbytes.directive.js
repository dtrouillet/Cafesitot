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

(function() {
    'use strict';

    angular
        .module('cafeSiTotApp')
        .directive('maxbytes', maxbytes);

    function maxbytes () {
        var directive = {
            restrict: 'A',
            require: '?ngModel',
            link: linkFunc
        };

        return directive;

        function linkFunc (scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            ngModel.$validators.maxbytes = function (modelValue) {
                return ngModel.$isEmpty(modelValue) || numberOfBytes(modelValue) <= attrs.maxbytes;
            };
        }

        function endsWith(suffix, str) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        function paddingSize(base64String) {
            if (endsWith('==', base64String)) {
                return 2;
            }
            if (endsWith('=', base64String)) {
                return 1;
            }
            return 0;
        }

        function numberOfBytes(base64String) {
            return base64String.length / 4 * 3 - paddingSize(base64String);
        }
    }

})();
