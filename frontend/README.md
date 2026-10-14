# Nom de ton projet

Application full-stack avec **Django** (API backend) et **React** (frontend).

## Stack technique
- Backend : Python + Django + Django REST Framework
- Frontend : React + Vite (ou Create React App)
- Base de données : PostgreSQL (recommandé) ou SQLite

## Installation

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver