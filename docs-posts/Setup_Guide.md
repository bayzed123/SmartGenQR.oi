---
slug: "development-setup-guide"
title: "Development Setup Guide"
description: "Learn how to set up and start contributing to SmartGen."
order: 1
---


This guide provides detailed instructions for setting up your development environment and getting started with contributing to SmartGen. Whether you're looking to run the project locally, add new features, or fix bugs, these steps will help you get up and running.

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js:** Version 18 or higher. Node.js is a JavaScript runtime environment essential for running build scripts and managing dependencies.
*   **pnpm:** A fast, disk space efficient package manager. It is used to install and manage project dependencies.
*   **Git:** A distributed version control system for tracking changes in source code during software development.
*   **Basic knowledge of React/TypeScript:** While SmartGen primarily uses vanilla JavaScript, some parts or future developments might involve React and TypeScript. Familiarity with these technologies will be beneficial for code contributions.

## Setting Up Your Development Environment

Follow these steps to set up your local development environment:

1.  **Fork the Repository:**
    *   Navigate to the [SmartGenQR.oi GitHub repository](https://github.com/bayzed123/SmartGenQR.oi).
    *   Click the `Fork` button in the top-right corner to create a copy of the repository under your GitHub account.

2.  **Clone Your Fork:**
    *   Open your terminal or command prompt.
    *   Clone your forked repository to your local machine using the following command:

    ```bash
    git clone https://github.com/YOUR_USERNAME/SmartGenQR.oi.git
    cd SmartGenQR.oi
    ```
    *Replace `YOUR_USERNAME` with your GitHub username.*

3.  **Add Upstream Remote:**
    *   Add the original SmartGen repository as an "upstream" remote. This allows you to fetch and merge changes from the main project.

    ```bash
    git remote add upstream https://github.com/bayzed123/SmartGenQR.oi.git
    ```

4.  **Install Dependencies:**
    *   Install the project dependencies using `pnpm`:

    ```bash
    pnpm install
    ```

5.  **Create a Feature Branch:**
    *   Before making any changes, create a new branch for your feature or bug fix. This keeps your changes organized and makes it easier to submit pull requests.

    ```bash
    git checkout -b feature/your-feature-name
    ```
    *Replace `your-feature-name` with a descriptive name for your branch (e.g., `feature/add-new-qr-type` or `fix/broken-link`).*

6.  **Start Development Server:**
    *   SmartGen is primarily a collection of static HTML files with client-side JavaScript. To view your changes locally, you can often just open the `index.html` file of the tool you are working on directly in your browser. For the blog or if you need a local server, you might use a simple static server (e.g., `npx serve` or a VS Code extension).
    *   For blog-related development, you would use the build script:

    ```bash
    node scripts/build-blog.js
    ```
    This will generate the static blog pages.

## Development Workflow

Once your environment is set up, follow these guidelines for your development workflow:

1.  **Make Your Changes:**
    *   Write clean, readable code.
    *   Follow the existing code style and conventions.
    *   Add comments for complex logic.
    *   Update documentation as needed (e.g., `README.md`, `WIKI.md`, or tool-specific documentation).

2.  **Test Your Changes:**
    *   Run tests to ensure your changes haven't introduced any regressions and work as expected.

    ```bash
    pnpm test
    pnpm check # For TypeScript checks
    pnpm format # To format your code
    pnpm build # To build the project
    ```

3.  **Commit Your Changes:**
    *   Use descriptive commit messages following the Conventional Commits specification. This helps in generating changelogs and understanding the history of changes.

    ```bash
    git add .
    git commit -m "feat: add new feature description"
    # Example commit types:
    # feat: New feature
    # fix: Bug fix
    # docs: Documentation updates
    # style: Code style changes
    # refactor: Code refactoring
    # test: Test additions/updates
    # chore: Build/dependency updates
    ```

4.  **Push and Create Pull Request:**
    *   Push your changes to your forked repository:

    ```bash
    git push origin feature/your-feature-name
    ```
    *   Go to your forked repository on GitHub and open a Pull Request (PR) to the `main` branch of the original `bayzed123/SmartGenQR.oi` repository.
    *   Provide a clear description of your changes, reference any related issues, and ensure all checklist items in the PR template are addressed.

## Pull Request Guidelines

Before submitting a Pull Request, please ensure:

*   All tests pass (`pnpm test`).
*   Code is formatted correctly (`pnpm format`).
*   TypeScript checks pass (`pnpm check`), if applicable.
*   The project builds successfully (`pnpm build`).
*   There are no console errors or warnings in the browser.

Your contributions are highly valued and help make SmartGen better for everyone!
[next](smartgen architecture.md)
