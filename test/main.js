var should = require('should');
var rawJison = require('jison');
var gulpJison = require('../');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var ebnfParser = require('ebnf-parser');
require('mocha');

var createVirtualFile = function (filename, contents) {
    return new gutil.File({
        path: path.join(__dirname, 'fixtures', filename),
        base: path.join(__dirname, 'fixtures'),
        cwd: process.cwd(),
        contents: contents
    });
}

describe('gulp-jison', function() {
    it('should output the same parser as jison', function (done) {
        var filepath = 'test/fixtures/calculator.jison';
        var text = fs.readFileSync(filepath);
        var expected = rawJison.Generator(text.toString()).generate();

        gulpJison()
            .on('error', done)
            .on('data', function(data) {
                data.contents.toString().should.equal(expected);
                done();
            })
            .write(createVirtualFile('calculator.jison', text));
    });

    it('should work with options', function (done) {
        var options = {type: 'slr', moduleType: 'amd', moduleName: 'jsoncheck'};

        var filepath = 'test/fixtures/calculator.jison';
        var text = fs.readFileSync(filepath);
        var expected = rawJison.Generator(text.toString(), options).generate();

        gulpJison(options)
            .on('error', done)
            .on('data', function(data) {
                data.contents.toString().should.equal(expected);
                done();
            })
            .write(createVirtualFile('calculator.jison', text));
    });

    it('should work with json', function (done) {
        var options = {type: 'slr', moduleType: 'amd', moduleName: 'jsoncheck'};

        var filepath = 'test/fixtures/calculator.jison';
        var text = fs.readFileSync(filepath);
        var expected = rawJison.Generator(text.toString(), options).generate();

        // Generate JSON grammar from Jison grammar.
        var json = JSON.stringify(ebnfParser.parse(text.toString()));

        gulpJison(options)
            .on('error', done)
            .on('data', function(data) {
                data.contents.toString().should.equal(expected);
                done();
            })
            .write(createVirtualFile('calculator.json', new Buffer(json)));
    });
});
