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

describe('Controller Tests', function () {

    describe('JhiHealthCheckController', function () {
        var $scope, jhiHealthService; // actual implementations
        var createController; // local utility functions

        beforeEach(inject(function ($injector, JhiHealthService) {
            $scope = $injector.get('$rootScope').$new();
            jhiHealthService = JhiHealthService;
            var locals = {
                '$scope': $scope
            };
            createController = function() {
                $injector.get('$controller')('JhiHealthCheckController as vm', locals);
            };
            createController();
        }));

        describe('baseName and subSystemName', function () {
            it('should return the basename when it has no sub system', function () {
                expect($scope.vm.baseName('base')).toBe('base');
            });

            it('should return the basename when it has sub systems', function () {
                expect($scope.vm.baseName('base.subsystem.system')).toBe('base');
            });

            it('should return the sub system name', function () {
                expect($scope.vm.subSystemName('subsystem')).toBe('');
            });

            it('should return the subsystem when it has multiple keys', function () {
                expect($scope.vm.subSystemName('subsystem.subsystem.system')).toBe(' - subsystem.system');
            });


        });

        describe('transformHealthData', function () {
            it('should flatten empty health data', function () {
                var data = {};
                var expected = [];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with no subsystems', function () {
                var data = {
                    'status': 'UP',
                    'db': {
                        'status': 'UP',
                        'database': 'H2',
                        'hello': '1'
                    },
                    'mail': {
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    }
                };
                var expected = [
                    {
                        'name': 'db',
                        'status': 'UP',
                        'details': {
                            'database': 'H2',
                            'hello': '1'
                        }
                    },
                    {
                        'name': 'mail',
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with subsystems at level 1, main system has no additional information', function () {
                var data = {
                    'status': 'UP',
                    'db': {
                        'status': 'UP',
                        'database': 'H2',
                        'hello': '1'
                    },
                    'mail': {
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    'system': {
                        'status': 'DOWN',
                        'subsystem1': {
                            'status': 'UP',
                            'property1': 'system.subsystem1.property1'
                        },
                        'subsystem2': {
                            'status': 'DOWN',
                            'error': 'system.subsystem1.error',
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                };
                var expected = [
                    {
                        'name': 'db',
                        'status': 'UP',
                        'details': {
                            'database': 'H2',
                            'hello': '1'
                        }
                    },
                    {
                        'name': 'mail',
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    {
                        'name': 'system.subsystem1',
                        'status': 'UP',
                        'details': {
                            'property1': 'system.subsystem1.property1'
                        }
                    },
                    {
                        'name': 'system.subsystem2',
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'details': {
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with subsystems at level 1, main system has additional information', function () {
                var data = {
                    'status': 'UP',
                    'db': {
                        'status': 'UP',
                        'database': 'H2',
                        'hello': '1'
                    },
                    'mail': {
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    'system': {
                        'status': 'DOWN',
                        'property1': 'system.property1',
                        'subsystem1': {
                            'status': 'UP',
                            'property1': 'system.subsystem1.property1'
                        },
                        'subsystem2': {
                            'status': 'DOWN',
                            'error': 'system.subsystem1.error',
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                };
                var expected = [
                    {
                        'name': 'db',
                        'status': 'UP',
                        'details': {
                            'database': 'H2',
                            'hello': '1'
                        }
                    },
                    {
                        'name': 'mail',
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    {
                        'name': 'system',
                        'status': 'DOWN',
                        'details': {
                            'property1': 'system.property1'
                        }
                    },
                    {
                        'name': 'system.subsystem1',
                        'status': 'UP',
                        'details': {
                            'property1': 'system.subsystem1.property1'
                        }
                    },
                    {
                        'name': 'system.subsystem2',
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'details': {
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });

            it('should flatten health data with subsystems at level 1, main system has additional error', function () {
                var data = {
                    'status': 'UP',
                    'db': {
                        'status': 'UP',
                        'database': 'H2',
                        'hello': '1'
                    },
                    'mail': {
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    'system': {
                        'status': 'DOWN',
                        'error': 'show me',
                        'subsystem1': {
                            'status': 'UP',
                            'property1': 'system.subsystem1.property1'
                        },
                        'subsystem2': {
                            'status': 'DOWN',
                            'error': 'system.subsystem1.error',
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                };
                var expected = [
                    {
                        'name': 'db',
                        'status': 'UP',
                        'details': {
                            'database': 'H2',
                            'hello': '1'
                        }
                    },
                    {
                        'name': 'mail',
                        'status': 'UP',
                        'error': 'mail.a.b.c'
                    },
                    {
                        'name': 'system',
                        'status': 'DOWN',
                        'error': 'show me'
                    },
                    {
                        'name': 'system.subsystem1',
                        'status': 'UP',
                        'details': {
                            'property1': 'system.subsystem1.property1'
                        }
                    },
                    {
                        'name': 'system.subsystem2',
                        'status': 'DOWN',
                        'error': 'system.subsystem1.error',
                        'details': {
                            'property2': 'system.subsystem2.property2'
                        }
                    }
                ];
                expect(jhiHealthService.transformHealthData(data)).toEqual(expected);
            });
        });

    });
});
