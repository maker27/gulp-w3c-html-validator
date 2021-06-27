# gulp-w3c-html-validator
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Gulp plugin to validate HTML using the W3C Markup Validation Service_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/gulp-w3c-html-validator/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/gulp-w3c-html-validator.svg)](https://www.npmjs.com/package/gulp-w3c-html-validator)
[![Vulnerabilities](https://snyk.io/test/github/center-key/gulp-w3c-html-validator/badge.svg)](https://snyk.io/test/github/center-key/gulp-w3c-html-validator)
[![Build](https://github.com/center-key/gulp-w3c-html-validator/workflows/build/badge.svg)](https://github.com/center-key/gulp-w3c-html-validator/actions?query=workflow%3Abuild)

This Gulp plugin is a wrapper for [w3c-html-validator](https://github.com/center-key/w3c-html-validator) (_"A package for testing HTML files or URLs against the W3C validator"_)

<img src=https://raw.githubusercontent.com/center-key/gulp-w3c-html-validator/main/screenshot.png alt=screenshot>

## 1) Setup
Install module into your project:
```shell
$ npm install --save-dev gulp-w3c-html-validator
```

## 2) Define Task
Create a task in your **gulpfile.js**:
```javascript
// Imports
import gulp from 'gulp';
import { htmlValidator } from 'gulp-w3c-html-validator';

// Tasks
const task = {
   validateHtml() {
      return gulp.src('target/**/*.html')
         .pipe(htmlValidator.analyzer())
         .pipe(htmlValidator.reporter());
      },
   };

// Gulp
gulp.task('validate-html', task.validateHtml);
```

## 3) Options
### analyzer()
| Name (key)       | Type                    | Default                          | Description                                                          |
| :--------------- | :---------------------- | :------------------------------- | :------------------------------------------------------------------- |
| `checkUrl`       | **string**              | `'https://validator.w3.org/nu/'` | W3C validation API endpoint.                                         |
| `ignoreLevel`    | `'info'` or `'warning'` | `null`                           | Skip unwanted messages.*                                             |
| `ignoreMessages` | **string** or **regex** | `null`                           | Skip messages containing a string or matching a regular expression.* |

*The `ignoreMessages` and `ignoreLevel` options only work for `'json'` output.&nbsp;
Option value `'warning'` also skips `'info'`.

Example usage of `ignoreMessages` option:
```javascript
// Tasks
const task = {
   validateHtml() {
      return gulp.src('target/**/*.html')
         .pipe(htmlValidator.analyzer({ ignoreMessages: /^Duplicate ID/ }))
         .pipe(htmlValidator.reporter());
      },
   };
```

### reporter()
| Name (key)      | Type        | Default | Description                                                                           |
| --------------- | ----------- | --------| ------------------------------------------------------------------------------------- |
| `maxMessageLen` | **number**  | `null`  | Trim validation messages to not exceed a maximum length.                              |
| `throwErrors`   | **boolean** | `false` | Throw an [error](https://github.com/gulpjs/plugin-error) for HTTP validation failure. |

## 4) Custom Reporting
The `analyzer()` adds the validation results onto each file object in the `w3cHtmlValidator` field,
which contains a `validates` (**boolean**) field and a `messages` (**array**) field.

### Example usage
```javascript
// Import
import { htmlValidator } from 'gulp-w3c-html-validator';
import through2 from 'through2';

// Tasks
const task = {
   validateHtml() {
      const handleFile = (file, encoding, callback) => {
         callback(null, file);
         if (!file.w3cHtmlValidator.validates)
            throw Error('HTML failed validation');
         };
      return gulp.src('target/**/*.html')
         .pipe(htmlValidator.analyzer())
         .pipe(through2.obj(handleFile));  //custom reporter
      },
   };

// Gulp
gulp.task('validate-html', task.validateHtml);
```

## 5) Deprecated CommonJS (gulp-w3c-html-validator v2.0)
If your build system is using `require()` statements for CommonJS modules, install the older v2.0:
```shell
$ npm install --save-dev gulp-w3c-html-validator@2.0
```
Create a task in your **gulpfile.js**:
```javascript
// Imports
import gulp from 'gulp';
import { htmlValidator } from 'gulp-w3c-html-validator';

// Tasks
const task = {
   validateHtml() {
      return gulp.src('target/**/*.html')
         .pipe(htmlValidator())  //note: v2.0 does not use analyzer()
         .pipe(htmlValidator.reporter());
      },
   };

// Gulp
gulp.task('validate-html', task.validateHtml);
```

---
[MIT License](LICENSE.txt)
