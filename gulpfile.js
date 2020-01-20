const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');

const STATIC_ASSET_DIRS = ['fonts', 'icons', 'views'];

// configure sass compiler
sass.compiler = require('node-sass');

// configure typescript compiler
const tsProject = ts.createProject('tsconfig.json');

// build sass
function buildSass() {
    return gulp.src('app/assets/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist/assets/css'));
}

// lint typescript
function lint() {
    return gulp.src('app/src/**/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
}

// build typescript
function buildTypescript() {
    return gulp.src('app/src/**/*')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/src'));
}

// link static assets to directory
const linkStaticAssets = (() => {
    const pipelines = [];
    for (const dir of STATIC_ASSET_DIRS) {
        const pipeline = () => {
            return gulp.src(`app/assets/${dir}/*`)
                .pipe(gulp.symlink(`dist/assets/${dir}`, {
                    override: false
                }))
        };

        // set function name to something that makes sense in the output
        Object.defineProperty(pipeline, 'name', {
            value: 'linkStatic' + dir.charAt(0).toUpperCase() + dir.substr(1),
            configurable: true
        });

        pipelines.push(pipeline);
    }
    return gulp.parallel(...pipelines);
})();

// build pipeline
const build = gulp.parallel(
    linkStaticAssets,
    buildSass,
    gulp.series(
        lint,
        buildTypescript
    )
);

// export tasks
exports.default = build;
exports.build = build;
exports.buildSass = buildSass;
exports.buildTypescript = buildTypescript;
exports.linkStaticAssets = linkStaticAssets;
exports.lint = lint;
