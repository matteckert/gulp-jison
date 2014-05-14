var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var fs = require('fs');
var ebnfParser = require('ebnf-parser');
var lexParser  = require('lex-parser');
var Parser = require('jison').Parser;

const PLUGIN_NAME = 'gulp-jison';

module.exports = function (options) {
    options = options || {};
    options.jisonOptions = options.jisonOptions || {}

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
                var grammar = ebnfParser.parse(file.contents.toString());
                if(options.lexFile)
                  grammar.lex = lexParser.parse(fs.readFileSync(options.lexFile, { encoding: 'utf8' }));
              
                file.contents = new Buffer(new Parser(grammar, options.jisonOptions).generate());
                file.path = options.outFile || gutil.replaceExtension(file.path, ".js");
                this.push(file);
            } catch (error) {
                this.emit('error', new PluginError(PLUGIN_NAME, error));
            }
            return callback();
        }
    });
}
