# Instrukcja Uruchomienia Środowiska

## 3.1.1. Zmiany w plikach serwera Flask
Należy zmodyfikować wszystkie wystąpienia adresu IP w zapytaniach API. Nowy adres powinien odpowiadać adresowi hosta, na którym uruchomiony jest serwer NodeJS.

---

## 3.1.2. Zmiany w plikach serwera NodeJS
Zmodyfikuj wartość zmiennej `flaskBaseUrl` znajdującej się w pliku:
node-express-backend/src/controllers/greenboneController.js

Nowy adres IP powinien odpowiadać:
- Adresowi hosta, na którym uruchomiony jest serwer Flask
- Portowi 9391

---

## 3.1.3. Zmiany w plikach serwera NextJS
Jeśli frontend zostanie uruchomiony na innym hoście niż NodeJS, podmień wartość `localhost:4000` na odpowiedni adres IP oraz port serwera NodeJS.

---

## 3.1.4. Docker

Do działania programu wymagane jest oprogramowanie **Docker**. Można je pobrać ze strony producenta:

[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### Kroki:
Po zainstalowaniu Docker Desktop, wykonaj następujące polecenia w podanej kolejności:

```bash
docker compose -f docker-compose.yml -p greenbone-community-edition pull
docker compose -f docker-compose.yml -p greenbone-community-edition up -d
