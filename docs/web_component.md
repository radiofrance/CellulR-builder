Web Component
=============

Un Web Component est un composant d'interface graphique réutilisable.
Sur cette implémentation, il regroupe la vue et les assets utilisées côté navigateur.

Structure
---------

Un Web Component se structure de la manière suivante:

```
 /src
 .... /WebComponent
 ........ /Component
 ............ /Image
 ................ /js
 .................... component.js
 .................... handler.js
 .................... main.js
 ................ /less
 .................... main.less
 ................ component.json
 ................ ...
 ........ /Page
 ............ ...
```

Les types
---------

Un Web Component possède un type. Il doit être classé selon son type dans un répertoire associé.
Il existe actuellement deux types: ***Page*** et ***Component***.

Le type ***Page*** est un regroupement de Web Components et est accessible depuis une route. Il répond donc à un besoin fonctionnel et structurel.

Le type ***Component*** est unitaire. Il peut aussi être un regroupement de Web Components mais ne répond seulement qu'à un besoin fonctionnel.

Le fichier de dépendances
-------------------------

Chaque Web Component doit possèder un fichier de dépendances et de définition `component.json`.
Ce fichier permet de relier les assets des Web Components entre eux et de les prendre en compte lors de la compilation.

Voici l'exemple du Web Component `Image` de type `Component` 

```json
{
    "name": "Image",
    "description": "Set a description of the image component",
    "require": {
        "Legend": "*"
    }
}
```

Les différentes clefs:
- `name`: ***[string]*** Le Nom du Web Component
- `description`: ***[string]*** La description du Web Component
- `master`: ***[boolean]*** Un Web Component master se place en haut de l'arbre de dépendances
- `require`: ***(required) [array]*** Liste les dépendances du Web Component:
    - `"NomDuWebComponent": "*"` //TODO La version est à venir
    
A voir aussi
------------

[Arbre et dépendances](runner.md)