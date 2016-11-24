Runner
======

Les Web Components suivent une hiérarchie de dépendance entre eux et utilisent également des librairies externes. Il est sujet des assets (fichiers CSS, de fonts et de JS).
Le rôle du runner est donc de construire un arbre de dépendances qui permettra de charger ces assets dans le bon ordre.

Son rôle s'arrête à la génération de l'arbre. Il doit être associé à un task runner (GulpJS, GruntJS...) pour rassembler ces dépendances dans un même fichier par exemple. 
Prenons le cas de GulpJS dans un gulpfile.js à la racine du projet:

Exemple d'usage
---------------
```js
 var gulp = require('gulp');
 var less = require('gulp-less');
 var rename = require('gulp-rename');
 var minifyCss = require('gulp-minify-css');
 var concat = require('gulp-concat');
 var browserify = require('gulp-browserify');
 var uglify = require('gulp-uglify');
 var gutil = require('gulp-util');
 var rev  = require('gulp-rev');
 var stripDebug = require('gulp-strip-debug');
 var all = require('gulp-all');
 var gulpif = require('gulp-if');
 var yargs = require('yargs');
 var runSequence = require('run-sequence');
 var path = require('path');
 var sha1 = require('sha1');
 var fs = require('fs');
 var runner = require('webcomponents/runner');
 
 var paths = {
         folders: {
             page: [
                 __dirname + '/src/WebComponent/Page/'
             ],
             component: [
                 __dirname + '/src/WebComponent/Component/'
             ]
         }
     },
     environments = [
         'main',
         'embed'
     ]
 ;
 
 // File system
 // ###############
 
 // Prepare directories
 gulp.task('prepare', function () {
     fs.existsSync('./www')||fs.mkdirSync('./www');
     fs.existsSync('./www/css')||fs.mkdirSync('./www/css');
     fs.existsSync('./www/css/.tmp')||fs.mkdirSync('./www/css/.tmp');
     fs.existsSync('./www/js')||fs.mkdirSync('./www/js');
     fs.existsSync('./www/js/.tmp')||fs.mkdirSync('./www/js/.tmp');
 });
 /* #####End File system #####*/
 
 // Web Component
 // ###############
 
 // Build all js for each pages components
 gulp.task('wc:js', function () {
     var argv = yargs.argv,
         env = typeof argv.env !== 'undefined' ? argv.env : 'main',
         dev = typeof argv.dev !== 'undefined',
         compiledFile = componentJSBuilder(env)
     ;
 
     return gulp.src(compiledFile)
         .pipe(browserify({
             insertGlobals : false
         }))
         .pipe(gulpif(!dev, stripDebug()))
         .pipe(gulpif(!dev, concat(env+'.min.js')))
         .pipe(gulpif(!dev, uglify()))
         .pipe(gulpif(dev, concat(env+'.dev.js')))
         .pipe(rename(function(path) {
             path.basename = 'js/' + path.basename;
         }))
         .pipe(rev())
         .pipe(gulp.dest('./www'))
         .pipe(rev.manifest(
             "assets.json",
             { merge: true }
         ))
         .pipe(gulp.dest('.'))
     ;
 });
 
 // Build all css for prod env, used minifycss and a sha1 with the date for the stylesheet filename
 gulp.task('wc:css', function () {
     var argv = yargs.argv,
         env = typeof argv.env !== 'undefined' ? argv.env : 'main',
         dev = typeof argv.dev !== 'undefined',
         compiledFile = componentCSSBuilder(env)
     ;
 
     return gulp.src(compiledFile)
         .pipe(less())
         .pipe(gulpif(!dev, minifyCss({compatibility: 'ie8'})))
         .pipe(gulpif(!dev, concat(env+".min.css")))
         .pipe(gulpif(dev, concat(env+'.dev.css')))
         .pipe(rename(function(path) {
             path.basename = 'css/' + path.basename;
         }))
         .pipe(rev())
         .pipe(gulp.dest('./www'))
         .pipe(rev.manifest(
             "assets.json",
             { merge: true }
         ))
         .pipe(gulp.dest('.'))
     ;
 });
 
 // Display the tree of components dependencies
 gulp.task('wc:tree', function() {
     runner.getTree(paths.folders.page, paths.folders.component);
 });
 /* #####End Web Component #####*/
 
 
 // Sequences
 // ###############
 
 // Build tasks according to environments
 gulp.task('default', function (cb) {
     if (typeof environments === 'undefined') {
         environments = ['main'];
     }
 
     var inception = function(environments, i) {
         i = i != 0 ? i - 1 : i;
 
         gutil.log('Run default task with env: `' + environments[i] + '`');
         yargs.default('env', environments[i]);
 
         runSequence('prepare', 'wc:js', 'wc:css', function() {
             gutil.log('Default task with env: `' + environments[i] + '` done');
             if (i != 0) {
                 inception(environments, i);
             }
         });
     };
 
     inception(environments, environments.length);
 });
 /* #####End Sequences #####*/
 
 
 // Utils
 // ###############
 
 /**
  * Build the temporary CSS file
  */
 var componentCSSBuilder = function(env) {
     var files = runner.getFiles(paths.folders.page, paths.folders.component, runner.types.CSS.replace('%s', env));
 
     return runner.writeInLessFile('./www/css/.tmp/', env, files);
 };
 
 /**
  * Build the temporary JS file
  */
 var componentJSBuilder = function(env) {
     var files = runner.getFiles(paths.folders.page, paths.folders.component, runner.types.JS.replace('%s', env));
 
     return runner.writeInJSFile('./www/js/.tmp/', env, files);
 };
 /* #####End Utils #####*/
```
Décomposition
-------------

