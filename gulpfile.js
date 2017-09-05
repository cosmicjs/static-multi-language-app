const fs = require('fs');
const del = require('del');
const path = require('path');
const gulp = require('gulp');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const cleanCSS = require('gulp-clean-css');

/* local files + configuration */
const config = require('./config'); // get the local configuration
const fetchCosmicNodes = require('./fetch'); // get our custom Cosmic fetch utility

/* dev tools */
const watch = require('gulp-watch');
const server = require('gulp-webserver');

/* let's make some shorthand rules to make it easier on the eyes */
const src = gulp.src;
const dest = gulp.dest;

/* setup our pathnames */
const srcPath = path.join(__dirname, './src'); // where the project is stored
const dataPath = path.join(__dirname, config.fetch.file); // where the Cosmic JS data should be stored
const buildPath = path.join(__dirname, './build'); // where the build site is stored
const assetPath = path.join(buildPath, './assets'); // where the assets will be stored

/* setup general configuration */
const REPALCE_DEFAULT_LANG = '/#_COSMIC_NODE_DEFAULT_LANG_#/';
const REPLACE_LANG = '/#_COSMIC_NODE_LANG_DATA_#/'; // the string that will be replaced with the parsed language data

let NodeLanguageData = null; // the session container for the Node Language Data fetched from Cosmic JS
// acts as a fail-safe, setting it to 'null' in case the Data is not fetched.

let ENV_PRODUCTION = false; // flag for setting things like js minification
/* production environment setter */
gulp.task('env:production', () => {
    ENV_PRODUCTION = true;
    return true; // finish the task
});

/* langData specific tasks */
gulp.task('lang:load', (callback) => {
    // check to see if the datafile exists, or attempt to load it directly.

    if (config.fetch.cache === false) {
        // if the config.fetch.always is set then it will never cache the results
        fetchCosmicNodes().then(data => {
            NodeLanguageData = data; // set the data in the runtime storage
            callback();
        });
    } else {
        // caching is enabled: attempt to read the cache file as a string.
        fs.readFile(dataPath, 'utf-8', (error, data) => {
            if (error) {
                // there is a corrupted file or something awful is inside so let's make a new one.
                // fetch live data
                fetchCosmicNodes().then(data => {
                    NodeLanguageData = data; // set the data in the runtime storage

                    // at this point we can also assume that the file does not exist either, so let's write it
                    fs.writeFile(dataPath, JSON.stringify(data), 'utf-8', (e) => {
                        if (e) {
                            // something must have gone wrong
                            console.error(e);
                            callback(e);
                        } else {
                            // the was was written so continue
                            callback();
                        }
                    });
                });
            } else {
                // so the file has valid contents, so let's try parsing
                let parsedJSON = null;
                try {
                    parsedJSON = JSON.parse(data);
                } catch (e) {
                    // the data is corrupt (invalid JSON) ignore it.
                    console.log(e);
                    callback();
                }

                NodeLanguageData = parsedJSON; // will be null it it failed
                callback();
            }
        });
    }
});

gulp.task('lang', () => {
    // clear out the old JSON and make new one's in it's place
    del(dataPath).then(() => {
        gulp.start('lang:load');
    });
});

/* build tasks */
gulp.task('clean', () => {
    // clean the directories before compiling
    return del.sync(buildPath);
});

gulp.task('build:img', ['clean'], () => {
    src(path.join(srcPath, './img/*'))
        .pipe(dest(path.join(assetPath, './img/')));
});

gulp.task('build:js', ['clean', 'lang:load'], () => {
    // this is where we will build our js

    // js path helper
    let $js = file => path.join(srcPath, file);

    // this is also where we will attempt to embed our custom language data
    return src([$js('./js/error.js'), $js('./js/lang.js'), $js('./js/main.js')])
        /* INJECT THE LANGUAGE DATA */
        .pipe(replace(REPLACE_LANG, JSON.stringify(NodeLanguageData)))
        /* INJECT THE DEFAULT SELECTED LOCALE */
        .pipe(replace(REPALCE_DEFAULT_LANG, JSON.stringify(config.lang.defaultLocale)))
        .pipe(concat('bundle.js'))
        .pipe(gulpIf(ENV_PRODUCTION, uglify())) // minify if set to production
        .pipe(dest(assetPath)); // pipe to output
});

gulp.task('build:css', ['clean'], () => {
    return src(path.join(srcPath, './styles/*'))
        .pipe(concat('bundle.css')) // combine al of the css into one file
        .pipe(cleanCSS()) // minify the css code
        .pipe(dest(assetPath));
});

gulp.task('build:html', ['clean'], () => {
    // let's move the main.html file into the index position
    return src(path.join(srcPath, './html/main.html'))
        .pipe(rename('index.html'))
        .pipe(dest(buildPath));
});

/* the main development build function */
gulp.task('dbuild', ['clean', 'lang:load', 'build:img', 'build:js', 'build:css', 'build:html']);

/* the main production build function */
gulp.task('build', ['env:production', 'clean', 'lang:load', 'build:img', 'build:js', 'build:css', 'build:html']);


/* some extra development tasks */
gulp.task('watch', () => {
    return watch(path.join(srcPath, './**/*'), {readDelay: 1000}, () => {
        gulp.start('dbuild');
    });
});

gulp.task('server', () => {
    src(buildPath)
        .pipe(server({
            directoryListing: false,
            open: true,
            port: process.env.PORT || 8080
        }));
});