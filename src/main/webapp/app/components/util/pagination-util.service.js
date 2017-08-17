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

(function () {
    'use strict';

    angular
        .module('cafeSiTotApp')
        .factory('PaginationUtil', PaginationUtil);

    function PaginationUtil () {

        var service = {
            parseAscending : parseAscending,
            parsePage : parsePage,
            parsePredicate : parsePredicate
        };

        return service;

        function parseAscending (sort) {
            var sortArray = sort.split(',');
            if (sortArray.length > 1){
                return sort.split(',').slice(-1)[0] === 'asc';
            } else {
                // default to true if no sort defined
                return true;
            }
        }

        // query params are strings, and need to be parsed
        function parsePage (page) {
            return parseInt(page);
        }

        // sort can be in the format `id,asc` or `id`
        function parsePredicate (sort) {
            var sortArray = sort.split(',');
            if (sortArray.length > 1){
                sortArray.pop();
            }
            return sortArray.join(',');
        }
    }
})();
