<div align="center">
  <a href='https://soen-390.vercel.app'>
    <img src='https://imgur.com/Z5FMZy8.png'>
  </a>
</div>

<div align='center'>
<br/>

**ProSpects** is a LinkedIn clone built for the SOEN 390 class at Concordia University. It is a full-stack web application built with Next.js, React, and TypeScript.

---

### Built With

[<img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" />](https://vercel.com/homes)
[<img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" />](https://nextjs.org/)
[<img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />](https://reactjs.org/)
[<img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />](https://tailwindcss.com/)
[<img src="https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white" />](https://www.mysql.com/)
[<img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" />](https://www.prisma.io/)
[<img src="https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white" />](https://jestjs.io/)
[<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />](https://www.typescriptlang.org/)

---

</div>

## 🎓 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before working on this project, ensure you have the following:

#### **Node.js v16+**

<table>
  <tr>
    <td><b>nvm (recommended)</b></td>
    <td><a href="https://github.com/coreybutler/nvm-windows">Windows</a></td>
    <td><a href="https://github.com/nvm-sh/nvm">Mac/Linux</a></td>
  </tr>
  <tr>
    <td><b>Node.js</b></td>
    <td style='text-align: center' colspan="2"><a href="https://nodejs.org/en/download/">Download</a></td>
  </tr>
</table>

#### [**Git**](https://git-scm.com/downloads)

#### [**VSCode (optional but recommended)**](https://code.visualstudio.com/download)

Alongside VSCode, the following extensions will improve your development experience:

- [**ESLint**](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [**Prettier**](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [**Error Lens**](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)
- [**GitLens**](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [**Prisma**](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- [**Tailwind CSS IntelliSense**](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [**GitHub Copilot**](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)

### Installation

1. Clone the project

```bash
  git clone https://github.com/seinaas/SOEN-390.git
```

2. Go to the project directory

```bash
  cd SOEN-390
```

3. Install dependencies

```bash
  npm install
```

4. Create a `.env` (see [**Environment Variables**](#environment-variables) for more details)

5. Start the server

```bash
  npm run dev
```

## 🚧 Environment Variables

You can add environment variables to the project by creating a `.env` file in the project's root directory.

Environment variables in this project are type-safe, meaning you can't assign any value to any variable. As a consequence, these variables will show up as intellisense autocomplete options and, when they are used in code, TypeScript will know what type they are and can treat them appropriately.

To enforce this, we have to keep an environment schema up to date with any variable added to the `.env` file. This schema can be found in `/src/env/schema.mjs/`. Every variable that is present in the schema **MUST** be present in the `.env` as well for the project to run.

An example `.env` file can be found in the project.

## 🛠️ Running Tests

The project currently support 3 test types:

1. Unit Tests
2. Integration Tests
3. Component Tests

To run all tests, use

```bash
  npm run test
```

### Unit Tests

Jest is used to write unit tests. These tests mainly cover the backend code (i.e., everything in `src/server`). These tests can be found in the `tests/server` directory.

When writing unit tests, you can call tRPC routes by importing the `trpcRequest` utility function from `tests/utils.ts`. This function accepts a session object so you can pass a mocked authenticated user, and it includes a mocked prisma instance in its context so you can simulate database requests.

To run unit tests, use

```bash
  npm run test:Jest
```

### Component Tests

Component tests are handled by Cypress. These tests allow you to test components in an isolated environment. The main use case is for reusable components created in the `src/components` directory. These tests can be found in the `tests/cypress/component` folder.

To run component tests, use

```bash
  npm run test:cypress:component
```

Alternatively, you can run component tests through the Cypress GUI with

```bash
  npm run cypress
```

### E2E Tests

Like component tests, E2E tests are handled by Cypress. These tests are meant to simulate real-life use-cases of users interacting with the website. They can be found in the `tests/cypress/e2e` folder.

To run E2E tests, use

```bash
  npm run test:cypress:e2e
```

Alternatively, you can run E2E tests through the Cypress GUI with

```bash
  npm run cypress
```

### Coverage Reports

It is important to consistently run coverage reports to ensure your changes are properly tested. The coverage goal for this project is **80%**. You can receive a full coverage report by running

```bash
  npm run test
  npm run coverage
```

You will see a summary of the report directly in your terminal, but you can obtain more information by opening `coverage/index.html`.

## 📝 Pull Requests

When creating a pull request, please follow the following guidelines:

1. Make sure your branch is up to date with the `main` branch.
2. Make sure your code is properly formatted and linted.
3. Make sure your code is properly tested and that the coverage report is at least 80%.
4. Name your pull request with the following format:  
   `[fix/feat]: <issue ID> - <short description of the issue>`.

## 📜 Available Scripts

You can run the following scripts with `npm run <script>`.

| Script                   | Description                        |
| ------------------------ | ---------------------------------- |
| `build`                  | Builds the project for production. |
| `dev`                    | Starts the development server.     |
| `start`                  | Starts the production server.      |
| `lint`                   | Runs ESLint on the project.        |
| `prettier`               | Runs Prettier on the project.      |
| `cypress`                | Runs Cypress in the GUI.           |
| `cypress:headless`       | Runs Cypress in headless mode.     |
| `test:cypress:component` | Runs component tests.              |
| `test:cypress:e2e`       | Runs E2E tests.                    |
| `test:jest`              | Runs unit tests.                   |
| `test`                   | Runs all tests.                    |
| `coverage`               | Generates a coverage report.       |

## 📦 Deployment

Vercel is used to deploy the project. The project is automatically deployed to production on every push to the `main` branch. A preview deployment is created for every pull request. You can access the preview deployment by clicking on the "Details" link next to the Vercel check in the pull request.

---

## 📫 Authors

- Seina Assadian | [@seinaas](https://www.github.com/seinaas)
- William Tremblay | [@WillTrem](https://github.com/WillTrem)
- Samy Refik | [@SamRfk](https://github.com/SamRfk)
- Kevin Marnet Scanlan | [@GuardiansAscend](https://github.com/GuardiansAscend)
- Lyuba Georgieva | [@lyubageorgieva](https://github.com/lyubageorgieva)
- Maria Rivas | [@MariaR001](https://github.com/MariaR001)
- Mohammad Afandi | [@AfandiM](https://github.com/AfandiM)
- Mohsen Lhaf | [@mohsen220](https://github.com/mohsen220)
- Alexandra Zana | [@Alexicazana](https://github.com/Alexicazana)
