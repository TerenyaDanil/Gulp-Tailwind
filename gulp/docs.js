// Подключение пакетов
const gulp = require("gulp");
const replace = require("gulp-replace");

const fileInculde = require("gulp-file-include");
const htmlClean = require("gulp-htmlclean");
const webpHTML = require("gulp-webp-html");

// const sass = require('gulp-sass')(require('sass'));
// const sassGlob = require('gulp-sass-glob');

const autoprefixer = require("gulp-autoprefixer");
const postcss = require("gulp-postcss");

const csso = require("gulp-csso");
const webpCss = require("gulp-webp-css");

const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourseMaps = require("gulp-sourcemaps");
const groupMedia = require("gulp-group-css-media-queries");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");

const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");

const changed = require("gulp-changed");

// Удаление dist
gulp.task("clean:docs", function (done) {
  if (fs.existsSync("./docs/")) {
    return gulp.src("./docs/", { read: false }).pipe(clean());
  }
  done();
});

// Компиляция разных html файлов
gulp.task("includeFiles:docs", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./docs/"))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "HTML",
          message: "Error <%= error.message %>",
          sound: false,
        }),
      }),
    )
    .pipe(
      fileInculde({
        prefix: "@@",
        basepath: "@file",
      }),
    )
    .pipe(replace(/(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi, "$1./$4$5$7$1"))
    .pipe(
      webpHTML({
        extensions: ["jpg", "jpeg", "png", "gif", "webp"],
        retina: {
          1: "",
          2: "@2x",
        },
      }),
    )
    .pipe(htmlClean())
    .pipe(gulp.dest("./docs/"));
});

// Компиляция sass файлов
// gulp.task('sass:docs', function() {
// 	return gulp
// 			.src('./src/scss/*.scss')
// 			.pipe(changed('./docs/css'))
// 			.pipe(plumber({
// 				errorHandler: notify.onError({
// 					title: 'Styles',
// 					message: 'Error <%= error.message %>',
// 					sound: false
// 				})
// 			}))
// 			.pipe(sourseMaps.init())
// 			.pipe(autoprefixer())
// 			.pipe(sassGlob())
// 			.pipe(webpCss())
// 			.pipe(groupMedia())
// 			.pipe(sass())
// 			.pipe(
// 				replace(
// 					/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
// 					'$1$2$3$4$6$1'
// 				)
// 			)
// 			.pipe(csso())
// 			.pipe(sourseMaps.write())
// 			.pipe(gulp.dest('./docs/css'))
// });

gulp.task("tailwind:docs", function () {
  return gulp
    .src("./src/css/main.css")
    .pipe(postcss([require("tailwindcss"), require("autoprefixer")]))
    .pipe(csso());
});

// Копирование изображений в dist
gulp.task("copyImages:docs", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(changed("./docs/img"))
    .pipe(webp())
    .pipe(gulp.dest("./docs/img"))
    .pipe(gulp.src("./src/img/**/*"))
    .pipe(changed("./docs/img"))
    .pipe(imagemin([imagemin.gifsicle({ interlaced: true }), imagemin.mozjpeg({ quality: 85, progressive: true }), imagemin.optipng({ optimizationLevel: 5 })], { verbose: true }))
    .pipe(gulp.dest("./docs/img"));
});

// Копирование шрифтов в dist
gulp.task("copyFonts:docs", function () {
  return gulp.src("./src/fonts/**/*").pipe(changed("./docs/fonts")).pipe(gulp.dest("./docs/fonts"));
});

// Копирование вспомогательных файлов в dist
gulp.task("copyFiles:docs", function () {
  return gulp.src("./src/files/**/*").pipe(changed("./docs/files")).pipe(gulp.dest("./docs/files"));
});

// Обработка JS

gulp.task("js:docs", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./docs/js/"))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "JS",
          message: "Error <%= error.message %>",
          sound: false,
        }),
      }),
    )
    .pipe(babel())
    .pipe(webpack(require("../webpack.config")))
    .pipe(gulp.dest("./docs/js/"));
});

// Запуск сервера
gulp.task("startServer:docs", function () {
  return gulp.src("./docs/").pipe(
    server({
      livereload: true,
      open: true,
    }),
  );
});
