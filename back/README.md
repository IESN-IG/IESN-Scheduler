<h1 align="center">Bienvenue sur le repo IESN Scheduler 👋</h1>

### 📆 [Site](https://iesn.thibaultclaude.be) - [Site Perso](https://thibaultclaude.be) 🏠 

## Notice

Cette deuxième version a été mise en place principalement pour être documentée au maximum afin de pouvoir être maintenue par un futur étudiant de l'IESN. Les technologies utilisées ont, par la même occasion, été changées.

Les fonctions déclarées ont été pensées au maximum afin de pouvoir gérer toutes les sections de l'IESN, chose qui avait été prévu et était fonctionnel mais l'IESN n'ayant pas de modèle pour les calendriers il était impossible de gérer les particularités de chaque section. En espérant que l'IESN choisisse un standard pour leur horaire et s'y tiennent sans changer tous les quadris 😇.

Un script pour parse automatiquement les cours / UE ainsi que leurs noms sera mis à disposition rapidement.

## Fonctionnalités

- Génération d'iCal personnalisé selon le bloc, le groupe et les cours permettant une synchronisation dans les applications d'agenda
- Affichage de l'horaire d'un groupe donné

## Technos utilisées

- __Backend__ : fastify
- __Frontend__ : React.js

## TODO

* Mettre en place un système de cache pour les calendriers
    * Évite trop de requête sur l'API Henallux
    * Évite les moments de down de l'API

## Notes

* Stock en local des blocs + A.A. + code dans le fichier `blocs.json`
    - Parse du site ([lien](https://services.henallux.be/paysage/public/cursus/infocursus/idCursus/6)) 
    - Script de parsing à venir
    
## Auteur

👤 **Thibault CLAUDE**

* Github: [@tclaude94](https://github.com/tclaude94)
* Discord : tiiBz#1337