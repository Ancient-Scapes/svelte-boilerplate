'use strict'

/* **************************************************
 *
 * require packages
 *
 * **************************************************/
// general modules
const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const changed = require('gulp-changed')
const plumber = require('gulp-plumber')
const shell = require('gulp-shell')

// sass postcss modules
const sass = require('gulp-sass')
const sassGlob = require('gulp-sass-glob')
const packageImporter = require('node-sass-package-importer')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssMqPacker = require('css-mqpacker')
const flexBugsFixes = require('postcss-flexbugs-fixes')
const cssWring = require('csswring')

// html modules
const pug = require('gulp-pug')
const htmlmin = require('gulp-htmlmin')
const htmlminOptions = {
  removeComments: true
}

// js modules
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

// clean modules
const clean = require('del')

// server modules
const server = require('browser-sync').create()

// lint modules
const puglint = require('gulp-pug-linter')
const stylelint = require('gulp-stylelint')

/* **************************************************
 *
 * general setting
 *
 * **************************************************/
const documentRoot = `${__dirname}`
const developSrcRoot = `${documentRoot}/src`
const distRoot = `${documentRoot}/dist`

const paths = {
  // mainとpagesのみ吐く(pagesはディレクトリ構成を保って吐きたいため、アスタリスク指定)
  sass: {
    src: [
      `${developSrcRoot}/scss/main.scss`,
      `${developSrcRoot}/scss/pages/**/*.scss`
    ],
    dist: `${distRoot}/css/`,
    watch: [
      `${developSrcRoot}/scss/**/*.scss`,
      `${developSrcRoot}/components/**/*.scss`
    ]
  },
  pug: {
    src: [
      `${developSrcRoot}/pug/index.pug`,
      `${developSrcRoot}/pug/pages/**/*.pug`
    ],
    dist: `${distRoot}/`,
    watch: [
      `${developSrcRoot}/pug/**/*.pug`,
      `${developSrcRoot}/components/**/*.pug`
    ]
  },
  js: {
    src: [
      `${developSrcRoot}/js/index.js`
    ],
    dist: `${distRoot}/js`,
    watch: [
      `${developSrcRoot}/js/*.js`,
      `${developSrcRoot}/components/**/*.js`
    ]
  },
  html: {
    src: `${developSrcRoot}/**/*.html`,
    dist: `${distRoot}/`,
    watch: `${developSrcRoot}/**/*.html`
  }
}

/* **************************************************
 *
 * html
 *
 * **************************************************/
gulp.task('html', () => {
  return gulp.src(paths.html.src)
    .pipe(htmlmin(htmlminOptions))
    .pipe(changed(paths.html.dist))
    .pipe(gulp.dest(paths.html.dist))
})

/* **************************************************
 *
 * sass
 *
 * **************************************************/
const sassConfig = {
  sassOption: {
    outputStyle: 'expanded',
    importer: packageImporter({
      extensions: ['.scss', '.css']
    })
  },
  autoprefixerOption: {grid: true},
  postcssOption: [
    cssMqPacker,
    flexBugsFixes,
    autoprefixer(this.autoprefixerOption)
  ],
  postcssOptionRelease: [
    cssMqPacker,
    flexBugsFixes,
    autoprefixer(this.autoprefixerOption),
    cssWring
  ]
}

gulp.task('sass', () => {
  return gulp.src(paths.sass.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass(sassConfig.sassOption))
    .pipe(postcss(sassConfig.postcssOption))
    .pipe(sourcemaps.write())
    .pipe(changed(paths.sass.dist))
    .pipe(gulp.dest(paths.sass.dist))
    .pipe(server.stream())
})

gulp.task('sass:release', () => {
  return gulp.src(paths.sass.src)
    .pipe(sassGlob())
    .pipe(postcss(sassConfig.postcssOptionRelease))
    .pipe(gulp.dest(paths.sass.dist))
})

/* **************************************************
 *
 * pug
 *
 * **************************************************/

const pugConfig = {
  pugSettingOption: {
    pretty: true
  }
}

gulp.task('pug', () => {
  return gulp.src(paths.pug.src)
    .pipe(pug(pugConfig.pugSettingOption))
    .pipe(htmlmin(htmlminOptions))
    .pipe(changed(paths.pug.dist))
    .pipe(gulp.dest(paths.pug.dist))
    .pipe(server.stream())
})

/* **************************************************
 *
 * js
 *
 * **************************************************/

gulp.task('js', () => {
  return gulp.src(paths.js.src)
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(paths.js.dist))
})


/* **************************************************
 *
 * clean
 *
 * **************************************************/
gulp.task('clean', (callback) => {
  clean([`${distRoot}/**`, `!${distRoot}`], callback())
})

/* **************************************************
 *
 * server
 *
 * **************************************************/
const serverConfig = {
  server: {
    baseDir: distRoot
  },
  port: 4000
}

gulp.task('server', (callback) => {
  server.init(serverConfig)
  callback()
})

/* **************************************************
 *
 * lint
 *
 * **************************************************/
gulp.task('lint-js', () => {
  return gulp.src(paths.js.watch, {read: false})
    .pipe(plumber())
    .pipe(shell(['yarn eslint']))
})

gulp.task('lint-js-fix', () => {
  return gulp.src(paths.js.watch, {read: false})
    .pipe(plumber())
    .pipe(shell(['yarn eslint --fix']))
})


gulp.task('lint-pug', () => {
  return gulp.src(paths.pug.watch)
    .pipe(puglint({reporter: 'puglint-stylish'}))
})

gulp.task('lint-scss', () => {
  return gulp.src(paths.sass.watch)
    .pipe(plumber())
    .pipe(stylelint({reporters: [{formatter: 'string', console: true}]}))
})

gulp.task('lint-scss-fix', () => {
  return gulp.src(paths.sass.watch)
    .pipe(plumber())
    .pipe(stylelint({
      fix: true,
      reporters: [{formatter: 'string', console: true}]
    }))
})

gulp.task('lint', gulp.series('lint-js', 'lint-pug', 'lint-scss'))
gulp.task('lint-fix', gulp.series('lint-js-fix', 'lint-scss-fix'))

/* **************************************************
 *
 * watch
 *
 * **************************************************/
gulp.task('watch', gulp.series('server', () => {
  const reload = (callback) => {
    server.reload()
    callback()
  }

  gulp.watch(paths.html.watch, gulp.task('html'));
  gulp.watch(paths.js.watch, gulp.parallel('js', 'lint-js'))
  gulp.watch(paths.pug.watch, gulp.parallel('pug', 'lint-pug'))
  gulp.watch(paths.sass.watch, gulp.parallel('sass', 'lint-scss'))
  gulp.watch(`${distRoot}/**/*`, reload)
}))

/* **************************************************
 *
 * release
 *
 * **************************************************/
gulp.task(
  'release',
  gulp.series('clean', gulp.parallel('html', 'sass', 'pug'))
)

/* **************************************************
 *
 * default
 *
 * **************************************************/
gulp.task('default', gulp.parallel('html', 'sass', 'pug'))
