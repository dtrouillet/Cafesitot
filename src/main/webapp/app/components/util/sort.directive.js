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
        .directive('jhSort', jhSort);

    function jhSort () {
        var directive = {
            restrict: 'A',
            scope: {
                predicate: '=jhSort',
                ascending: '=',
                callback: '&'
            },
            controller: SortController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }

    SortController.$inject = ['$scope', '$element'];

    function SortController ($scope, $element) {
        var vm = this;

        vm.applyClass = applyClass;
        vm.resetClasses = resetClasses;
        vm.sort = sort;
        vm.triggerApply = triggerApply;

        $scope.$watchGroup(['vm.predicate', 'vm.ascending'], vm.triggerApply);
        vm.triggerApply();

        function applyClass (element) {
            var thisIcon = element.find('span.glyphicon'),
                sortIcon = 'glyphicon-sort',
                sortAsc = 'glyphicon-sort-by-attributes',
                sortDesc = 'glyphicon-sort-by-attributes-alt',
                remove = sortIcon + ' ' + sortDesc,
                add = sortAsc;
            if (!vm.ascending) {
                remove = sortIcon + ' ' + sortAsc;
                add = sortDesc;
            }
            vm.resetClasses();
            thisIcon.removeClass(remove);
            thisIcon.addClass(add);
        }

        function resetClasses () {
            var allThIcons = $element.find('span.glyphicon'),
                sortIcon = 'glyphicon-sort',
                sortAsc = 'glyphicon-sort-by-attributes',
                sortDesc = 'glyphicon-sort-by-attributes-alt';
            allThIcons.removeClass(sortAsc + ' ' + sortDesc);
            allThIcons.addClass(sortIcon);
        }

        function sort (field) {
            if (field !== vm.predicate) {
                vm.ascending = true;
            } else {
                vm.ascending = !vm.ascending;
            }
            vm.predicate = field;
            $scope.$apply();
            vm.callback();
        }

        function triggerApply (values)  {
            vm.resetClasses();
            if (values && values[0] !== '_score') {
                vm.applyClass($element.find('th[jh-sort-by=\'' + values[0] + '\']'));
            }
        }
    }
})();
