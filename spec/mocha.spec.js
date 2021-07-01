// Mocha Specification Cases

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { readdirSync, readFileSync } from 'fs';
import Vinyl from 'vinyl';
import sinon from 'sinon';

// Plugin
import { htmlValidator } from '../html-validator.js';
const analyzedFiles = { valid: [], invalid: [] };
console.log('  Input HTML files for validation:');
readdirSync('spec/html').forEach(file => console.log('    spec/html/' + file));

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The gulp-w3c-html-validator analyzer()', () => {

   it('passes a valid HTML file', (done) => {
      const vinylOptions = {
         path:     'spec/html/valid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/valid.html'),
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.analyzer();
      const handleEndOfStream = () => {
         const actual = {
            files:   analyzedFiles.valid.length,
            path:    analyzedFiles.valid[0].path,
            results: analyzedFiles.valid[0].w3cHtmlValidator,
            };
         const expected = {
            files:   1,
            path:    'spec/html/valid.html',
            results: {
               validates: true,
               mode:      'html',
               title:     'HTML String (characters: 153)',
               filename:  null,
               website:   null,
               output:    'json',
               status:    200,
               messages:  [],
               display:   null,
               html:      readFileSync('spec/html/valid.html').toString(),
               },
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      stream.on('data', (file) => analyzedFiles.valid.push(file));
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   it('reports errors and warnings for an invalid HTML file', (done) => {
      const vinylOptions = {
         path:     'spec/html/invalid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/invalid.html'),
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.analyzer();
      const handleEndOfStream = () => {
         const actual = {
            files:     analyzedFiles.invalid.length,
            path:      analyzedFiles.invalid[0].path,
            validates: analyzedFiles.invalid[0].w3cHtmlValidator.validates,
            messages:  analyzedFiles.invalid[0].w3cHtmlValidator.messages.map(message => message.type),
            };
         const expected = {
            files:     1,
            path:      'spec/html/invalid.html',
            validates: false,
            messages:  ['info', 'error'],
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      stream.on('data', (file) => analyzedFiles.invalid.push(file));
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The analyzer() ignoreMessages option', () => {

   it('allows a RegEx to skip unwanted messages', (done) => {
      const vinylOptions = {
         path:     'spec/html/invalid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/invalid.html'),
         };
      const mockFile = new Vinyl(vinylOptions);
      const ignore = /^Element .blockquote. not allowed as child of element/;
      const stream = htmlValidator.analyzer({ ignoreMessages: ignore });
      const files = [];
      const handleEndOfStream = () => {
         const actual = {
            files:     files.length,
            path:      files[0].path,
            validates: files[0].w3cHtmlValidator.validates,
            messages:  files[0].w3cHtmlValidator.messages.map(message => message.type),
            };
         const expected = {
            files:     1,
            path:      'spec/html/invalid.html',
            validates: false,
            messages:  ['info'],
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      stream.on('data', (file) => files.push(file));
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The gulp-w3c-html-validator reporter()', () => {

   it('passes an HTML file', (done) => {
      const vinylOptions = {
         path:     'spec/html/valid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/valid.html')
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.reporter();
      const files = [];
      const handleEndOfStream = () => {
         const actual = {
            files:     files.length,
            path:      files[0].path,
            };
         const expected = {
            files:     1,
            path:      'spec/html/valid.html',
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      stream.on('data', (file) => files.push(file));
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   it('displays validation messages for an invalid HTML file', (done) => {
      const spy = sinon.spy(process.stdout, 'write');
      const vinylOptions = {
         path:     'spec/html/invalid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/invalid.html'),
         w3cHtmlValidator: analyzedFiles.invalid[0].w3cHtmlValidator,
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.reporter({ maxMessageLen: 80 });
      const files = [];
      const handleEndOfStream = () => {
         // To view raw output: console.log(spy.secondCall.args);
         spy.restore();
         const headerLine =  /spec\/html\/invalid.html.*validation:.*fail \(messages: 2\)/;
         const warningLine = /HTML warning:/;
         const errorLine =   /HTML error:/;
         const actual = {
            files: files.length,
            path:  files[0].path,
            lines: {
               header:  spy.calledWith(sinon.match(headerLine)),
               warning: spy.calledWith(sinon.match(warningLine)),
               error:   spy.calledWith(sinon.match(errorLine)),
               },
            };
         const expected = {
            files:     1,
            path:      'spec/html/invalid.html',
            lines: {
               header:  true,
               warning: true,
               error:   true,
               },
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      stream.on('data', (file) => files.push(file));
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   });
