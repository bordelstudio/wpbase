import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack from 'webpack';
import postcss from 'gulp-postcss';
import precss from 'precss';
import autoprefixer from 'autoprefixer';
import minmax from 'postcss-media-minmax';
import postcss-neat from 'postcss-neat';

const paths = {
  css: ['assets/styles/*.css', 'assets/styles/**/*.css'],
  scripts: ['assets/scripts/*.jsx', 'assets/scripts/*.js'],
};


gulp.task('css', function () {
    var processors = [
      autoprefixer({browsers: ['> 1%','IE 9','IE 10']}),
      precss,
      postcss-neat,
      minmax
    ];
    return gulp.src('assets/styles/main.css').pipe(
        postcss(processors)
    ).pipe(
        gulp.dest('dist/')
    );
});


gulp.task("webpack", function(callback) {
    // run webpack
    webpack({
      watch: false,
      entry: "./assets/scripts/main.js",
      output: {
        path: 'dist/',
        filename: 'bundle.js'
      },
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
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});


gulp.task("serve", () =>{
  gulp.watch(paths.css,["css"])
  gulp.watch(paths.scripts,["webpack"])
});
