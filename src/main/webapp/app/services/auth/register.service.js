(function () {
    'use strict';

    angular
        .module('cafeSiTotApp')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register ($resource) {
        return $resource('api/register', {}, {});
    }
})();
