# cubx-webpackage-rte-update

[![Build Status](https://travis-ci.org/cubbles/cubx-webpackage-rte-update.svg?branch=master)](https://travis-ci.org/cubbles/cubx-webpackage-rte-update)

Module for updating the rte version references of the current webpackage.

## Usage: 
### Command line: 

```
cubx-webpackage-rte-update -p <webpackagPath> -v <newRteVersion>
```

### Other npm modules

```javascript
var webpackagePath = 'path/to/webpackage';
var newRteVersion = '1.0.0';

var RteUpdater = require('cubx-webpackage-rte-update');
var rteUpdater = new RteUpdater(webpackagePath);
rteUpdater.updateRteInWebpackage(newRteVersion);
```