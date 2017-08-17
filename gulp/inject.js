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

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    inject = require('gulp-inject'),
    es = require('event-stream'),
    naturalSort = require('gulp-natural-sort'),
    angularFilesort = require('gulp-angular-filesort'),
    bowerFiles = require('main-bower-files');

var handleErrors = require('./handle-errors');

var config = require('./config');

module.exports = {
    app: app,
    vendor: vendor,
    test: test,
    troubleshoot: troubleshoot
}

function app() {
    return gulp.src(config.app + 'index.html')
        .pipe(inject(gulp.src(config.app + 'app/**/*.js')
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(naturalSort())
            .pipe(angularFilesort()), {relative: true}))
        .pipe(gulp.dest(config.app));
}

function vendor() {
    var stream = gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.app));

    return es.merge(stream, gulp.src(config.sassVendor)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles({filter:['**/*.{scss,sass}']}), {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.scss)));
}

function test() {
    return gulp.src(config.test + 'karma.conf.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles({includeDev: true, filter: ['**/*.js']}), {read: false}), {
            starttag: '// bower:js',
            endtag: '// endbower',
            transform: function (filepath) {
                return '\'' + filepath.substring(1, filepath.length) + '\',';
            }
        }))
        .pipe(gulp.dest(config.test));
}

function troubleshoot() {
    /* this task removes the troubleshooting content from index.html*/
    return gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        /* having empty src as we dont have to read any files*/
        .pipe(inject(gulp.src('', {read: false}), {
            starttag: '<!-- inject:troubleshoot -->',
            removeTags: true,
            transform: function () {
                return '<!-- Angular views -->';
            }
        }))
        .pipe(gulp.dest(config.app));
}
