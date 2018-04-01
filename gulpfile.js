function isProduction() {
    return Boolean(process.env.NODE_ENV === 'production')
}
// Add our dependencies
var gulp = require('gulp'), // Main Gulp module
    concat = require('gulp-concat'), // Gulp File concatenation plugin
    path = require('path'), // path module
    sass = require('gulp-sass'), // SASS styles
    open = require('gulp-open'), // Gulp browser opening plugin
    cleanCSS = require('gulp-clean-css'), // Minify CSS
    CacheBuster = require('gulp-cachebust'), // Add hash to CSS & filenames
    preprocess = require('gulp-preprocess'), // Process env variables
    connect = require('gulp-connect'), // Gulp Web server runner plugin
    del = require('del'); // Deletes folders and files

var cachebust = new CacheBuster();

// Configuration
var configuration = {
    paths: {
        src: {
            html: './src/*.html',
            css: [
                './src/css/*.*css'
            ],
            image: './src/image/*',
            icons: './src/favicon*',
        },
        dist: './dist'
    },
    localServer: {
        port: 8001,
        url: 'http://localhost:8001/'
    }
};

// Gulp task to copy HTML files to output directory
gulp.task('html', function() {
    gulp.src(configuration.paths.src.html)
        .pipe(preprocess({ context: { env: process.env.NODE_ENV || 'production' }}))
        .pipe(gulp.dest(configuration.paths.dist))
        .pipe(connect.reload());
});

// Gulp task to concatenate our css files
gulp.task('css', function () {
   var stream = gulp.src(configuration.paths.src.css)
       .pipe(sass().on('error', sass.logError))
       .pipe(concat('style.css'))

    if (isProduction()) {
        stream = stream.pipe(cleanCSS())
            .pipe(cachebust.resources())
    }

    stream = stream.pipe(gulp.dest(configuration.paths.dist + '/css'))
        .pipe(connect.reload());

    return stream
});

gulp.task('ico', function() {
    var cachebust = new CacheBuster({
        pathFormatter: function(dirname, basename, extname, checksum) {
            return path.join(dirname, basename + extname + '?' + checksum);
        },
    });
    gulp.src(configuration.paths.src.icons)
        .pipe(cachebust.resources())
        .pipe(gulp.dest(configuration.paths.dist))
})

// Gulp task to create a web server
gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        port: configuration.localServer.port,
        livereload: true
    });
});

// Gulp task to open the default web browser
gulp.task('open', function(){
    gulp.src('dist/index.html')
        .pipe(open({uri: configuration.localServer.url}));
});


// Copy static assets
gulp.task('copy', function() {
    gulp.src(configuration.paths.src.image)
        .pipe(gulp.dest(configuration.paths.dist + '/image'))
})

// Watch the file system and reload the website automatically
gulp.task('watch', function () {
    gulp.watch(configuration.paths.src.html, ['html']);
    gulp.watch(configuration.paths.src.css, ['css']);
});

// Clean dist folder when building for production
gulp.task('clean', function() {
    return del([
        'dist/*'
    ])
})

// Gulp default task
gulp.task('default', ['html', 'css', 'copy', 'connect', 'open', 'watch']);
gulp.task('build', ['clean', 'ico', 'html', 'css', 'copy'])
