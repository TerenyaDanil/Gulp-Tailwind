// Подключение пакетов
const gulp = require("gulp");

const replace = require("gulp-replace");
const fileInculde = require("gulp-file-include");
const htmlClean = require("gulp-htmlclean");

const postcss = require("gulp-postcss");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const webp = require("gulp-webp");
const webpHTML = require("gulp-webp-retina-html");

const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const fs = require("fs");

const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const changed = require("gulp-changed");

// Удаление dist
gulp.task("clean:prod", function (done) {
  if (fs.existsSync("./prod/")) {
    return gulp.src("./prod/", { read: false }).pipe(clean());
  }
  done();
});

// Компиляция разных html файлов
gulp.task("includeFiles:prod", function () {
  return gulp
    .src(["./src/html/index.html"])
    .pipe(changed("./prod/"))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "HTML",
          message: "Error <%= error.message %>",
          sound: true,
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
    .pipe(htmlClean())
    .pipe(gulp.dest("./prod/"));
});

// Копирование css файлов
gulp.task("css:prod", function () {
  return gulp.src("./src/css/*.css").pipe(gulp.dest("./prod/css"));
});

// Компиляция tailwind файлов
gulp.task("tailwind:prod", function () {
  return gulp
    .src("./src/css/main.css")
    .pipe(postcss([require("tailwindcss"), require("autoprefixer")]))
    .pipe(csso())
    .pipe(gulp.dest("prod/css/"));
});

// Копирование изображений в dist
gulp.task("copyImages:prod", function () {
  return gulp.src("./src/img/**/*").pipe(changed("./prod/img")).pipe(webp()).pipe(gulp.dest("./prod/img")).pipe(gulp.src("./src/img/**/*")).pipe(changed("./prod/img")).pipe(gulp.dest("./prod/img"));
});

// Копирование шрифтов в dist
gulp.task("copyFonts:prod", function () {
  return gulp.src("./src/fonts/**/*").pipe(changed("./prod/fonts")).pipe(gulp.dest("./prod/fonts"));
});

// Копирование вспомогательных файлов в dist
gulp.task("copyFiles:prod", function () {
  return gulp.src("./src/files/**/*").pipe(changed("./prod/files")).pipe(gulp.dest("./prod/files"));
});

// Обработка JS
gulp.task("js:prod", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./prod/js/"))
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
    .pipe(gulp.dest("./prod/js/"));
});

// Запуск сервера
gulp.task("browser-sync:prod", function () {
  browserSync.init({
    server: "./prod",
    watch: true,
    notify: false,
  });
});
