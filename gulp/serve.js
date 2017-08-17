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
    util = require('./utils'),
    url = require('url'),
    browserSync = require('browser-sync'),
    proxy = require('proxy-middleware');

var config = require('./config');

module.exports = function () {
    var baseUri = config.uri + config.apiPort;
    // Routes to proxy to the backend. Routes ending with a / will setup
    // a redirect so that if accessed without a trailing slash, will
    // redirect. This is required for some endpoints for proxy-middleware
    // to correctly handle them.
    var proxyRoutes = [
        '/api',
        '/management',
        '/swagger-resources',
        '/v2/api-docs',
        '/h2-console'
    ];

    var requireTrailingSlash = proxyRoutes.filter(function (r) {
        return util.endsWith(r, '/');
    }).map(function (r) {
        // Strip trailing slash so we can use the route to match requests
        // with non trailing slash
        return r.substr(0, r.length - 1);
    });

    var proxies = [
        // Ensure trailing slash in routes that require it
        function (req, res, next) {
            requireTrailingSlash.forEach(function (route){
                if (url.parse(req.url).path === route) {
                    res.statusCode = 301;
                    res.setHeader('Location', route + '/');
                    res.end();
                }
            });

            next();
        }
    ]
    .concat(
        // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
        proxyRoutes.map(function (r) {
            var options = url.parse(baseUri + r);
            options.route = r;
            options.preserveHost = true;
            return proxy(options);
        }));

    browserSync({
        open: true,
        port: config.port,
        server: {
            baseDir: config.app,
            middleware: proxies
        }
    });

    gulp.start('watch');
};
