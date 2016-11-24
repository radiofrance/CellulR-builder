Gestion des Web Components
==========================

Un Web Component possède une partie Back End et une partie Front End. La partie Back permet de récupérer les données, tandis que la partie Front gère l'affichage et le rendu.

Lors du rendu, le Javascript des Web Components est géré par le gestionnaire des Web Component. Ces derniers peuvent s'enregistrer au sein d'un dépôt commun et communiquer entre eux à travers des événements.
Cela est utile lors d'un changement de page asynchrone par exemple; les Web Components peuvent se mettre à jour auprès du DOM.

Charger le manager des Web Components
-------------------------------------
```js
var wc = require('webcomponents');
```

Structure de la librairie
-------------------------

Les élément suivants sont disponibles depuis la librairie `webcomponents`

- `wc.component.component` : Prototype d'un composant
- `wc.component.eventHandler` : Gestionnaire d'évènements
- `wc.component.repository` : Dépôt de composants

Workflow
--------

Voici la structure javascript par défaut d'un Web Component:

- `{env}.js` : C'est le point d'entrée JS du composant. Il permet d'instancier le `component` ainsi 
que ses `handlers` et d'inscrire le composant aux différents événements.
Le nom du fichier correspond à l'environnement JS choisi. Le Runner ciblera ces fichiers en fonction de l'environnement demandé
- `component.js` : C'est la définition du composant. C'est ici que le composant s'enregistre dans le dépôt commun
- `handler.js` : Il y a un handler par instance du composant. Un composant peut s'attacher au DOM, et donc se retrouver à plusieurs endroits.
L'handler est là pour gérer chaque instance du composant.

Le composant (component.js)
---------------------------

Le composant utilise le prototype mis à disposition par la librairie comme structure commune.
Il peut ensuite s'inscrire dans le dépôt commun (repository).

```js
// WebComponent/Image/js/component.js
var Image = function() {
    this.name = 'image';
    wc.component.repository.register(this);
};
 
Image.prototype = Object.create(wc.component.component.prototype);
```

Le gestionnaire (handler.js)
----------------------------

L'handler permet de gérer le composant sur l'instance DOM renseignée. Si le Web Component se retrouve plusieurs fois sur la page, il peut y avoir autant d'handlers que de définitions du composant. 
Ceci permet de gérer individuellement les instances de ce composant.
 
Au minimum l'handler recevra la définition du composant. Le container courant pourra être passé en paramètre si besoin.
Quoi qu'il en soit, cette partie est entièrement à votre charge. Cet exemple vous montre seulement la marche à suivre.

```js
// WebComponent/Image/js/handler.js
var Handler = function(component, container) {
    this.component = component;
    this.container = container;
};
 
Handler.prototype.handle = function() {
    // do some
};
 
Handler.prototype.reload = function() {
    // do some
};
 
// ...
```

Le point d'entrée ({env}.js)
----------------------------

Le fichier principal prend comme nom l'environnement choisi. Il est le point d'entrée de l'arbre de dépendances construit pour les assets.
L'instanciation conditionnel du composant ainsi que ses handlers se fait ici.


```js
// WebComponent/Image/js/main.js
wc.component.image = require('./component.js');
wc.component.handler = require('./handler.js');
 
//init
var component = new wc.component.image(),
    handler = new wc.component.handler(component);

handler.handle();
 
// ...
```

Définition d'un état (state)
----------------------------

Un composant peut avoir des états. Lors du changement de son état un événement est envoyé. 
Il peut être attrapé par d'autres composants

```js
// WebComponent/Image/js/component.js
Image.state = {};
  
Image.state.reload = function(component) {
    this.name = 'image.reload';
    this.component = component;
};
```

Changement d'état
-----------------

Le changement d'état se fait grâce à la méthode `setState` du `component`. Elle déclenche à son tour un événement du nom de l'état

```js
// WebComponent/Image/js/component.js
Image.prototype.reload = function() {
    console.info('reload images');
    this.setState(new Page.state.new(this));
};
```

Déclenchement d'un événement
----------------------------

Il est également possible de déclencher un événement depuis le gestionnaire d'événements des Web Components

```js
wc.component.eventHandler.trigger({name: 'image.reload'});
```

Attraper un événement
---------------------

Vous pouvez attraper un événement émit par n'importe quel composant grâce à son nom

```js
wc.component.eventHandler.subscribe('image.reload', function() {
    handler.reload();
});
```

Récupérer un composant
----------------------

Il faut réquêter le dépôt commun pour pouvoir récupérer un composant enregistré dans ce dernier

```js
var image = wc.component.repository.get('image');
```





