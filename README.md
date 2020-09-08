<h1 align="center">Welcome to IESN Scheduler 👋</h1>

### 🏠 [Site](https://iesn.thibaultclaude.be)

## Fonctionnalités

- Génération d'iCal personnalisé selon le bloc, le groupe et les cours permettant une synchronisation dans les applications d'agenda
- Affichage de l'horaire d'un groupe donné

## Technos utilisées

- __Backend__ : express.js
- __Frontend__ : VueJS

## TODO

* Implémenter une API complète pour les cours/groupes (CRUD)
    * Panel admin pour mettre à jour rapidement les données si nécessaire (?)
* Mettre en place un système de cache pour les calendriers
    * Évite trop de requête sur l'API Henallux
    * Évite les moments de down de l'API

## Notes

* Stock en local des blocs + A.A. + code dans le fichier `blocs.json`
    - Possible de parse le site ([lien](https://services.henallux.be/paysage/public/cursus/infocursus/idCursus/6)) 
    
## Auteur

👤 **Thibault CLAUDE**

* Github: [@tclaude94](https://github.com/tclaude94)
* Discord : tiiBz#1337

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
