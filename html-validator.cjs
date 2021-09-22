// gulp-w3c-html-validator
// Gulp plugin to validate HTML using the W3C Markup Validation Service
// https://github.com/center-key/gulp-w3c-html-validator
// MIT License

// Imports
const PluginError = require('plugin-error');
const through2 = require('through2');
const { w3cHtmlValidator } = require('w3c-html-validator');

// Setup
const pluginName = 'gulp-w3c-html-validator';

// Gulp plugin
const htmlValidator = {
    analyzer(options) {
        const validate = (file, encoding, done) => {
            const handleValidation = results => {
                file.w3cHtmlValidator = results;
                done(null, file);
            };
            const validatorOptions = { ...options, ...{ html: file.contents.toString() } };
            if (file.isNull()) done(null, file);
            else if (file.isStream()) done(new PluginError(pluginName, 'Streaming not supported'));
            else w3cHtmlValidator.validate(validatorOptions).then(handleValidation);
        };
        return through2.obj(validate);
    },

    reporter(options) {
        const defaults = { maxMessageLen: null, throwErrors: false };
        const settings = { ...defaults, ...options };
        const report = (file, encoding, done) => {
            const options = { title: file.path, maxMessageLen: settings.maxMessageLen };
            if (file.w3cHtmlValidator) w3cHtmlValidator.reporter(file.w3cHtmlValidator, options);
            done(null, file);
            if (settings.throwErrors && file.w3cHtmlValidator && !file.w3cHtmlValidator.validates)
                throw new PluginError(pluginName, 'HTML validation failed');
        };
        return through2.obj(report);
    }
};

module.exports.htmlValidator = htmlValidator;
