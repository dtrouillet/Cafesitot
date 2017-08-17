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
        .factory('JhiHealthService', JhiHealthService);

    JhiHealthService.$inject = ['$rootScope', '$http'];

    function JhiHealthService ($rootScope, $http) {
        var separator = '.';
        var service = {
            checkHealth: checkHealth,
            transformHealthData: transformHealthData,
            getBaseName: getBaseName,
            getSubSystemName: getSubSystemName
        };

        return service;

        function checkHealth () {
            return $http.get('management/health').then(function (response) {
                return response.data;
            });
        }

        function transformHealthData (data) {
            var response = [];
            flattenHealthData(response, null, data);
            return response;
        }

        function getBaseName (name) {
            if (name) {
                var split = name.split('.');
                return split[0];
            }
        }

        function getSubSystemName (name) {
            if (name) {
                var split = name.split('.');
                split.splice(0, 1);
                var remainder = split.join('.');
                return remainder ? ' - ' + remainder : '';
            }
        }

        /* private methods */
        function flattenHealthData (result, path, data) {
            angular.forEach(data, function (value, key) {
                if (isHealthObject(value)) {
                    if (hasSubSystem(value)) {
                        addHealthObject(result, false, value, getModuleName(path, key));
                        flattenHealthData(result, getModuleName(path, key), value);
                    } else {
                        addHealthObject(result, true, value, getModuleName(path, key));
                    }
                }
            });
            return result;
        }

        function addHealthObject (result, isLeaf, healthObject, name) {

            var healthData = {
                'name': name
            };
            var details = {};
            var hasDetails = false;

            angular.forEach(healthObject, function (value, key) {
                if (key === 'status' || key === 'error') {
                    healthData[key] = value;
                } else {
                    if (!isHealthObject(value)) {
                        details[key] = value;
                        hasDetails = true;
                    }
                }
            });

            // Add the of the details
            if (hasDetails) {
                angular.extend(healthData, { 'details': details});
            }

            // Only add nodes if they provide additional information
            if (isLeaf || hasDetails || healthData.error) {
                result.push(healthData);
            }
            return healthData;
        }

        function getModuleName (path, name) {
            var result;
            if (path && name) {
                result = path + separator + name;
            }  else if (path) {
                result = path;
            } else if (name) {
                result = name;
            } else {
                result = '';
            }
            return result;
        }

        function hasSubSystem (healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value) {
                if (value && value.status) {
                    result = true;
                }
            });
            return result;
        }

        function isHealthObject (healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value, key) {
                if (key === 'status') {
                    result = true;
                }
            });
            return result;
        }

    }
})();
