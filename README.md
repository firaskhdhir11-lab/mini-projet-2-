# Mini-Projet 2 — Kubernetes : API de gestion des tâches

## 1. Présentation

Ce projet déploie une API REST de gestion des tâches avec Node.js, Express et PostgreSQL sur un cluster Kubernetes.

L'objectif est de mettre en pratique les Deployments, StatefulSets, Services, ConfigMaps, Secrets, PersistentVolumeClaims, les probes de santé et les règles de sécurité des Pods.

## 2. Architecture

- **API** : Node.js et Express.
- **Base de données** : PostgreSQL 16.
- **Orchestration** : Kubernetes.
- **Configuration** : ConfigMap `app-config`.
- **Identifiants de la base** : Secret `db-credentials`.
- **Persistance** : PVC de 1 Gio avec la StorageClass `local-path`.
- **Namespace** : `mini-projet-2`.

L'API utilise les variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` et `DB_PASSWORD`.

## 3. Structure du projet

```text
mini-projet-2/
├── app/
│   └── api/
│       ├── Dockerfile
│       ├── package.json
│       ├── package-lock.json
│       └── server.js
├── k8s/
│   ├── 00-namespace/
│   ├── 10-config/
│   ├── 20-db/
│   └── 30-app/
└── README.md
