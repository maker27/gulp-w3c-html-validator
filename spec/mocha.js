// Mocha Specification Cases

// Imports
import { readdirSync, readFileSync } from 'fs';
import should from 'should';
import Vinyl from 'vinyl';

// Plugin
import { htmlValidator } from '../html-validator.js';
console.log('  Input HTML files for validation:');
readdirSync('spec/html').forEach(file => console.log('    spec/html/' + file));

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The gulp-w3c-html-validator plugin', () => {

   it('passes a valid file', (done) => {
      const count = { files: 0 };
      const vinylOptions = {
         path:     'spec/html/valid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/valid.html')
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.analyzer();
      const handleFileFromStream = (file) => {
         should.exist(file);
         file.validationResults.success.should.equal(true);
         file.validationResults.messages.length.should.equal(0);
         file.validationResults.unfiltered.length.should.equal(0);
         should.exist(file.path);
         should.exist(file.relative);
         should.exist(file.contents);
         file.path.should.equal('spec/html/valid.html');
         file.relative.should.equal('valid.html');
         count.files++;
         };
      const handleEndOfStream = () => {
         count.files.should.equal(1);
         done();
         };
      stream.on('data', handleFileFromStream);
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   it('reports errors and warnings for an invalid file', (done) => {
      const count = { files: 0 };
      const vinylOptions = {
         path:     'spec/html/invalid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/invalid.html')
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.analyzer();
      const handleFileFromStream = (file) => {
         should.exist(file);
         file.validationResults.success.should.equal(false);
         file.validationResults.messages.filter(message => message.type === 'error').length.should.equal(1);
         file.validationResults.messages.filter(message => message.type === 'info').length.should.equal(1);
         file.validationResults.unfiltered.length.should.equal(2);
         should.exist(file.path);
         should.exist(file.relative);
         should.exist(file.contents);
         file.path.should.equal('spec/html/invalid.html');
         file.relative.should.equal('invalid.html');
         count.files++;
         };
      const handleEndOfStream = () => {
         count.files.should.equal(1);
         done();
         };
      stream.on('data', handleFileFromStream);
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The verifyMessage option', () => {

   it('allows a custom error to be ignored', (done) => {
      const count = { files: 0 };
      const vinylOptions = {
         path:     'spec/html/invalid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/invalid.html')
         };
      const mockFile = new Vinyl(vinylOptions);
      const ignore = /^Element .blockquote. not allowed as child of element/;
      const verifyMessage = (type, message) => !ignore.test(message);
      const stream = htmlValidator.analyzer({ verifyMessage: verifyMessage, skipWarnings: true });
      const handleFileFromStream = (file) => {
         should.exist(file);
         file.validationResults.success.should.equal(true);
         file.validationResults.messages.length.should.equal(0);
         file.validationResults.unfiltered.length.should.equal(2);
         count.files++;
         };
      const handleEndOfStream = () => {
         count.files.should.equal(1);
         done();
         };
      stream.on('data', handleFileFromStream);
      stream.once('end', handleEndOfStream);
      stream.write(mockFile);
      stream.end();
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The htmlValidator.reporter() function', () => {

   it('passes files through', () => {
      const vinylOptions = {
         path:     'spec/html/valid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/valid.html')
         };
      const mockFile = new Vinyl(vinylOptions);
      const stream = htmlValidator.reporter();
      stream.write(mockFile);
      stream.end();
      return stream;
      });

   it('contains a reporter by default', () => {
      const vinylOptions = {
         path:     'spec/html/invalid.html',
         cwd:      'spec/',
         base:     'spec/html/',
         contents: readFileSync('spec/html/invalid.html')
         };
      const mockFile = new Vinyl(vinylOptions);
      mockFile.validationResults = {
         success:  false,
         messages: ['HTML is valid']
         };
      const stream = htmlValidator.reporter();
      const writeToStream = () => stream.write(mockFile);
      writeToStream.should.throw(/HTML validation failed/);
      stream.end();
      return stream;
      });

   });
