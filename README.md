# Kendo Tournament App

This document provides instructions for setting up the app, our development workflow, and deployment guidelines.

## How to Start the App

The project is divided into three main components: [Frontend](https://github.com/Kendoers/Kendo-tournament-app/tree/development/frontend), [Backend](https://github.com/Koodikukkaro/Kendo-tournament-app/tree/development/backend/server), and [Database](https://github.com/Kendoers/Kendo-tournament-app/tree/development/backend/database). Instructions for setting up each component are available in their respective README files.

## Development Workflow

This project follows a Git Workflow. For reference, you can check [this link](https://www.atlassian.com/git/tutorials/comparing-workflows), but the main idea is outlined below.

### Branching Strategy

We use a branch-based development workflow. Please follow these guidelines when creating branches:

* `main`: The main branch represents the production-ready code.
* `development`: The development branch is where feature branches are merged before going to production.
* Feature branches: Create a feature branch for each new feature or bug fix. Name it descriptively, such as `feature/add-authentication` or `bugfix/fix-broken-link`.

### Commit Guidelines

Follow these commit message guidelines:

* Use imperative verbs (e.g., "Add feature," "Fix bug," "Update documentation").
* Keep commits focused on a single task.

### Pull Request (PR) Process

1. Create a new branch for your feature or bug fix.
2. Commit and push your changes to your branch.
3. Open a pull request from your branch to the `develop` branch.
4. Ensure that your PR has a clear title and description.
5. Request code review from team members.

### Git Etiquette

* Avoid force pushing to shared branches (`main`, `develop`) unless necessary.
* Be mindful of the commit history; keep it clean and easy to follow.
* Use meaningful branch and commit messages.
* Communicate with team members to coordinate changes.

### Tools

* Docker Desktop

## Deployment

TODO: Add deployment instructions here.

## Use

The app is hosted on [app.kendoliiga.fi](app.kendoliiga.fi). 

The app consists of three main components: Users, Tournaments and Matches. 

### Users

To create or participate in tournaments, you need to create an account. The account creation requires some user data, i.e. name, email, phone number and dan rank. This data is used in the app (like names and rank) or by the tournament organizer to contact you regarding tournament participation (email and phone number). 

You can follow the tournaments and matches without an account.

### Tournaments

To create a tournament, tournament name, place, time and description are required to input in the tournament creation form. There are also some dropdowns to choose other required data, like tournament type, match length and the maximum number of participants. After a tournament is created, it can be seen in the "upcoming tournaments" tab. Every logged in user can sign up to the tournament with their profile data until the tournament starts. You can also see the details and other participants of the tournament by clicking the tournament card. As a tournament creator, it is possible to edit the tournament information or delete the tournament before it starts.

When the tournament starts, the matches are created automatically. By clicking the tournament card, you can see all the matches and the bracket or score table, depending on the tournament type. At this point, it's not possible to edit the tournament anymore.

There are four types of tournaments: Round robin, Playoff, Preliminary groups with playoff and Swiss. 

Round robin is where everyone plays against everyone. There are two tabs in the round robin view. In the score tab, you can see a table of all the participants' wins, losses, ties, points and ippons. On the matches tab, you can see all the matches sorted in upcoming, ongoing and past.

In playoff tournament, the participants are sorted in pairs randomly. The players in a pair play against each other and the winner advances to the next round, where new pairs are made from all the winners of the previous round. This is continued until there is only one match with one winner. There is only one view where you can see the bracket with the matches and the scores.

In a preliminary playoff, the first rounds of matches are a group stage. The amount of groups and the amount of players advancing from each group are specified when creating the tournament. Each participant plays against all the other participants in the same group. After all the group matches are finished, the specified amount of participants with the best scores advance to the playoff stage. The playoff stage is played similarly as the playoff tournament. 

A swiss tournament