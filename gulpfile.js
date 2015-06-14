'use strict';

var gulp = require('gulp'),
  angularFilesort = require('gulp-angular-filesort'),
  concat = require('gulp-concat'),
  del = require('del'),
  inject = require('gulp-inject'),
  jshint = require('gulp-jshint'),
  refresh = require('gulp-livereload'),
  lrserver = require('tiny-lr')(),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  q = require('q'),
  wiredep = require('wiredep').stream;

var lrport = 35729;
var serverport = 8080;

var config = {
  bowerFiles: './client/bower_components/**',
  index: './client/index.html',
  jsFiles: ['./client/**/*.js', '!./client/bower_components/**/*', '!./client/**/*.spec.js'],
  htmlFiles: ['./client/**/*.html', '!./client/index.html', '!./client/bower_components/**/*'],
  imageFiles: './client/assets/images/*',
  appSassFile: './client/app/app.scss',
  sassFiles: ['./client/**/*.scss', '!./client/app/app.scss', '!./client/bower_components/**/*'],
  distDev: './dist.dev',
  distProd: './dist.prod',
}

/**
 * Delete everything in the development build folder
 */
gulp.task('cleanDev', function() {
  var deferred = q.defer();

  del(config.distDev, function() {
    deferred.resolve();
  });

  return deferred.promise;
});

/**
 * Delete everything in the production build folder
 */
gulp.task('cleanProd', function() {
  var deferred = q.defer();

  del(config.distDev, function() {
    deferred.resolve();
  });

  return deferred.promise;
});

/**
 * Build for development
 */
gulp.task('buildDev', ['cleanDev'], function() {
  gulp.run(['indexDev', 'htmlDev', 'scriptsDev', 'stylesDev', 'assetsDev', 'vendorDev']);
});

gulp.task('buildProd', ['cleanProd'], function() {

});

gulp.task('scriptsDev', function() {
  return gulp.src(config.jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest(config.distDev))
    .pipe(refresh(lrserver));
});

gulp.task('htmlDev', function() {
  gulp.src(config.htmlFiles)
    .pipe(gulp.dest(config.distDev))
    .pipe(refresh(lrserver));
});

gulp.task('assetsDev', function() {
  gulp.src(config.imageFiles)
    .pipe(gulp.dest(config.distDev + '/assets/images'))
    .pipe(refresh(lrserver));
})

gulp.task('vendorDev', function() {
  gulp.src(config.bowerFiles)
    .pipe(gulp.dest(config.distDev + '/bower_components'));
})

gulp.task('indexDev', function() {
  gulp.src(config.index)
    .pipe(inject(gulp.src(config.jsFiles).pipe(angularFilesort()), {
      relative: true
    }))
    .pipe(wiredep({
      directory: 'client/bower_components',
      exclude: ['bootstrap-sass-official', 'bootstrap.css', 'fontawesome.css']
    }))
    .pipe(gulp.dest(config.distDev))
    .pipe(refresh(lrserver));
});

gulp.task('stylesDev', function() {
  gulp.src(config.appSassFile)
    .pipe(sourcemaps.init())
    .pipe(inject(gulp.src(config.sassFiles, {read: false}), {
      relative: true,
      starttag: '// injector',
      endtag: '// endinjector',
      transform: function (filepath) {
          return '@import \'' + filepath + '\';';
      }}))
    .pipe(sass({
      includePaths: ['./client/bower_components']
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.distDev + '/app'))
    .pipe(refresh(lrserver));
})

gulp.task('serve', ['buildDev'], function() {
  var express = require('express');

  var server = express();
  server.use(require('connect-livereload')({
    port: lrport
  }));
  server.use(express.static(config.bowerFiles));
  server.use(express.static(config.distDev));
  server.listen(serverport);
  lrserver.listen(lrport);

  gulp.watch('client/**/*.scss', ['stylesDev']);
  gulp.watch('client/**/*.html', ['htmlDev']);
  gulp.watch('client/**/*.js', ['scriptsDev']);
});
