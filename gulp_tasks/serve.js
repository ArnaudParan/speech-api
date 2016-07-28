'use strict';

// Build and serve the output from the app folder with GAE tool
module.exports = function ($, gulp) {
  return function () {
    return $.shell('dev_appserver.py app/app.yaml')
  };
};
