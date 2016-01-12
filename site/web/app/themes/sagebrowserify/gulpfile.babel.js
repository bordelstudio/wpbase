import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack from 'webpack';
import postcss from 'gulp-postcss';
import atImport from 'postcss-import';
import postNested from 'postcss-nested';
import autoprefixer from 'autoprefixer';
import minmax from 'postcss-media-minmax';
import cssTriangle from 'postcss-triangle';
import rucksack from 'rucksack-css';
import cssCentering from 'postcss-center';
import pixrem from 'pixrem';
import cssnext from 'cssnext';
import simpleExtend from 'postcss-extend';
// import lost from 'lost';
import grid from 'postcss-grid';

import cssnano from 'cssnano';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import plumber from 'gulp-plumber'
import notify from 'gulp-notify';
import postCssSimpleVariables from 'postcss-simple-vars';

dotenv.config({path: path.resolve(__dirname, '../../../../.env')})
dotenv.load();

const bS = browserSync.create();

let DEV_ENV = 'dev';
const paths = {
  css: ['assets/styles/*.css', 'assets/styles/**/*.css'],
  scripts: ['assets/scripts/*.jsx', 'assets/scripts/*.js'],
};

const onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

gulp.task('css', function () {
    var processors = [
      atImport(),
      simpleExtend(),
      cssnext(),
      grid({
        columns: 12, // the number of columns in the grid
        maxWidth: 960, // the maximum width of the grid (in px)
        gutter: 0, // the width of the gutter (in px)
        legacy: false // fixes the double-margin bug in older browsers. Defaults to false
      }),
      postCssSimpleVariables(),
      minmax(),
      postNested(),
      cssCentering(),
      rucksack(),
      cssTriangle(),
      autoprefixer({browsers: ['> 1%','IE 9','IE 10','Firefox >= 10']}),
      cssnano({autoprefixer: false, sourcemap: true, convertValues: {length: false}})
    ];
    return gulp.src('assets/styles/main.css')
      .pipe(plumber({errorHagstndler: onError}))
      .pipe(sourcemaps.init())
      .pipe(postcss(processors))
      .on("error",onError)
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      .pipe(notify('Compiled CSS'))
      .pipe(bS.stream());
});


gulp.task("webpack", function(callback) {
    // run webpack
    let plugins = [
      new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "window.jQuery": "jquery"
      })
    ];
    if(DEV_ENV === 'production')
      plugins.push(new webpack.optimize.UglifyJsPlugin({mangle: false, compress: false}))
    webpack({
      watch: false,
      devtool: "source-map",
      entry: "./assets/scripts/main.js",
      output: {
        path: 'dist/',
        filename: 'bundle.js'
      },
      resolve:{
        modulesDirectories:[
          'node_modules',
          'vendor'
        ]
      },
      externals: {
        'TweenLite': 'TweenLite'
      },
      plugins: (DEV_ENV === 'production') ? [new webpack.optimize.UglifyJsPlugin()] : [],
      module:{
        loaders:[
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components|dist)/,
            loader: 'babel'
          }
        ]
      }
        // configuration
    }, (err, stats) => {
        bS.reload();
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
        notify('Compiled JS');
    });
});

let copyFiles = () =>{
  return gulp.src('assets/vendors/**.*')
    .pipe(gulp.dest('dist'))
    .pipe(notify('Copied Files'));
}

gulp.task("copyFiles", function(callback) {
  return copyFiles()
});


let remtopx = () =>{
  let css = fs.readFileSync('dist/main.css', 'utf8');
  let processedCss = pixrem.process(css, '200%');
  fs.writeFile("dist/main.css", processedCss, ()=>{
    if (err) {
      throw err;
    }
    console.log('Compiles REM to PX');
  });
}

gulp.task("default",["serve"]);

gulp.task("serve",['copyFiles','css','webpack'],() =>{
  bS.init({
    proxy: process.env.WP_HOME
  });
  gulp.watch(paths.css,["css"])
  gulp.watch(paths.scripts,["webpack"])
  // copyFiles();
});

gulp.task("build",['copyFiles'],(done) =>{
  DEV_ENV = 'production';
  // copyFiles();
  gulp.start(['webpack','css'],(err)=>{
    done();
  });
});
