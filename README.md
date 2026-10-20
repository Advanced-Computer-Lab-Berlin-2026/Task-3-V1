# Task 3 (Variant): Campus Lost & Found — with Authentication

Task 1's Campus Lost & Found API with JWT login/register on the server and a
React client with a login flow.

## Running it

```
npm run install:all   # installs server/ and client/ (npm workspaces)
npm run dev           # API on :4000, client on :5175
```

Create `server/.env` yourself with:

```
PORT=4000
MONGO_URI=mongodb://tasks:pass1234@ac-j3acrgb-shard-00-00.lueesfz.mongodb.net:27017,ac-j3acrgb-shard-00-01.lueesfz.mongodb.net:27017,ac-j3acrgb-shard-00-02.lueesfz.mongodb.net:27017/?ssl=true&replicaSet=atlas-6to6iy-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
```

`JWT_SECRET` is the key the server signs and verifies login tokens with —
anyone who knows it can forge a token for any user, so replace `change-me`
with a long random value. Generate one with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output after `JWT_SECRET=` and restart the server. Changing the
secret logs everyone out, because tokens signed with the old one stop being
valid.

## What was added on top of Task 1

### Server
- `POST /api/auth/register`, `POST /api/auth/login` → `{ token, user }`;
  `GET /api/auth/me` (requires token).
- `middleware/auth.js` — `requireAuth` reads `Authorization: Bearer <token>`,
  verifies it with `JWT_SECRET` and sets `req.user = { id, name }`.
- `User.comparePassword()`; the `password` field stores the bcrypt hash.
- Items: reading (`GET /` with its `status`/`category` filters, `GET /:id`)
  stays public. Creating, editing and deleting require a token. `reportedBy`
  is set from `req.user.id` (sending it in the body is rejected), and only
  the person who reported an item can edit or delete it (`403` otherwise).
  Items are populated with the reporter's `name`/`email`.
- Users: `POST /api/users` was removed (use `/api/auth/register`);
  `PATCH`/`DELETE /api/users/:id` require a token and only work on your own
  account.

### Client (`client/`, Vite + React + Tailwind)
- `AuthContext` stores the token in `localStorage`, restores the session via
  `/auth/me`, and `api.js` attaches the token to every request.
- Pages: Login, Register, Items (list with status/category filters,
  edit/delete on items you reported). ItemForm is left for you — see below.

## Assignment: build the "Report an Item" screen

The backend and most of the frontend are already working. You only need to
finish **`client/src/pages/ItemForm.jsx`**. It serves both the "report" screen
and the "edit" screen:

- `/items/new` → report a new item
- `/items/:id` → edit an existing item

Both routes already require login, because they're wrapped in
`ProtectedRoute`. The "Report Item" link in the navbar and the "Edit" button
on each item card already point to this page.

This is how the finished screen should look (with sample data filled in):

![Finished page](docs/report-item.png)

### Part 1: build the form fields
Add the following fields and keep each one in sync with the `form` state
object:

| Field | Input type | Allowed values / example |
|---|---|---|
| `title` | text box | e.g. `Black backpack` |
| `status` | dropdown | `lost`, `found`, `claimed` |
| `category` | dropdown | `electronics`, `clothing`, `documents`, `accessories`, `other` |
| `location` | text box (optional) | e.g. `Library 2nd floor` |
| `description` | multi-line text area (optional) | free text |

The dropdown values must be spelled **exactly** as listed above, because the
API rejects any other value. Write the `onChange` handler so that typing in
or selecting any field updates the matching key in `form`.

### Part 2: submit a new report
When the form is submitted and there is no `id` in the URL:
- Send a `POST` request to `/api/items` with the body
  `{ title, status, category, location, description }`.
- Use the shared `api` instance from `client/src/api.js`. It adds your login
  token automatically.
- If the request succeeds, send the user back to `/items`.
- If it fails, show the `message` returned by the server in the red error
  area.

Check that your error handling works:
- A title with a single character gives **400 Bad Request**.
- Submitting the same title at the same location twice gives
  **409 Conflict**.

⚠️ **Never include `reportedBy` in the request.** The server works out who
the reporter is from your token, and it refuses any request that tries to set
it.

### Part 3: support editing
When the URL contains an `id`:
- Fetch the item with `GET /api/items/:id` when the page opens.
- Fill the form with the item's `title`, `status`, `category`, `location` and
  `description`.
- On submit, send `PATCH /api/items/:id` instead of `POST`. This is also how a
  user marks an item as **claimed**.
- If the user tries to edit an item someone else reported, the server
  responds with **403 Forbidden**. Show that message in the error area too.

## Expectations
You may use AI tools to help you. In the review, though, you must be able to
explain **every line** of `ItemForm.jsx`: what it does, why it's needed, and
what would break if it were removed.
