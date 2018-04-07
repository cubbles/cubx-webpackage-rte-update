/* globals describe, beforeEach, it, expect, before, __dirname, sinon */
(function () {
  'use strict';
  describe('RteUpdater', function () {
    var rteUpdater;
    var fs;
    var wpBackupPath;
    var wpPath;
    var wpManifestPath;
    var path;
    var refactoredFilesFolderName = 'refactored-files';
    var newArtifactVersion = '3.0.0';
    before(function () {
      fs = require('fs-extra');
      path = require('path');

      wpBackupPath = path.resolve(__dirname, '../resources/wp-backup');
      wpPath = path.join(__dirname, '../resources/wp');
      wpManifestPath = path.join(wpPath, 'manifest.webpackage');
      fs.copySync(wpBackupPath, wpPath);
    });
    beforeEach(function () {
      var RteUpdater = require('../../lib/cubx-webpackage-rte-update');
      rteUpdater = new RteUpdater(wpPath);
      fs.emptyDirSync(wpPath);
      fs.copySync(wpBackupPath, wpPath);
    });
    describe('#_updateRteInArtifactsRunnables', function () {
      beforeEach(function () {
        rteUpdater.manifest = JSON.parse(fs.readFileSync(wpManifestPath, 'utf8'));
      });
      it('should update rte version in all runnables of all artifacts', function () {
        rteUpdater._updateRteInArtifactsRunnables(newArtifactVersion);
        var refactoredApp = fs.readFileSync(path.join(wpPath, 'app', 'index.html'), 'utf8');
        var expectedApp = fs.readFileSync(path.join(wpPath, 'app', refactoredFilesFolderName, 'index.html'), 'utf8');
        var refactoredDocsApp = fs.readFileSync(path.join(wpPath, 'docs', 'index.html'), 'utf8');
        var expectedDocsApp = fs.readFileSync(path.join(wpPath, 'docs', refactoredFilesFolderName, 'index.html'), 'utf8');

        var refactoredCompoundDemo = fs.readFileSync(path.join(wpPath, 'my-compound', 'demo', 'index.html'), 'utf8');
        var expectedCompoundDemo = fs.readFileSync(path.join(wpPath, 'my-compound', 'demo', refactoredFilesFolderName, 'index.html'), 'utf8');
        var refactoredCompoundDocs = fs.readFileSync(path.join(wpPath, 'my-compound', 'docs', 'index.html'), 'utf8');
        var expectedCompoundDocs = fs.readFileSync(path.join(wpPath, 'my-compound', 'docs', refactoredFilesFolderName, 'index.html'), 'utf8');

        var refactoredElementaryDemo = fs.readFileSync(path.join(wpPath, 'my-compound', 'demo', 'index.html'), 'utf8');
        var expectedElementaryDemo = fs.readFileSync(path.join(wpPath, 'my-compound', 'demo', refactoredFilesFolderName, 'index.html'), 'utf8');
        var refactoredElementaryDocs = fs.readFileSync(path.join(wpPath, 'my-elementary', 'docs', 'index.html'), 'utf8');
        var expectedElementaryDocs = fs.readFileSync(path.join(wpPath, 'my-elementary', 'docs', refactoredFilesFolderName, 'index.html'), 'utf8');

        return Promise.all([
          expect(refactoredApp).to.be.equal(expectedApp),
          expect(refactoredDocsApp).to.be.equal(expectedDocsApp),
          expect(refactoredCompoundDemo).to.be.equal(expectedCompoundDemo),
          expect(refactoredCompoundDocs).to.be.equal(expectedCompoundDocs),
          expect(refactoredElementaryDemo).to.be.equal(expectedElementaryDemo),
          expect(refactoredElementaryDocs).to.be.equal(expectedElementaryDocs)
        ]);
      });
    });
    describe('#_loadManifest', function () {
      var expectedManifest;
      beforeEach(function () {
        expectedManifest = JSON.parse(fs.readFileSync(wpManifestPath, 'utf8'));
      });
      it('should load the manifest properly', function () {
        expect(rteUpdater._loadManifest()).to.deep.equal(expectedManifest);
      });
    });
  });
})();
