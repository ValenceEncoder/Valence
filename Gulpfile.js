const gulp         = require('gulp');
const sass         = require('gulp-sass');
const sourcemaps   = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const uglifycss    = require('gulp-uglifycss');
const runsequence  = require('run-sequence');
const rename       = require('gulp-rename');
const ts           = require('gulp-typescript');
const tsProject    = ts.createProject('tsconfig.json');
const copy         = require('gulp-copy');
const json         = require('gulp-json-modify');
const install      = require('gulp-install');
const clean        = require('gulp-clean');

const sass_src   = 'src/materialize/sass/**/*.scss';
const picker_src = 'src/materialize/picker.js';
const css_src    = 'src/css';
const img_src    = 'src/img/**/*';
const views_src  = 'src/views/**/*.html';
const html_src   = 'index.html';
const appts_src  = 'App.ts';
const ts_src     = 'src/**/*.ts';

const logo_src   = 'logo/*.{ico,icns,png}';
const font_src   = 'src/fonts/**/*';
const config_src = 'config/*.*';
const ffmpeg_src = 'ffmpeg/**/*';
const dist       = 'dist';

const src_output    = `${dist}/src`;
const picker_output = `${dist}/materialize`;
const font_output   = `${src_output}/fonts`;
const img_output    = `${src_output}/img`;
const views_output  = `${src_output}/views`;
const html_output   = dist;
const config_output = `${dist}/config`;
const ffmpeg_output = `${dist}/ffmpeg`;
const css_output    = `${css_src}/materialize.css`;
const sassOptions   = {
    errLogToConsole: true,
    outputStyle    : 'expanded'
};

let pkg  = require('./package.json');
pkg.main = "./src/App.js";

gulp.task('sass-compile', function () {
    return gulp.src(sass_src)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        .pipe(rename({
            dirname : "/",
            basename: "materialize",
            extname : ".css"
        }))
        .pipe(gulp.dest(css_src))
        ;
});

gulp.task('copy-config', function () {
    return gulp.src(config_src)
        .pipe(gulp.dest(config_output));
});

gulp.task('install', function () {
    gulp.src(['./dist/package.json'])
        .pipe(install({
            npm: '--production'
        }));
})

gulp.task('copy-fonts', function () {
    return gulp.src(font_src)
        .pipe(gulp.dest(font_output));
});

gulp.task('copy-picker', function () {
    return gulp.src(picker_src)
        .pipe(gulp.dest(picker_output));
});

gulp.task('copy-img', function () {
    return gulp.src(img_src)
        .pipe(gulp.dest(img_output));
});
gulp.task('copy-views', function () {
    return gulp.src(views_src)
        .pipe(gulp.dest(views_output));
});

gulp.task('copy-index.html', function () {
    return gulp.src(html_src)
        .pipe(gulp.dest(html_output));
});

gulp.task('copy-package', function () {
    return gulp.src(['./bower.json', './package.json'])
        .pipe(json({
            key  : 'main',
            value: `App.js`
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('copy-ffmpeg', function () {
    return gulp.src(ffmpeg_src)
        .pipe(gulp.dest(ffmpeg_output));
});

gulp.task('copy-App.ts', function () {
    return gulp.src(appts_src)
        .pipe(gulp.dest(dist));
});

gulp.task('typescript', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest(dist));
});

gulp.task('copy-ts', function () {
    return gulp.src(ts_src)
        .pipe(gulp.dest(src_output));
});

gulp.task('watch', function () {
    return gulp
        .watch(sass_src, ['sass'])
        .on('change', function (event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
});

gulp.task('css-min', function () {
    return gulp.src(css_output)
        .pipe(rename("materialize.min.css"))
        .pipe(uglifycss({
            "uglyComments": true,
            "maxLineLen"  : 0
        }))
        .pipe(gulp.dest(css_src))
});

gulp.task('css-min-dist', function () {
    return gulp.src(css_output)
        .pipe(rename("materialize.min.css"))
        .pipe(uglifycss({
            "uglyComments": true,
            "maxLineLen"  : 0
        }))
        .pipe(gulp.dest(`${dist}/${css_src}`));
});

gulp.task('copy', [
    'copy-App.ts',
    'copy-ts',
    'copy-config',
    'copy-package',
    'copy-ffmpeg',
    'copy-fonts',
    'copy-img',
    'copy-views',
    'copy-index.html',
    'copy-picker'
]);

gulp.task('clean', function () {
    return gulp.src(`${dist}/**/*`, {read: false})
        .pipe(clean());
});

gulp.task('sass', function (end) {
    runsequence('sass-compile', 'css-min', end);
});

gulp.task('dist', ['sass-build', 'copy']);

gulp.task('prepackage', function (end) {
    runsequence('dist', 'install', end);
});

gulp.task('sass-build', function (end) {
    runsequence('sass', 'css-min-dist', end);
});

gulp.task('default', ['prepackage']);
