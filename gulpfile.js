var gulp = require('gulp'),
    browserify = require('browserify'),
    through2 = require('through2'),
    spawn = require('child_process').spawn,
    node;

gulp.task('build', function () {
    return gulp.src('./Client/Main.js')
        .pipe(through2.obj(function (file, enc, next) {
            browserify(file.path, { debug: process.env.NODE_ENV === 'development' })
                .transform(require('babelify'))
                .bundle(function (err, res) {
                    if (err) { return next(err); }

                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function (error) {
            console.log(error.stack);
            this.emit('end');
        })
        .pipe(require('gulp-rename')('main.js'))
        .pipe(gulp.dest('/srv/http/public/dumtard/test/games/Reborn/js'));
});

gulp.task('server', function() {
    if (node) {
        node.kill();
    }

    node = spawn('node', ['./Server/Main.js']);
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('watch', function() {
    gulp.watch(['./Client/**/*.js', './Shared/**/*.js'], ['build']);
    gulp.watch(['./Server/**/*.js'], ['server']);
});

gulp.task('default', ['server', 'watch']);

process.on('exit', function() {
    if (node) {
        node.kill();
    }
});
