'use strict';

// Static asset revisioning by appending content hash to filenames
module.exports = function ($, gulp, merge) {
    return function () {
        // Files without revision hash
        var revAll = new $.revAll({
            dontGlobal: [
                //^\/statics\/bower_components\//g,
                /^\/keys\//g,
                /^\/data\//g,
                /^.*.py/g,
                /^.*.yaml/g,
                /^.*.pem/g
                // Only revision files in index.html content
            ], dontRenameFile: [
                /^\/templates\/404.html/g,
                /^\/templates\/index.html/g
            ], dontUpdateReference: [
                /^\/templates\/404.html/g,
                /^\/templates\/index.html/g
            ]});

        var statics = gulp.src([
                'dist/**',
                '!dist/settings.py*',
                '!dist/cron.yaml*',
                '!dist/data/**'
                //'!dist/statics/bower_components/**',
                //'!dist/statics/elements/**'
            ])
            //.pipe(revAll.revision())
            .pipe(gulp.dest('deploy'))
            .pipe($.size({title: 'revision'}));

        var components = gulp.src('dist/statics/elements/elements.{html,js}')
                            .pipe(revAll.revision())
                            .pipe(gulp.dest('deploy'))
                            .pipe($.size({title: 'revision'}));

        return merge(
            statics,
            components
        );
    };
};