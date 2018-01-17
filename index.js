var through = require('through2');
var replaceExtension = require('replace-ext');
var PluginError = require('plugin-error');
var Generator = require('jison').Generator;

const PLUGIN_NAME = 'gulp-jison';

module.exports = function (options) {
    options = options || {};

    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported'));
            return callback();
        }

        if (file.isBuffer()) {
            try {
                file.contents = new Buffer(new Generator(file.contents.toString(), options).generate());
                file.path = replaceExtension(file.path, ".js");
                this.push(file);
            } catch (error) {
                this.emit('error', new PluginError(PLUGIN_NAME, error));
            }
            return callback();
        }
    });
};
