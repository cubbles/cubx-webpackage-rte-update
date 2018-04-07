(function () {
  'use strict';

  var fs = require('fs-extra');
  var path = require('path');

  var RteUpdater = function (webpackagePath) {
    if (!webpackagePath) {
      console.error(this._getMessagePrefix(), 'Missed parameter for webpackage path.');
      throw new Error('Missed webpackagePath parameter');
    }
    if (!path.isAbsolute(webpackagePath)) {
      this._webpackagePath = path.join(process.cwd(), webpackagePath);
    } else {
      this._webpackagePath = webpackagePath;
    }
    this.manifestPath = path.resolve(this._webpackagePath, 'manifest.webpackage');
    this.manifest = this._loadManifest();
  };

  RteUpdater.prototype._updateRteInArtifactsOfAType = function (artifactsType, newRteVersion) {
    if (this.manifest.hasOwnProperty('artifacts') && this.manifest.artifacts.hasOwnProperty(artifactsType)) {
      var artifacts = this.manifest.artifacts[artifactsType];
      artifacts.forEach(function (artifact) {
        switch (artifactsType) {
          case 'apps':
            this._updateRteInApp(artifact, newRteVersion);
            break;
        }
      }.bind(this));
    }
  };

  RteUpdater.prototype._updateRteInApp = function (appDefinition, newRteVersion) {
    appDefinition.runnables.forEach(function (runnable) {
      var runnablePath = path.join(this._webpackagePath, appDefinition.artifactId, runnable.path);
      var runnableFileContent = fs.readFileSync(runnablePath, 'utf8');
      if (typeof runnableFileContent === 'string') {
        fs.writeFileSync(runnablePath, this._updateRteVersionInHtml(runnableFileContent, newRteVersion), 'utf8');
      } else {
        console.error(this._getMessagePrefix(), 'Runnable not found at: ', runnablePath);
        throw new Error('Runnable not found');
      }
    }.bind(this));
  };

  RteUpdater.prototype._updateRteVersionInHtml = function (htmlCode, newRteVersion) {
    var rtePackageName = 'cubx.core.rte';
    var rteRefRegExp = new RegExp(rtePackageName + '[@](\\d+)(\\.[\\d]+)*(-SNAPSHOT)?', 'g');
    return htmlCode.replace(rteRefRegExp, rtePackageName + '@' + newRteVersion);
  };

  RteUpdater.prototype._getMessagePrefix = function () {
    return 'RteUpdater: ';
  };

  RteUpdater.prototype._loadManifest = function () {
    var manifest = fs.readFileSync(this.manifestPath, 'utf8');
    return typeof manifest === 'string' ? JSON.parse(manifest) : manifest;
  };

  module.exports = RteUpdater;
}());
