var gulp = require('gulp');



gulp.task('build', function(done) {
	done();
});



gulp.task('publish:npm', function(done) {
	require('child_process').spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});



gulp.task('release', ['publish:npm']);