const gulp = require("gulp");

require("./gulp/dev.js");
require("./gulp/docs.js");

// Запуск дефолтного таска gulp
gulp.task("default", gulp.series("clean:dev", gulp.parallel("includeFiles:dev", "tailwind:dev", "copyImages:dev", "copyFonts:dev", "copyFiles:dev", "js:dev"), gulp.parallel("startServer:dev", "watch:dev")));

// Запуск продакшн таска gulp
gulp.task("docs", gulp.series("clean:docs", gulp.parallel("includeFiles:docs", "tailwind:docs", "copyImages:docs", "copyFonts:docs", "copyFiles:docs", "js:docs"), gulp.parallel("startServer:docs")));
