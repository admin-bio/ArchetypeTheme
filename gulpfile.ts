'use strict';

const autoprefixer = require('gulp-autoprefixer');
const gulp = require('gulp');
const minify = require('gulp-minify');
const run = require('gulp-run');
const sass = require('gulp-sass')(require('sass'));
const sassDoc = require('sassdoc');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');

const sassInput = './src/**/*.scss';

gulp.task('sassDoc', () => gulp.src(sassInput).pipe(sassDoc().resume()));

gulp.task('compileSass', () =>
	gulp
		.src(sassInput)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer())
		.pipe(gulp.dest('./build'))
);

gulp.task('watchStyles', () =>
	gulp
		.watch(sassInput, ['compileSass'])
		.on('change', (e: { path: string; type: string }) =>
			console.log(`File ${e.path} was ${e.type}, running tasks...`)
		)
);

gulp.task('compileProductionStyles', () =>
	gulp
		.src(sassInput)
		.pipe(sass({ outputFormat: 'compressed' }))
		.pipe(autoprefixer())
		.pipe(gulp.dest('./build'))
);

const typescriptInput = './src/**/*.ts';
const typescriptProject = typescript.createProject('tsconfig.json');

gulp.task('compileTypescript', () =>
	gulp
		.src(typescriptInput)
		.pipe(typescriptProject())
		.pipe(gulp.dest('./build'))
);

gulp.task('watchScripts', () =>
	gulp
		.watch(typescriptInput, ['compileTypescript'])
		.on('change', (e: { path: string; type: string }) =>
			console.log(`File ${e.path} was ${e.type}, running tasks...`)
		)
);

gulp.task('compileProductionScripts', () =>
	gulp
		.src(typescriptInput)
		.pipe(typescriptProject())
		.pipe(
			minify({
				ext: { min: '.js' },
				noSource: true,
			})
		)
		.pipe(gulp.dest('./build'))
);

gulp.task('lintStyles', () => run('npm run lint:style').exec());
gulp.task('lintScripts', () => run('npm run lint:js').exec());
gulp.task('lintMarkdown', () => run('npm run lint:md:docs').exec());
gulp.task('lintPkgJson', () => run('npm run lint:pkg-json').exec());

gulp.task(
	'lint',
	gulp.parallel(['lintStyles', 'lintScripts', 'lintMarkdown', 'lintPkgJson'])
);

gulp.task('prebuild', gulp.parallel(['lint']));

gulp.task('watch', gulp.parallel(['watchScripts', 'watchStyles']));

gulp.task(
	'default',
	gulp.parallel(['compileProductionScripts', 'compileProductionStyles'])
);
