'use strict';

// Deploy to Google App Engine
// GAE requires Google Cloud SDK to be installed and configured.
// For info on SDK: https://cloud.google.com/sdk/
module.exports = function ($, config, gulp, merge, environment) {
    return function () {
        var ext_replace = require('gulp-ext-replace');

        var extension = config.deploy.gae.env[environment].extension;

        var settings = gulp.src('dist/settings.py.' + extension)
                           .pipe($.rename('settings.py'))
                           .pipe(gulp.dest('deploy'));

        var cron = gulp.src('dist/cron.yaml.' + extension)
                           .pipe($.rename('cron.yaml'))
                           .pipe(gulp.dest('deploy'));

        var data = gulp.src('dist/data/*.json.' + extension)
                       .pipe(ext_replace('.json', '.json.' + extension))
                       .pipe(gulp.dest('deploy/data'));

        var keys = gulp.src('dist/keys/' + extension.toLowerCase() + '/*.pem')
                       .pipe(gulp.dest('deploy/keys/' + extension.toLowerCase()));

        var dataRanges = gulp.src('dist/data/ranges.json').pipe(gulp.dest('deploy/data'));
        var technicalInspections = gulp.src('dist/data/technical_inspections.json').pipe(gulp.dest('deploy/data'));

        var elements = gulp.src('dist/statics/elements/elements.html')
            .pipe(gulp.dest('deploy/statics/elements'));

        return merge(settings, keys, data, cron, dataRanges, technicalInspections, elements).pipe($.size({title: 'env'}));
    };
};
