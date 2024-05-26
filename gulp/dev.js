// Подключение пакетов
const gulp = require("gulp");
const replace = require("gulp-replace");

const fileInculde = require("gulp-file-include");
// const sass = require('gulp-sass')(require('sass'));
// const sassGlob = require('gulp-sass-glob');
const postcss = require("gulp-postcss");
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourseMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");

// Удаление dist
gulp.task("clean:dev", function (done) {
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean());
  }
  done();
});

// Компиляция разных html файлов
gulp.task("includeFiles:dev", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./build/", { hasChanged: changed.compareContents }))
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
    .pipe(gulp.dest("./build/"));
});

// Компиляция sass файлов
// gulp.task("sass:dev", function () {
//   return gulp
//     .src("./src/scss/*.scss")
//     .pipe(changed("./build/css"))
//     .pipe(
//       plumber({
//         errorHandler: notify.onError({
//           title: "Styles",
//           message: "Error <%= error.message %>",
//           sound: false,
//         }),
//       }),
//     )
//     .pipe(sourseMaps.init())
//     .pipe(sassGlob())
//     .pipe(sass())
//     .pipe(replace(/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi, "$1$2$3$4$6$1"))
//     .pipe(sourseMaps.write())
//     .pipe(gulp.dest("./build/css"));
// });

// Компиляция tailwind файлов
gulp.task("tailwind:dev", function () {
  return gulp
    .src("./src/css/main.css")
    .pipe(postcss([require("tailwindcss")]))
    .pipe(gulp.dest("build/css/"));
});

// Копирование изображений в dist
gulp.task("copyImages:dev", function () {
  return (
    gulp
      .src("./src/img/**/*")
      .pipe(changed("./build/img"))
      // .pipe(imagemin({ verbose: true }))
      .pipe(gulp.dest("./build/img"))
  );
});

// Копирование шрифтов в dist
gulp.task("copyFonts:dev", function () {
  return gulp.src("./src/fonts/**/*").pipe(changed("./build/fonts")).pipe(gulp.dest("./build/fonts"));
});

// Копирование вспомогательных файлов в dist
gulp.task("copyFiles:dev", function () {
  return gulp.src("./src/files/**/*").pipe(changed("./build/files")).pipe(gulp.dest("./build/files"));
});

// Обработка JS

gulp.task("js:dev", function () {
  return (
    gulp
      .src("./src/js/*.js")
      .pipe(changed("./build/js/"))
      .pipe(
        plumber({
          errorHandler: notify.onError({
            title: "JS",
            message: "Error <%= error.message %>",
            sound: false,
          }),
        }),
      )
      // .pipe(babel())
      .pipe(webpack(require("./../webpack.config")))
      .pipe(gulp.dest("./build/js/"))
  );
});

// Запуск сервера
gulp.task("startServer:dev", function () {
  return gulp.src("./build/").pipe(
    server({
      livereload: true,
      open: true,
    }),
  );
});

// Слежка за файлами
gulp.task("watch:dev", function () {
  gulp.watch("./src/**/*.html", gulp.parallel("includeFiles:dev", "tailwind:dev"));
  gulp.watch("./src/css/**/*.css", gulp.parallel("tailwind:dev"));
  gulp.watch("./src/img/*", gulp.parallel("copyImages:dev"));
  gulp.watch("./src/fonts/*", gulp.parallel("copyFonts:dev"));
  gulp.watch("./src/files/*", gulp.parallel("copyFiles:dev"));
  gulp.watch("./src/js/*", gulp.parallel("js:dev", "tailwind:dev"));
});
