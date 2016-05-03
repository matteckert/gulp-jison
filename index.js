var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Generator = require('jison').Generator;
var Parser = require('jison').Parser;

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
                var input = file.contents.toString();
                var json = null;

                try {
                    // Will throw an error if the input is not JSON.
                    json = JSON.parse(input);
                } catch (err) {
                    // JSON parsing failed, must be a Jison grammar.
                    json = null;
                } finally {
                    if (json === null) {
                        // Input is a Jison grammar.
                        file.contents = new Buffer(new Generator(input, options).generate());
                    } else {
                        // Input is a JSON structure.
                        file.contents = new Buffer(new Generator(json, options).generate());
                    }
                }

                file.path = gutil.replaceExtension(file.path, ".js");
                this.push(file);
            } catch (error) {
                this.emit('error', new PluginError(PLUGIN_NAME, error));
            }
            return callback();
        }
    });
};
