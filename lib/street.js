var ManifestBuilder = require('./manifest-builder');

var m = new ManifestBuilder('../street.js/fakes/');
m.on('built', function () {

  m.save();
});

m.build();
