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

  RteUpdater.prototype.updateRteInWebpackage = function (newRteVersion) {
    if (this._isValidVersion(newRteVersion)) {
      var artifactTypes = ['apps', 'elementaryComponents', 'compoundComponents'];
      artifactTypes.forEach(function (artifactType) {
        if (this.manifest.hasOwnProperty('artifacts') && this.manifest.artifacts.hasOwnProperty(artifactType)) {
          var artifacts = this.manifest.artifacts[artifactType];
          artifacts.forEach(function (artifact, index) {
            this._updateRteInRunnablesOfArtifact(artifact, newRteVersion);
            this._updateRteInDependenciesOfArtifact(artifact, artifactType, index, newRteVersion);
          }.bind(this));
        }
      }.bind(this));
      this._writeManifest();
    } else {
      console.error(this._getMessagePrefix(), 'Invalid version of RTE,', newRteVersion, ', valid versions are like: 1.0.0, 2.5.1-SNAPSHOT. ');
      throw new Error('Invalid RTE version');
    }
  };

  RteUpdater.prototype._isValidVersion = function (version) {
    var versionRegExp = new RegExp('^(\\d+)(\\.[\\d]+)*(-SNAPSHOT)?$');
    return versionRegExp.test(version);
  };

  RteUpdater.prototype._updateRteInDependenciesOfArtifact = function (artifactDefinition, artifactType, index, newRteVersion) {
    if (artifactDefinition.hasOwnProperty('dependencies')) {
      artifactDefinition.dependencies.forEach(function (dep, index) {
        var rteRefRegExp = new RegExp('^cubx.core.rte[@](\\d+)(\\.[\\d]+)*(-SNAPSHOT)?$', 'g');
        if (rteRefRegExp.test(dep.webpackageId)) {
          artifactDefinition.dependencies[index].webpackageId = this._updateRteVersionInString(dep.webpackageId, newRteVersion);
          if (this.isRte3x(newRteVersion) && dep.artifactId === 'cubxpolymer') {
            artifactDefinition.dependencies[index].artifactId = 'cubxcomponent';
          }
        }
      }.bind(this));
      this.manifest.artifacts[artifactType][index] = artifactDefinition;
    }
  };

  RteUpdater.prototype._updateRteInRunnablesOfArtifact = function (artifactDefinition, newRteVersion) {
    if (artifactDefinition.hasOwnProperty('runnables')) {
      artifactDefinition.runnables.forEach(function (runnable) {
        var runnablePath = path.join(this._webpackagePath, artifactDefinition.artifactId, runnable.path);
        var runnableFileContent = fs.readFileSync(runnablePath, 'utf8');
        if (typeof runnableFileContent === 'string') {
          fs.writeFileSync(runnablePath, this._updateRteVersionInString(runnableFileContent, newRteVersion), 'utf8');
        } else {
          console.error(this._getMessagePrefix(), 'Runnable not found at: ', runnablePath);
          throw new Error('Runnable not found');
        }
      }.bind(this));
    }
  };

  RteUpdater.prototype.isOfTargetVersion = function (version, targetVersion) {
    return version.indexOf(targetVersion) === 0;
  };

  RteUpdater.prototype.isRte3x = function (version) {
    return this.isOfTargetVersion(version, '3.');
  };

  RteUpdater.prototype.injectRte3xScripts = function (htmlCode, rteVersion) {
    var adapterScriptPath = '/webcomponents/custom-elements-es5-adapter.js';
    var newHtmlCode = '';
    if (htmlCode.indexOf(adapterScriptPath) === -1) {
      htmlCode = htmlCode.replace('/webcomponents-lite/', '/webcomponents/');
      var rteScriptRegExp = new RegExp('<script.*src=".*cubx.core.rte@', 'g');
      var firstRteScriptIndex = htmlCode.search(rteScriptRegExp);
      if (firstRteScriptIndex > -1) {
        var scriptSuffix = htmlCode.match(rteScriptRegExp)[0];
        var scriptSrcSuffix = scriptSuffix.slice(scriptSuffix.indexOf('src="'));
        var adapterScript = '<script ' + scriptSrcSuffix + rteVersion + adapterScriptPath + '"></script>';
        newHtmlCode = htmlCode.slice(0, firstRteScriptIndex) + adapterScript + '\n    ' + htmlCode.slice(firstRteScriptIndex);
      }
    }
    return newHtmlCode || htmlCode;
  };

  RteUpdater.prototype._updateRteVersionInString = function (string, newRteVersion) {
    var rtePackageName = 'cubx.core.rte';
    var rteRefRegExp = new RegExp(rtePackageName + '[@](\\d+)(\\.[\\d]+)*(-SNAPSHOT)?', 'g');
    string = string.replace(rteRefRegExp, rtePackageName + '@' + newRteVersion);
    if (this.isRte3x(newRteVersion)) {
      string = this.injectRte3xScripts(string, newRteVersion);
    }
    return string;
  };

  RteUpdater.prototype._getMessagePrefix = function () {
    return 'RteUpdater:';
  };

  RteUpdater.prototype._loadManifest = function () {
    var manifest = fs.readFileSync(this.manifestPath, 'utf8');
    return typeof manifest === 'string' ? JSON.parse(manifest) : manifest;
  };

  RteUpdater.prototype._writeManifest = function () {
    fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2), 'utf8');
  };

  module.exports = RteUpdater;
}());
