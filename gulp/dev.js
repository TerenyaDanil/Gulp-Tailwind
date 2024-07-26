// Подключение пакетов
const gulp = require("gulp");

const replace = require("gulp-replace");
const fileInculde = require("gulp-file-include");
const webpHTML = require("gulp-webp-retina-html");

const postcss = require("gulp-postcss");

const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const fs = require("fs");
const webp = require("gulp-webp");

const sourseMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

const webpack = require("webpack-stream");
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
    .pipe(
      webpHTML({
        extensions: ["jpg", "jpeg", "png"],
        retina: {
          1: "",
          2: "@2x",
        },
      }),
    )
    .pipe(gulp.dest("./build/"));
});

// Копирование css файлов
gulp.task("css:dev", function () {
  return gulp.src("./src/css/*.css").pipe(gulp.dest("./build/css"));
});

// Компиляция tailwind файлов
gulp.task("tailwind:dev", function () {
  return gulp
    .src("./src/css/main.css")
    .pipe(postcss([require("tailwindcss")]))
    .pipe(gulp.dest("build/css/"));
});

// Копирование изображений в dist
gulp.task("copyImages:dev", function () {
  return gulp.src("./src/img/**/*").pipe(changed("./build/img")).pipe(webp()).pipe(gulp.dest("./build/img")).pipe(gulp.src("./src/img/**/*")).pipe(changed("./build/img")).pipe(gulp.dest("./build/img"));
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
  return gulp
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
    .pipe(webpack(require("./../webpack.config")))
    .pipe(gulp.dest("./build/js/"));
});

// Запуск сервера
gulp.task("browser-sync:dev", function () {
  browserSync.init({
    server: "./build",
    watch: true,
    notify: false,
  });
});

gulp.task("browser-sync-reload:dev", function () {
  browserSync.reload();
});

// Слежка за файлами
gulp.task("watch:dev", function () {
  gulp.watch("./src/**/*.html", gulp.parallel("includeFiles:dev", "tailwind:dev"));
  gulp.watch("./src/css/**/*.css", gulp.parallel("tailwind:dev"));
  gulp.watch("./src/img/*", gulp.series("copyImages:dev"));
  gulp.watch("./src/fonts/*", gulp.series("copyFonts:dev", "browser-sync-reload:dev"));
  gulp.watch("./src/files/*", gulp.series("copyFiles:dev"));
  gulp.watch("./src/js/*", gulp.series("js:dev"));
});
