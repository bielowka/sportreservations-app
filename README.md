# Sport Reservations

System rezerwacji obiektów sportowych umożliwiający zarządzanie obiektami sportowymi, ich rezerwacjami oraz harmonogramami.

## Technologie

### Backend
-  **Node.js** - środowisko uruchomieniowe
-  **Express.js** - framework aplikacji
-  **Sequelize** - ORM do obsługi bazy danych
-  **MySQL** - system zarządzania bazą danych
-  **Handlebars (HBS)** - silnik szablonów

### Frontend
-  **React** - biblioteka do budowy interfejsu użytkownika
-  **Bootstrap 5** - framework CSS
-  **Font Awesome** - zestaw ikon

### Bezpieczeństwo
-  **JWT** - tokeny uwierzytelniające
-  **Bcrypt** - hashowanie haseł
-  **Helmet** - zabezpieczenia HTTP
-  **Express-session** - zarządzanie sesjami
-  **Express-validator** - walidacja danych
-  **Rate Limiting** - ograniczenie liczby zapytań

## Role użytkowników i ich możliwości

### 1. Klient (Client)
- Przeglądanie dostępnych obiektów sportowych, filtrowanie i wyszukiwanie
- Dostęp do harmonogramu obiektów
- Tworzenie i zarządzanie własnymi rezerwacjami
- Przeglądanie historii rezerwacji
- Edycja własnego profilu

### 2. Administrator Obiektu (Admin)
- Dodawanie i edycja własnych obiektów sportowych
- Zarządzanie rezerwacjami dla swoich obiektów
- Przeglądanie statystyk obiektów

### 3. Super Administrator (Superadmin)
- Osobny panel, poza głównym frontendem z osobnym logowaniem
- Zarządzanie wszystkimi obiektami w systemie
- Zarządzanie kontami użytkowników
- Przeglądanie globalnych statystyk systemu

## Dokumentacja techniczna

### Struktura projektu
```
project/
├── client/           # Aplikacja kliencka w React
├── config/           # Konfiguracja
├── middleware/       # Auth middleware
├── models/          # Modele Sequelize
├── migrations/       # Migracje bazy danych
├── routes/          # Routery Express
├── views/           # Szablony HBS panelu superadmina
├── app.js           # Główny plik aplikacji
```

### Zabezpieczenia
1. **Autentykacja**
   - Wykorzystanie JWT do autoryzacji API
   - Sesje użytkowników z express-session
   - Hashowanie haseł z bcrypt

2. **Walidacja danych**
   - Walidacja wejścia z express-validator
   - Sanityzacja danych przed zapisem do bazy

3. **Zabezpieczenia HTTP**
   - Helmet dla nagłówków bezpieczeństwa
   - Rate limiting dla zapobiegania atakom DDoS
   - CORS dla kontroli dostępu

## Instalacja i uruchomienie

### Wymagania wstępne
- Node.js (v14 lub wyższa)
- MySQL (v8 lub wyższa)
- npm lub yarn

### Backend
```bash
# Instalacja zależności
npm install

# Migracja bazy danych
npx sequelize-cli db:migrate

# Uruchomienie w trybie deweloperskim
npm run dev

# Uruchomienie w trybie produkcyjnym
npm start
```

### Frontend - należy zbudować przed uruchomieniem aplikacji
```bash
# Przejście do katalogu client
cd client

# Instalacja zależności
npm install

# Utworzenie React build
npm run build
```

## Autorzy
- **Szymon Bielówka**
- **Piotr Dziedzic**