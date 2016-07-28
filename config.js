module.exports = {
    // Deploy task
    deploy: {
        // Google App Engine
        // GAE requires Google Cloud SDK to be installed and configured.
        // For info on SDK: https://cloud.google.com/sdk/
        gae: {
            env: {
                development: {
                    projectId: 'gcp-demo-cirruseo-dev',
                    version: '1',
                    extension: 'DEV'
                },
                production: {
                    projectId: 'gcp-demo-cirruseo',
                    version: '1',
                    extension: 'PROD'
                }
            },
            // Set the deployed version to be the default serving version.
            // https://cloud.google.com/sdk/gcloud/reference/preview/app/deploy
            setDefault: false,
            deployCron: false,
            deployQueue: true,
            deployIndex: false,
            deployDispatch: false
        }
    },
    build: {
        env: {
            // project ID
            dev: {
                clientId: '',
                googleDrivePickerDeveloperKey: ''
            },
            prod: {
                clientId: '',
                googleDrivePickerDeveloperKey: ''
            }
        }
    }
};
