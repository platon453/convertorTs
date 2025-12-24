Действуй как Fullstack-разработчик и архитектор систем. Мне нужно переписать текущий проект в файле @index.html (одностраничный HTML с хакерским дизайном "SECRET EXCHANGE") на современный технологический стек с разделением на Frontend и Backend.

### ТЕКУЩЕЕ СОСТОЯНИЕ:
- У меня есть файл index.html с Matrix-эффектами, CSS-анимациями и базовой JS-функцией, которая просто умножает евро на статичное число 93.

### ЗАДАЧА:
- Разделить проект на два независимых сервиса, используя TypeScript.

### ВАЖНО: 
- Пожалуйста, пишите код строго по этапам. Не торопитесь, детально объясняйте каждый шаг и указывайте все необходимые библиотеки, которые нужно установить, чтобы избежать конфликтов.
- Не забудь после того как все прочитаешь и проанализируешь написть .gitnore файл чтобы в гит не попали всякие кешы и тд ток важный код!

1. BACKEND (Node.js + Express + TypeScript):
    - Создать API эндпоинт GET `/api/rate`, который возвращает актуальный курс EUR к RUB.
    - Реализовать получение данных из внешнего надежного источника (используй ExchangeRate-API или аналогичный бесплатный сервис).
    - Внедрить кэширование курса (например, через простую переменную или node-cache) на 5-10 минут, чтобы не спамить внешний API при каждом обновлении страницы.
    - Структура должна быть чистой: контроллеры, сервисы, типы.
    - Реализовать обработку ошибок (например, если API недоступен).
    - Добавить логирование запросов и ошибок (например, с помощью `winston`).
    - Пример кэширования и работы с API:
      ```ts
      // Пример для сервиса на backend
      class RateService {
        private cache: Map<string, { rate: number, timestamp: number }> = new Map();

        async getRate(): Promise<number> {
          const now = Date.now();
          const cacheData = this.cache.get('EUR_RUB');
          if (cacheData && now - cacheData.timestamp < 10 * 60 * 1000) {
            return cacheData.rate;
          }

          const rate = await this.fetchRateFromAPI();
          this.cache.set('EUR_RUB', { rate, timestamp: now });
          return rate;
        }

        private async fetchRateFromAPI(): Promise<number> {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
          const data = await response.json();
          return data.rates.RUB;
        }
      }
      
    - Не забудь указать библиотеки для установки:
      - npm install express
      - npm install axios (если используешь axios для API запросов)
      - npm install node-cache
      - npm install winston (для логирования)

2. FRONTEND (Vite + React или Vanilla TS):
    - Полностью перенести существующий визуальный стиль (Matrix background, scan-lines, glitch effects, animations) из предоставленного HTML/CSS.
    - Вместо локальной функции euroTuRub, реализовать запрос к моему новому Backend API.
    - Сохранить все анимации: появление монеток, "хакерский" лог внизу страницы, вибрацию и звуковые эффекты.
    - Типизировать все данные (интерфейсы для API ответов).
    - Использовать async/await для асинхронных операций, таких как запросы к API.
    - Пример с использованием Fetch:
    ```ts
            interface RateResponse {
            rate: number;
        }
      

      const fetchRate = async (): Promise<number> => {
        const response = await fetch('/api/rate');
        const data: RateResponse = await response.json();
        return data.rate;
      }
    ```
    - Не забудь указать библиотеки для установки:
      - npm install react
      - npm install axios (если используешь axios для запросов)

3. АРХИТЕКТУРА И МАСШТАБИРУЕМОСТЬ:
    - Организуй проект в виде монорепозитория или двух четких папок /client и /server.
    - Напиши краткую инструкцию (README), как запустить обе части.
    - Используй переменные окружения (.env) для хранения API ключей и портов.
    - Добавить возможность настройки для разных окружений (development, production).
    - Пример структуры репозитория:
      
      ```/client          # Frontend
        /src
          /components
          /assets
          index.tsx
          App.tsx
      /server          # Backend
        /src
          /controllers
          /services
          server.ts
      .env
      .gitignore
      README.md
      ```

Платон Федотов 丰, [24.12.2025 22:46]
4. ТЕСТИРОВАНИЕ И РАЗВЕРТЫВАНИЕ:
    - Добавить unit-тесты для Backend (например, используя jest или mocha). (не первая необходимость это можно доабавить позже!)
    - Настроить CI/CD pipeline для автоматического тестирования и деплоя. (не первая необходимость это можно доабавить позже!)

5. В ответе предоставь:
    1. Файловую структуру.
    2. Код серверной части (package.json, tsconfig.json, server.ts, services/rateService.ts).
    3. Код клиентской части (обновленный компонент с логикой Fetch).
    4. Инструкцию по установке зависимостей.
    5. Пример для запуска серверной и клиентской части.

