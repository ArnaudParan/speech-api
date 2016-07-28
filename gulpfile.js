'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var minimist = require('minimist');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var historyApiFallback = require('connect-history-api-fallback');
var crypto = require('crypto');

var config = require('./config');
var options = minimist(process.argv.slice(2));

// Get a task path
function task(filename) {
    return './gulp_tasks/' + filename;
}

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var DIST = 'dist';

var dist = function(subpath) {
    return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = function(stylesPath, srcs) {
    return gulp.src(srcs.map(function(src) {
            return path.join('app', stylesPath, src);
        }))
        .pipe($.changed(stylesPath, {extension: '.css'}))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('.tmp/' + stylesPath))
        .pipe($.minifyCss())
        .pipe(gulp.dest(dist(stylesPath)))
        .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
    return gulp.src(src)
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(dest))
        .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {
    var assets = $.useref.assets({
        searchPath: ['.tmp', 'app']
    });

    return gulp.src(src)
        // Replace path for vulcanized assets
        .pipe($.if('*.html', $.replace('elements/elements.html', 'elements/elements.vulcanized.html')))
        .pipe(assets)
        // Concatenate and minify JavaScript
        .pipe($.if('*.js', $.uglify({
            preserveComments: 'some'
        })))
        // Concatenate and minify styles
        // In case you are still using useref build blocks
        //.pipe($.if('*.css', $.minifyCss()))
        .pipe(assets.restore())
        .pipe($.useref())
        // Minify any HTML
        .pipe($.if('*.html', $.minifyHtml({
            quotes: true,
            empty: true,
            spare: true
        })))
        // Output files
        .pipe(gulp.dest(dest))
        .pipe($.size({
            title: 'html'
        }));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
    return styleTask('styles', ['statics/**/*.css']);
});

gulp.task('elements', function() {
    return styleTask('elements', ['statics/**/*.css']);
});

// Optimize images
gulp.task('images', function() {
    return imageOptimizeTask('app/statics/images/**/*', dist('statics/images'));
});

