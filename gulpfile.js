var gulp = require('gulp');
var bower = require('gulp-bower');
var connect = require('gulp-connect');
var vendor = require('gulp-concat-vendor');
var karma = require('karma').server;
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');


gulp.task('jshint', function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('dist', function() {
    return gulp.src(['./app/assets/js/vendor.js','./app/**/*.js'])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest('lib/'));
});

gulp.task('serve', ['vendor'], function() {
    connect.server({
        root: 'app',
        port: 8000,
        livereload: true
    });
    watch('app/**/*.*', function () {
        console.log('reload');
        connect.reload();
    });
});

gulp.task('test',['jshint'], function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('vendor', function() {
    gulp.src('./bower_components/*')
        .pipe(vendor('vendor.js'))
        .pipe(gulp.dest('./app/assets/js/'));  
});
