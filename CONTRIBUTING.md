# Contributing

## Before committing

We have adopted **[Conventional Commits](https://www.conventionalcommits.org)** as a ruleset for commit messages. In short, commit messages _must_ be formatted using one the following prefixes:

- `build` – for changes made to the build system
- `chore` – for changes that do not change production code
- `ci` – for changes made to Continuous Integration (CI) configuration
- `docs` – for updates made to the documentation
- `feat` – for newly introduced features
- `fix` – for bug fixes and patches
- `improvement` – for overall made improvements
- `perf` – for changes optimizing the overall performance
- `refactor` – for refactored code that does not change the public Discord bot
- `revert` – for when reverting back to a previous commit
- `style` – for code style changes (such as indentation)
- `test` – for when adding tests or assertions

Examples:

`feat: add ...`

`refactor: remove unused var`

You may also specify a scope. We **strongly** encourage you to use scopes, because it's an excellent way of determining what part of the codebase has been changed.

Example:

`fix(magister): fix bug ....`

## Requirements

- Typescript
- Node.js