// Lint JavaScript
gulp.task('lint', function() {
    return gulp.src([
            'app/statics/scripts/**/*.js',
            'app/statics/elements/**/*.js',
            'app/statics/elements/**/*.html',
            'gulpfile.js'
        ])
        .pipe(reload({
            stream: true,
            once: true
        }))

        // JSCS has not yet a extract option
        .pipe($.if('*.html', $.htmlExtract()))
        .pipe($.jshint())
        .pipe($.jscs())
        .pipe($.jscsStylish.combineWithHintResults())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Copy all files at the root level (app)
gulp.task('copy', function() {
    var app = gulp.src([
        'app/*',
        '!app/test',
        '!app/handlers',
        '!app/libs',
        '!app/statics'
    ], {
        dot: true
    }).pipe(gulp.dest(dist()));

    var statics = gulp.src([
        'app/statics/**',
        '!app/statics/bower_components',
        '!app/statics/manifest.json'
    ], {
        dot: true
    }).pipe(gulp.dest(dist('statics')));

    var templates = gulp.src('app/templates/**', {
        dot: true
    }).pipe(gulp.dest(dist('templates')));

    var db = gulp.src('app/db/**', {
        dot: true
    }).pipe(gulp.dest(dist('db')));

    // Copy data models
    var models = gulp.src('app/models/**', {
        dot: true
    }).pipe(gulp.dest(dist('models')));

    // Copy python files
    var python = gulp.src('app/**/*.py').pipe(gulp.dest(dist()));

    var keys = gulp.src('app/keys/**').pipe(gulp.dest(dist('keys')));

    // Copy yaml files
    var yaml = gulp.src('app/*.yaml').pipe(gulp.dest(dist()));

    // Copy bower components
    var bower = gulp.src([
        'app/statics/bower_components/**/*.{css,html,js}',
        '!app/statics/bower_components/**/index.html',
        '!app/statics/bower_components/**/{demo,test}/**/*'
    ]).pipe(gulp.dest(dist('statics/bower_components')));

    // Copy custom components
    var elements = gulp.src([
        'app/statics/elements/**/*.html',
        'app/statics/elements/**/*.css',
        'app/statics/elements/**/*.js'
    ]).pipe(gulp.dest(dist('statics/elements')));

    var vulcanized = gulp.src('app/statics/elements/elements.html')
        .pipe($.rename('elements.vulcanized.html'))
        .pipe(gulp.dest(dist('statics/elements')));

    return merge(app, statics, templates, db, models, python, keys, yaml, bower, elements, vulcanized)
        .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', function() {
    return gulp.src(['app/statics/fonts/**'])
        .pipe(gulp.dest(dist('statics/fonts')))
        .pipe($.size({
            title: 'fonts'
        }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
    return optimizeHtmlTask([
        'app/templates/*.html'
    ], dist('templates'));
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
    return gulp.src(dist('statics/elements/elements.vulcanized.html'))
        .pipe($.vulcanize({
            stripComments: true,
            inlineCss: true,
            inlineScripts: true
        }))
        .pipe($.rename('elements.html'))
        .pipe(gulp.dest('dist/statics/elements'))
        .pipe($.size({title: 'vulcanize'}));
});

// Clean output directory
gulp.task('clean', function() {
    return del(['.tmp', dist(), 'deploy']);
});

// Build and serve the output from the dist build with GAE tool
gulp.task('serve', function() {
    gulp.src('app/app.yaml')
        .pipe($.gae('dev_appserver.py', [], {
                port: 5000,
                host: '127.0.0.1',
                admin_port: 5050,
                admin_host: '127.0.0.1',
                log_level: 'info'
        })
        );

    /*
     browserSync({
     port: 5001,
     notify: false,
     open: false,
     logPrefix: 'V',
     logLevel: 'debug',
     snippetOptions: {
     rule: {
     match: '<span id="browser-sync-binding"></span>',
     fn: function(snippet) {
     return snippet;
     }
     }
     },
     // Run as an https by uncommenting 'https: true'
     // Note: this uses an unsigned certificate which on first access
     //       will present a certificate warning in the browser.
     // https: true,
     server: dist(),
     middleware: [historyApiFallback()]
     });
     */

    //gulp.watch(['app/**/*.html'], reload);
    //gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
    //gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
    //gulp.watch(['app/{scripts,elements}/**/{*.js,*.html}'], ['lint', reload]);
    //gulp.watch(['app/images/**/*'], reload);

});

// Lint CSS and JavaScript
gulp.task('lint', require(task('lint'))($, gulp, merge));

// Transpile all JS from ES2015 (ES6) to ES5
gulp.task('js', require(task('js-babel'))($, gulp));

// Add colors to Web Application Manifest - manifest.json
gulp.task('manifest', require(task('manifest'))($, config, gulp));

// Minify JavaScript in dist directory
gulp.task('minify-dist', require(task('minify-dist'))($, gulp, merge));

// Static asset revisioning by appending content hash to filenames
gulp.task('revision', require(task('revision'))($, gulp, merge));

// Transform styles with PostCSS
gulp.task('styles', require(task('styles'))($, config, gulp, merge));

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
    runSequence(
        ['copy', 'styles'],
        'elements',
        [
            'lint',
            'images',
            'fonts',
            //'html'
        ],
        'vulcanize',
        cb);
});

// Pre-deploy tasks
gulp.task('pre-deploy',
    function(cb) {
        runSequence('default', 'revision', cb);
    }
);

gulp.task('pre-deploy:dev', ['pre-deploy'], require(task('env-preprocess'))($, config, gulp, merge, 'development'));
gulp.task('pre-deploy:prod', ['pre-deploy'], require(task('env-preprocess'))($, config, gulp, merge, 'production'));

// Deploy to development environment
gulp.task('deploy:dev', ['pre-deploy:dev'], require(task('deploy'))($, config, gulp, options, 'development'));

// Deploy to production environment
gulp.task('deploy:prod', ['pre-deploy:prod'], require(task('deploy'))($, config, gulp, options, 'production'));

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
    require('require-dir')('tasks');
} catch (err) {}
