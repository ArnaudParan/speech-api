module.exports = {
    // Deploy task
    deploy: {
        // Google App Engine
        // GAE requires Google Cloud SDK to be installed and configured.
        // For info on SDK: https://cloud.google.com/sdk/
        gae: {
            env: {
                // project ID
                dev: {
                    appId: 'gcp-demo-cirruseo-dev',
                    version: '1'
                },
                prod: {
                    appId: 'gcp-demo-cirruseo',
                    version: '1'
                }
            },
            // Set the deployed version to be the default serving version.
            // https://cloud.google.com/sdk/gcloud/reference/preview/app/deploy
            setDefault: false
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
