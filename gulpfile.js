var gulp      = require('gulp');
var $         = require('gulp-load-plugins')(); // Loads plugins from package.json file
var panini    = require('panini'); // Compiles HTML, HBS files
var browser   = require('browser-sync'); // Creates server
var rimraf    = require('rimraf'); // Deletes files and folders
var sequence  = require('run-sequence');

// Assets Path
var PATHS = {
  assets: [
    'app/assets/**/*',
    '!app/assets/{js,scss}/**/*'
  ],
  sass: [
    'node_modules/bootstrap-sass/assets/stylesheets',
    'app/assets/scss/*'
  ],
  js: [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
    'app/assets/js/**/!(app).js',
    'app/assets/js/app.js'
  ]
}


// ---------------------------------------
// Pre-build

// Deletes "dist" folder. Runs every time build starts.
gulp.task('clean', function(done) {
  rimraf('dist', done);
});

gulp.task('reload', function() {
  browser.reload();
});

gulp.task('copy', function(){
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest('dist/assets'));
}); 


// ---------------------------------------
// Compiles

// Compile CSS
gulp.task('sass', function() {
  // Concat >> Autoprefix >> Minify
  return gulp.src('app/assets/scss/app.scss')
    .pipe($.sass({
      includePaths: PATHS.sass
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe($.cssnano())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(browser.reload({
      stream: true
    }));
});

// Compile JS
gulp.task('js', function() {
  return gulp.src(PATHS.js)
    .pipe($.concat('app.js'))
    // .pipe($.uglify())
    .pipe(gulp.dest('dist/assets/js'))
});

// Compile Pages
gulp.task('pages', function() {
  return gulp.src('app/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'app/pages/',
      layouts: 'app/layouts/',
      partials: 'app/partials/',
      data: 'app/data/',
      helpers: 'app/helpers/'
    }))
    .pipe(gulp.dest('dist'));
});

// Minify Images and copy
gulp.task('images', function() {
  return gulp.src('app/assets/img/**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest('dist/assets/img'));
});

// ----------------------------------
// Build commands

gulp.task('pages:reset', function() {
  panini.refresh();
});

gulp.task('build', function() {
  sequence('clean', ['pages', 'sass', 'js', 'images', 'copy']);
});

// Start a server with LiveReload to preview the site in
gulp.task('server', ['build'], function() {
  browser.init({
    server: 'dist',
    port: 8000
  })
});

gulp.task('default', ['build', 'server'], function() {
  gulp.watch(PATHS.assets, ['copy', 'reload']);
  gulp.watch(['app/pages/**/*.html'], ['pages', 'reload']);
  gulp.watch(['app/{layouts,partials,data,helpers}/**/*.html'], ['pages:reset', 'pages', 'reload']);
  gulp.watch(['app/assets/scss/**/*.scss'], ['sass', 'reload']);
  gulp.watch(['app/assets/js/**/*.js'], ['js', 'reload']);
  gulp.watch(['app/assets/img/**/*'], ['images', 'reload']);
});