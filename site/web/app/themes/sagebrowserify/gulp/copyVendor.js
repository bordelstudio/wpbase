

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let dest = path.join(taskTarget);

  gulp.task("copyVendor", function(callback) {
    return gulp.src('assets/vendors/**.*')
      .pipe(gulp.dest('dist'))
      .pipe(notify('Copied Files'));
  });
}
