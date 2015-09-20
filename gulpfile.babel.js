import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack from 'webpack';
import postcss from 'gulp-postcss';
import precss from 'precss';
import autoprefixer from 'autoprefixer';
import minmax from 'postcss-media-minmax';
import postcssNeat from 'postcss-neat';
import cssnano from 'cssnano';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(__dirname, '../../../../.env')})
dotenv.load();

const bS = browserSync.create();

let DEV_ENV = 'dev';
const paths = {
  css: ['assets/styles/*.css', 'assets/styles/**/*.css'],
  scripts: ['assets/scripts/*.jsx', 'assets/scripts/*.js'],
};


gulp.task('css', function () {
    var processors = [
      cssnano({autoprefixer: false, sourcemap: true}),
      autoprefixer({browsers: ['> 1%','IE 9','IE 10','Firefox >= 10']}),
      precss,
      minmax,
      postcssNeat({neatMaxWidth: '80em'})
    ];
    return gulp.src('assets/styles/main.css')
      .pipe(sourcemaps.init())
      .pipe(postcss(processors))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      .pipe(bS.stream());
});


gulp.task("webpack", function(callback) {
    // run webpack
    webpack({
      watch: false,
      devtool: "source-map",
      entry: "./assets/scripts/main.js",
      output: {
        path: 'dist/',
        filename: 'bundle.js'
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
    });
});

let copyFiles = () =>{
  return gulp.src('assets/scripts/modernizr.js')
    .pipe(gulp.dest('dist'));
}

gulp.task("default",["serve"]);
gulp.task("serve", () =>{
  bS.init({
    proxy: process.env.WP_HOME
  });
  gulp.watch(paths.css,["css"])
  gulp.watch(paths.scripts,["webpack"])
  copyFiles();
});

gulp.task("build", () =>{
  DEV_ENV = 'production';
  copyFiles();
  gulp.start(['webpack','css']);
});