***1.Charger le runner***
```js
var runner = require('webcomponents/runner');
```

***2.Cibler les Web Components***

Actuellement il existe deux types de Web Components connus de la librairie: les `Pages` et les `Components`
Pour que le Runner puisse construire l'arbre, il est nécessaire de renseigner les chemins des Web Components selon leurs types:
```js
var paths = {
        folders: {
            page: [
                __dirname + '/src/WebComponent/Page/'
            ],
            component: [
                __dirname + '/src/WebComponent/Component/'
            ]
        }
    }
;
```

Ces chemins seront utilisés par les fonctionnalités de la librairie, notamment pour lister les assets en fonction de leurs dépendances.

***3.Les environnements***

Les environnements permettent d'isoler des fonctionnalités sur un fichier; le nom d'un environnement est donc caractéristique du nom d'un fichier. 
Chaque Web Component peut contenir un fichier principal CSS et/ou JS portant le nom d'un environnement. Il est nommé principal car ce sera le seul fichier inclus dans l'arbre de dépendances.
A la compilation de l'arbre, le Runner regroupera par environnement les fichiers portant son nom.

Dans l'exemple ci-dessus, nous avons pris l'initiative de déclarer les environnements que l'on utilisera dans un tableau. L'environnement par défaut est `main`:
```js
var environments = [
    'main',
    'embed'
];
```

***4.Définition du type de fichier à récupérer et leur environnement***

Le type de fichier et l'environnement recherché doit être spécifié comme ceci :

```js
var typeCSS = runner.types.CSS.replace('%s', 'main'); // /less/{env}.less -> /less/main.less 
var typeJS = runner.types.JS.replace('%s', 'main'); // /js/{env}.js -> /less/main.less
```

***5.Récupération des fichiers***

La récupération nécessite les chemins des pages et des components ainsi que le type de fichier à recupérer avec leur environnement.
> Note : 
> La dépendance des Web Components se fait à partir des Pages vers les Components. Il est donc important de comprendre qu'un Component
> n'ayant pas de dépendance avec une Page ne se retrouvera pas dans l'arbre et ne sera donc pas chargé.

```js
var files = runner.getFiles(paths.folders.page, paths.folders.component, typeCSS);
```

***6.Ecriture du fichier de dépendances***

```js
var compiledFilePath = runner.writeInLessFile('./www/css/.tmp/', 'main', files);
var compiledFilePath = runner.writeInJSFile('./www/js/.tmp/', 'main', files);
```

Le chemin du fichier de dépendances est ensuite utilisé pour charger les fichiers dans l'ordre.
Une tâche du task runner peut ensuite les manipuler pour les minifier par exemple.

Outils
------

***Afficher l'arbre de dépendances***
```js
runner.showTree(paths.folders.page, paths.folders.component);
```

Cette méthode affiche l'arbre de dépendances sur le terminal. 