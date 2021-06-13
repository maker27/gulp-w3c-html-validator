// gulp-w3c-html-validator
// Gulp plugin to validate HTML using the W3C Markup Validation Service
// https://github.com/center-key/gulp-w3c-html-validator
// MIT License

// Imports
import color from 'ansi-colors';
import PluginError from 'plugin-error';
import log from 'fancy-log';
import through2 from 'through2';
import { w3cHtmlValidator } from 'w3c-html-validator';

// Setup
const pluginName = 'gulp-w3c-html-validator';

// Gulp plugin
const htmlValidator = {

   handleMessages(file) {
      const text = {
         error: color.red.bold('HTML Error:'),
         info:  color.yellow.bold('HTML Warning:'),
         };
      const lines = file.contents.toString().split(/\r\n|\r|\n/g);
      const processMessage = (message) => {
         // Example message object:
         //    {
         //       type:         'error',
         //       message:      'Unclosed element “h1”.',
         //       extract:      '<body>\n   <h1>Specif',
         //       lastLine:     8,
         //       firstColumn:  4,
         //       lastColumn:   7,
         //       hiliteStart:  10,
         //       hiliteLength: 4,
         //    }
         // See: https://github.com/validator/validator/wiki/Output-»-JSON#example
         const type = text[message.type] || color.cyan.bold('HTML Comment:');
         const line = message.lastLine || 0;
         const column = message.lastColumn || 0;
         const location = 'Line ' + line + ', Column ' + column + ':';
         let erroredLine = lines[line - 1];
         let errorColumn = message.lastColumn;
         const trimErrorLength = () => {
            erroredLine = erroredLine.slice(errorColumn - 50);
            errorColumn = 50;
            };
         const formatErroredLine = () => {
            if (errorColumn > 60)
               trimErrorLength();
            erroredLine = erroredLine.slice(0, 60);  //trim after so the line is not too long
            erroredLine =  //highlight character with error
               color.gray(erroredLine.substring(0, errorColumn - 1)) +
               color.red.bold(erroredLine[errorColumn - 1]) +
               color.gray(erroredLine.substring(errorColumn));
            };
         if (erroredLine)  //if false, stream was changed since validation
            formatErroredLine();
         if (typeof message.lastLine !== 'undefined' || typeof lastColumn !== 'undefined')
            log(type, file.relative, location, message.message);
         else
            log(type, file.relative, message.message);
         if (erroredLine)
            log(erroredLine);
         };
      if (!file.validationResults || !Array.isArray(file.validationResults.messages))
         log(text.warning, 'Failed to run validation on', file.relative);
      else
         file.validationResults.messages.forEach(processMessage);
      },

   analyzer(options) {
      const defaults = { proxy: null, skipWarnings: false, url: null, verifyMessage: null };
      const settings = { ...defaults, ...options };
      if (settings.proxy)
         throw Error('The "proxy" option is not supported at this time.');
      const transform = (file, encoding, done) => {
         const handleValidation = (results) => {
            const worthy = (message) => !(settings.skipWarnings && message.type === 'info') &&
               !(settings.verifyMessage && !settings.verifyMessage(message.type, message.message));
            const filteredMessages = results.messages.filter(worthy);
            file.validationResults = {
               success:    !filteredMessages.length,
               messages:   filteredMessages,
               unfiltered: results.messages,
               };
            htmlValidator.handleMessages(file);
            done(null, file);
            };
         const validatorOptions = { html: file.contents };
         if (typeof settings.url === 'string')
            validatorOptions.checkUrl = settings.url;
         if (file.isNull())
            done(null, file);
         else if (file.isStream())
            done(new PluginError(pluginName, 'Streaming not supported'));
         else
            w3cHtmlValidator.validate({ html: file.contents }).then(handleValidation);
         };
      return through2.obj(transform);
      },

   reporter() {
      const transform = (file, encoding, done) => {
         done(null, file);
         if (file.validationResults && !file.validationResults.success)
            throw new PluginError(pluginName, 'HTML validation failed');
         };
      return through2.obj(transform);
      },

   };

export { htmlValidator };
