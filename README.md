# WMS Reference

## Общая база статей

Пользовательские статьи сохраняются в облачной базе Supabase через Vercel API-функцию. Все пользователи, которые открывают одну и ту же Vercel-ссылку, видят одни и те же созданные статьи.

Текущая ссылка приложения:

```text
https://wms-reference-git-main-sashkadurneva-gifs-projects.vercel.app/
```

### Запуск разработки

```bash
npm start
```

Команда запускает React-приложение локально: http://localhost:3000.

### Настройка Supabase

1. Создайте бесплатный проект в Supabase.
2. Откройте SQL Editor.
3. Выполните SQL из файла `supabase/schema.sql`.
4. В Vercel добавьте переменные окружения:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` должен храниться только в Vercel Environment Variables. Не добавляйте его в код и не коммитьте в git.

`OPENAI_API_KEY` нужен для кнопки `Улучшить с ИИ` при добавлении статьи. Ключ тоже хранится только в Vercel Environment Variables. Опционально можно указать модель:

```text
OPENAI_MODEL=gpt-4.1-mini
```

### Где лежат данные

Статьи лежат в таблице Supabase:

```text
public.articles
```

### Как открывают другие пользователи

Другим пользователям ничего устанавливать не нужно. Они открывают Vercel-ссылку в браузере:

```text
https://wms-reference-git-main-sashkadurneva-gifs-projects.vercel.app/
```

### Деплой

Vercel связан с GitHub-репозиторием. После коммита и push в ветку `main` Vercel соберет новую версию приложения.

Для проверки сборки локально:

```bash
npm run build
```

### Локальные API-функции

Обычный `npm start` запускает только React dev server. Vercel API-функции `api/articles.js` и `api/polish-article.js` работают на Vercel после деплоя. Для полноценной локальной проверки API можно использовать Vercel CLI и переменные окружения Supabase/OpenAI.

### Важное про доступ

Сейчас все посетители приложения смогут создавать, редактировать и удалять пользовательские статьи. Если нужно ограничить это право, следующим шагом надо добавить авторизацию или пароль на операции записи.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
