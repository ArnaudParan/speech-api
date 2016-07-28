'use strict';

// Deploy to Google App Engine
// GAE requires Google Cloud SDK to be installed and configured.
// For info on SDK: https://cloud.google.com/sdk/
module.exports = function ($, config, gulp, options, environment) {
    return function (cb) {
        var spawn = require('child_process').spawn;
        var gutil = require('gulp-util');

        var projectID = config.deploy.gae.env[environment].projectId;
        var version = options.version || "1-0-0";

        var args = ['preview', 'app', 'deploy', '--quiet'];
        if (config.deploy.gae.setDefault) {
            args.push('--promote');
        }
        if (version){
            args.push('--version');
            args.push(version);
            gutil.log('Deploying version ' + version);
        }
        args.push('--project');
        args.push(projectID);
        args.push('deploy/app.yaml');

        var deployApp = 'gcloud ' + args.join(' ');

        var deployIndex = 'gcloud preview app deploy --quiet --project ' + projectID + ' deploy/index.yaml';
        var deployQueue = 'gcloud preview app deploy --quiet --project ' + projectID + ' deploy/queue.yaml';
        var deployCron = 'gcloud preview app deploy --quiet --project ' + projectID + ' deploy/cron.yaml';
        var deployDispatch = 'gcloud preview app deploy --quiet --project ' + projectID + ' deploy/dispatch.yaml';

        gutil.log(deployApp);
        var app = spawn('gcloud', args, { stdio: 'inherit' });
        gutil.log('Deploy app result: ' + app);

        if (config.deploy.gae.deployIndex){
            gutil.log(deployIndex);
            var index = spawn('gcloud', [
                'preview', 'app', 'deploy', '--quiet', '--project', projectID, 'deploy/index.yaml'
            ], { stdio: 'inherit' });
            gutil.log('Deploy index result: ' + app);
        }

        if (config.deploy.gae.deployQueue) {
            gutil.log(deployQueue);
            var queue = spawn('gcloud', [
                'preview', 'app', 'deploy', '--quiet', '--project', projectID, 'deploy/queue.yaml'
            ], {stdio: 'inherit'});
            gutil.log('Deploy queue result: ' + app);
        }

        if (config.deploy.gae.deployCron) {
            gutil.log(deployCron);
            var cron = spawn('gcloud', [
                'preview', 'app', 'deploy', '--quiet', '--project', projectID, 'deploy/cron.yaml'
            ], {stdio: 'inherit'});
            gutil.log('Deploy cron result: ' + app);
        }

        if (config.deploy.gae.deployDispatch) {
            gutil.log(deployDispatch);
            var dispatch = spawn('gcloud', [
                'preview', 'app', 'deploy', '--quiet', '--project', projectID, 'deploy/dispatch.yaml'
            ], {stdio: 'inherit'});
            gutil.log('Deploy cron result: ' + dispatch);
        }
    };
};
