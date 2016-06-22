'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var historyApiFallback = require('connect-history-api-fallback');
var crypto = require('crypto');
var preprocess = require('gulp-preprocess');
var minimist = require('minimist');

var config = require('./config');

var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'dev' }
};

var options = minimist(process.argv.slice(2), knownOptions);

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
        searchPath: ['.tmp', 'app', dist()]
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
        .pipe($.if('*.css', $.minifyCss()))
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

// Optimize images
gulp.task('images', function() {
    return imageOptimizeTask('app/statics/images/**/*', dist('statics/images'));
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
        'app/statics/*',
        '!app/statics/cache-config.json',
        '!app/statics/manifest.json'
    ], {
        dot: true
    }).pipe(gulp.dest(dist('statics')));

    var templates = gulp.src([
        'app/templates/*'
    ], {
        dot: true
    }).pipe(gulp.dest(dist('templates')));
    
    var locale = gulp.src([
        'app/locale/**'
    ], {
        dot: true
    }).pipe(gulp.dest(dist('locale')));

    var scripts = gulp.src([
        'app/statics/scripts/**/*.js'
    ], {
        dot: true
    }).pipe(preprocess({
        context: {
            env: options.env,
            clientId: config.build.env[options.env].clientId,
            googleDrivePickerDeveloperKey: config.build.env[options.env].googleDrivePickerDeveloperKey
        }
    }))
      .pipe(gulp.dest(dist('statics/scripts')));

    var data = gulp.src([
        'app/statics/data/**/*.json'
    ], {
        dot: true
    }).pipe(gulp.dest(dist('statics/data')));

    // Copy python files
    var python = gulp.src([
        'app/**/*.py'
    ]).pipe(gulp.dest(dist()));
    
    // Copy python files
    var bigquery = gulp.src([
        'app/bigquery_data/*.json'
    ]).pipe(gulp.dest(dist('bigquery_data')));

    var keys = gulp.src([
        'app/keys/**/**'
    ]).pipe(gulp.dest(dist('keys')));

    // Copy yaml files
    var yaml = gulp.src([
        'app/*.yaml'
    ]).pipe(gulp.dest(dist()));

    // Copy bower components
    var bower = gulp.src([
        'app/statics/bower_components/**/*.{css,html,js}',
        '!app/statics/bower_components/**/index.html',
        '!app/statics/bower_components/**/{demo,test}/**/*'
    ]).pipe(gulp.dest(dist('statics/bower_components')));

    // Copy custom components
    var elements = gulp.src(['app/statics/elements/**/*.html',
            'app/statics/elements/**/*.css',
            'app/statics/elements/**/*.js'
        ])
        .pipe(gulp.dest(dist('statics/elements')));

    var externalCss = gulp.src([
        'app/statics/elements/**/*.css'
    ]).pipe(gulp.dest('dist/statics/elements'));

    var vulcanized = gulp.src(['app/statics/elements/elements.html'])
        .pipe($.rename('elements.vulcanized.html'))
        .pipe(gulp.dest(dist('statics/elements')));

    return merge(app,  statics, python, bigquery, locale, yaml, bower, elements, vulcanized)
        .pipe($.size({
            title: 'copy'
        }));
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
    return optimizeHtmlTask(
        [
            'app/statics/**/*.html',
            '!app/statics/{elements,test}/**/*.html'
        ],
        dist('statics'));
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
        .pipe(gulp.dest(dist('statics/elements')))
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
                port: 8080,
                host: '127.0.0.1',
                admin_port: 8000,
                admin_host: '127.0.0.1',
                log_level: 'debug'
            })
        );

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
        server: 'app/statics/',
        middleware: [historyApiFallback()]
    });

    gulp.watch(['app/statics/**/*.html'], reload);
    gulp.watch(['app/statics/styles/**/*.css'], ['styles', reload]);
    gulp.watch(['app/statics/elements/**/*.css'], ['elements', reload]);
    gulp.watch(['app/statics/{scripts,elements}/**/{*.js,*.html}'], ['lint', reload]);
    gulp.watch(['app/statics/images/**/*'], reload);
});

gulp.task('clean-dist', require(task('clean-dist'))(del));

//compile Babel locale files
gulp.task('locales', $.shell.task(['pybabel compile -f -d app/locale']));

// Transpile all JS from ES2015 (ES6) to ES5
gulp.task('js', require(task('js-babel'))($, gulp));

// Lint CSS and JavaScript
gulp.task('lint', require(task('lint'))($, gulp, merge));

// Add colors to Web Application Manifest - manifest.json
gulp.task('manifest', require(task('manifest'))($, config, gulp));

// Minify JavaScript in dist directory
gulp.task('minify-dist', require(task('minify-dist'))($, gulp, merge));

// Static asset revisioning by appending content hash to filenames
gulp.task('revision', require(task('revision'))($, gulp));

// Transform styles with PostCSS
gulp.task('styles', require(task('styles'))($, config, gulp, merge));

// Puts a revision on resources that may be cached by the browser  and just copies other resources in deploy folder
gulp.task('revision', require(task('revision'))($, gulp));

// Process environment specific files (e.g/ settings.py)
gulp.task('env-preprocess', require(task('env-preprocess'))($, gulp, options.env));

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
    runSequence(
        'locales',
        ['copy', 'styles'],
        'elements',
        ['lint', 'images', 'fonts', 'html'],
        'vulcanize',
        cb);
});

// Pre-deploy tasks
gulp.task('pre-deploy', function(cb) {
    runSequence(
        'default',
        'env-preprocess',
        'revision',
        cb
    );
});

// Deploy to development environment
gulp.task('deploy', ['pre-deploy'], require(task('deploy'))($, config, gulp, options.env));

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
    require('require-dir')('tasks');
} catch (err) {}
