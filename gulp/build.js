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

var fs = require('fs'),
    gulp = require('gulp'),
    lazypipe = require('lazypipe'),
    footer = require('gulp-footer'),
    sourcemaps = require('gulp-sourcemaps'),
    rev = require('gulp-rev'),
    htmlmin = require('gulp-htmlmin'),
    ngAnnotate = require('gulp-ng-annotate'),
    prefix = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    useref = require("gulp-useref"),
    revReplace = require("gulp-rev-replace"),
    plumber = require('gulp-plumber'),
    gulpIf = require('gulp-if'),
    handleErrors = require('./handle-errors');

var config = require('./config');

var initTask = lazypipe()
    .pipe(sourcemaps.init);
var jsTask = lazypipe()
    .pipe(ngAnnotate)
    .pipe(uglify);
var cssTask = lazypipe()
    .pipe(prefix)
    .pipe(cssnano);

module.exports = function() {
    var templates = fs.readFileSync(config.tmp + '/templates.js');
    var manifest = gulp.src(config.revManifest);

    return gulp.src([config.app + '**/*.html',
        '!' + config.app + 'app/**/*.html',
        '!' + config.app + 'swagger-ui/**/*',
        '!' + config.bower + '**/*.html'])
        .pipe(plumber({errorHandler: handleErrors}))
        //init sourcemaps and prepend semicolon
        .pipe(useref({}, initTask))
        //append html templates
        .pipe(gulpIf('**/app.js', footer(templates)))
        .pipe(gulpIf('*.js', jsTask()))
        .pipe(gulpIf('*.css', cssTask()))
        .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulpIf('**/*.!(html)', rev()))
        .pipe(revReplace({manifest: manifest}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist));
};
