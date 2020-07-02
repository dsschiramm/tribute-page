const { src, dest, series, watch, parallel } = require('gulp');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const assets = require('postcss-assets');
const sourcemaps = require('gulp-sourcemaps');
const gulpClean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const environments = require('gulp-environments');
const CacheBuster = require('gulp-cachebust');
const gulpSass = require('gulp-sass');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cachebust = new CacheBuster({ random: true });

function clean() {
	if (environments.production()) {
		return src('build', { read: false, allowEmpty: true }).pipe(gulpClean());
	}

	return src('./src/css/generated', { read: false, allowEmpty: true }).pipe(gulpClean());
}

function images() {
	return src('./src/images/**/*')
		.pipe(imagemin([imagemin.mozjpeg({ progressive: true })]))
		.pipe(cachebust.resources())
		.pipe(dest('build/images'));
}

function sass() {
	gulpSass.compiler = require('node-sass');

	return src('./src/sass/**/*.scss')
		.pipe(gulpSass.sync().on('error', gulpSass.logError))
		.pipe(concat('styles.css'))
		.pipe(dest('./src/css/generated'));
}

function css() {
	const plugins = [assets({ loadPaths: ['./src/images/'] }), autoprefixer(), cssnano()];

	return src(['./src/css/generated/*.css', './src/css/*.css'])
		.pipe(environments.development(sourcemaps.init()))
		.pipe(concat('app.min.css'))
		.pipe(postcss(plugins))
		.pipe(environments.development(sourcemaps.write('.')))
		.pipe(cachebust.references())
		.pipe(cachebust.resources())
		.pipe(dest('build/css'));
}

function scripts() {
	return src('./src/scripts/**/*.js', { sourcemaps: true })
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(cachebust.references())
		.pipe(cachebust.resources())
		.pipe(dest('build/scripts'));
}

function html() {
	return src('./src/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(cachebust.references())
		.pipe(dest('build'));
}

if (environments.production()) {
	exports.default = series(clean, images, sass, css, scripts, html);
} else {
	const connect = require('gulp-connect');

	function server() {
		connect.server({
			root: 'build',
			livereload: true,
		});
	}

	function watchTask() {
		watch(
			['./src/sass/**/*.scss', './src/css/*.css', './src/scripts/**/*.js', './src/*.html'],
			series(clean, sass, css, scripts, html)
		);
	}

	exports.default = series(clean, images, sass, css, scripts, html, parallel(server, watchTask));
}
