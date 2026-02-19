# COMP3133 Assignment 1 – Employee Management System

**Student Name:** Gozde E Baran
**Student ID:** 101515982
**Course:** COMP3133 – Full Stack Development II

---

## Project Overview

A backend **Employee Management System** built with **Node.js**, **Express**, **GraphQL (Apollo Server)**, and **MongoDB**. Employee profile photos are stored on **Cloudinary**.

---

## Tech Stack

| Technology         | Purpose                         |
| ------------------ | ------------------------------- |
| Node.js            | Runtime environment             |
| Express.js         | Web framework                   |
| Apollo Server (v3) | GraphQL server                  |
| GraphQL            | API query language              |
| MongoDB Atlas      | Cloud database                  |
| Mongoose           | ODM for MongoDB                 |
| bcryptjs           | Password hashing                |
| Cloudinary         | Employee photo storage          |
| dotenv             | Environment variable management |

---

## Project Structure

```
101515982-COMP3133-Assignment1/
├── server.js               # Entry point
├── .env                    # Environment variables (not committed)
├── .gitignore
├── package.json
├── README.md
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   ├── User.js             # User schema/model
│   └── Employee.js         # Employee schema/model
└── graphql/
    ├── typeDefs.js         # GraphQL schema (types, queries, mutations)
    └── resolvers.js        # GraphQL resolvers (business logic)
```

---

## Sample Test User

Use these credentials to test the **login** query:

| Field    | Value                    |
| -------- | ------------------------ |
| Username | `testuser`               |
| Email    | `testuser@comp3133.com`  |
| Password | `Test1234!`              |

Create this user first with the **signup** mutation if it does not exist yet.

---
