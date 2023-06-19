Use Express to Create a Server
Create an Express server listening on port 3000 with one route.
To verify your work locally for just this module, run the following command in a terminal: `npm run test:module1`. The output will let you know which tasks are passing and failing.

To verify your work on Pluralsight, commit and push your changes to GitHub and click the Check My Work button.
./test/module1/
module1-solution

File Handling and Routing
Read two files from the files system and display the data in three different routes.
To verify your work locally for just this module, run the following command in a terminal: `npm run test:module2`. The output will let you know which tasks are passing and failing.

To verify your work on Pluralsight, commit and push your changes to GitHub and click the Check My Work button.
./test/module2/
module2-solution

Handling Form Data
Gather data from a form post request and write the data to a file.
To verify your work locally for just this module, run the following command in a terminal: `npm run test:module3`. The output will let you know which tasks are passing and failing.

To verify your work on Pluralsight, commit and push your changes to GitHub and click the Check My Work button.
./test/module3/
module3-solution

Creating a Data Access Library
Move all file operations to a common file and use that file across the application.
To verify your work locally for just this module, run the following command in a terminal: `npm run test:module4`. The output will let you know which tasks are passing and failing.

To verify your work on Pluralsight, commit and push your changes to GitHub and click the Check My Work button.
./test/module4/
module4-solution

Using the Express Router
Use the Express router to make the application more modular.
To verify your work locally for just this module, run the following command in a terminal: `npm run test:module5`. The output will let you know which tasks are passing and failing.

To verify your work on Pluralsight, commit and push your changes to GitHub and click the Check My Work button.
./test/module5/
module5-solution

Require Built-in Libraries
In `app.js` require the built-in library `fs` and store a reference to it in a `const` called `fs`. Next, require the built-in library `path` and store a reference to it in a `const` called `path`.
@app-require-built-ins

Require the Express Framework
In `app.js`, require the express framework and store a reference to it in a `const` called `express`. Next, call the express function and store it in a `const` called `app`.
@app-require-express-const-app

Configure the View Directory and Engine
Still in app.js, use the `set` function of your newly created `app` to configure the directory where our `views` can be found. **Hint: `path.join()` & `__dirname`**

Using the same `set` function, set the `view engine` to `ejs`.
@app-set-views-directory-engine

Configure the Static Directory
All of our CSS/JS for the client-side is found in the `public` directory. We need to point express to `public`.
@app-use-express-static

Create the Index View File
Create a new file called `index.ejs` in the `src/views/` directory.
@index-ejs-create-view-file

Create the Index View
In the newly created file `index.ejs` complete the following:

- Include `header.ejs` **Hint: <%- %>**
- Add a `div` element with a class of `container`.
- In the container div display the value of the `title` key in an `h1` element. **Hint: <%= %>**
- Add an anchor element below the `h1` that points to the `/profile` URL path, and has the text content `Profile`.
- Below the container div add a line break and another anchor element that points to the `/transfer` URL path with the text content `Transfer`.
- Include `footer.ejs` **Hint: <%- %>**
@index-ejs-create-view

Create the Index Route
In `app.js` create a `get` route that points at the root URL path '/'. Render the `index` view and pass an object with a single key value pair, `title: 'Index'`.

**Hint: render is a function on the response object.**
@app-get-index-route

Create a Server
In `app.js` use the `listen` function to create a server that listens on port `3000` and then prints the message `PS Project Running on port 3000!` to the console after the server is created.
@app-listen-console-log

Read Account Data
In `app.js` above the index route, use the `readFileSync` function of the built-in `fs` library to read the contents of the file located at `src/json/accounts.json`.  **Note: read the file with the `UTF8` encoding.**

Declare a `const` called `accountData` to store the contents of the file. `accountData` now contains JSON, use `JSON.parse` to convert it to a javascript object.

Declare a `const` called `accounts` to store this javascript object.
@app-read-account-data

Read User Data
In `app.js` near the index route, use the `readFileSync` function of the built-in `fs` library to read the contents of the file located at `src/json/users.json`.  **Note: read the file with the `UTF8` encoding.**

Declare a `const` called `userData` to store the contents of the file. `userData` now contains JSON, use `JSON.parse` to convert it to a javascript object.

Declare a `const` called `users` to store this javascript object.
@app-read-user-data

Update the Index Route
In `app.js` update the object passed to the existing index route. The `title` should be `Account Summary`, and a new key value pair should be added, `accounts: accounts`.
@app-update-index-route

Update the Index View
In `index.ejs` and after the container div, add the ejs markup to include the `summary` view for each account in the `accounts` variable: savings, checking, and credit. **Hint: you will have three include statements(`<%- %>`), each `include` function will be passed a different account, i.e `{ account: accounts.checking }`.**
@index-ejs-update-view

Create the Savings Account Route
In `app.js` near the index route, create a `get` route that points at the `/savings` URL path. Render the `account` view and pass an object with the following key value pair:

- `account: accounts.savings`
@app-get-savings-account-route

Create the Checking & Credit Routes
Now that you have created the savings account route, create similar routes for the checking and credit accounts in the `app.js` file.
@app-get-other-account-routes

Show Account Transactions
In `account.ejs` after the header markup, add the ejs markup to include the `transactions` view. Pass the include function an object with the following key value pair:

- `account: account`
@account-ejs-show-transactions

Create the Profile View File
Create a new file called `profile.ejs` in the `src/views/` directory.
@profile-ejs-create-view-file

Create the Profile View
@profile-ejs-create-view In the newly created file `profile.ejs` complete the following:

- Include `header.ejs` **Hint: <%- %>**
- Add an `h1` element with the text content `Profile`
- Add a `div` element below the `h1` that displays each detail of the `user` object (passed to the view in the next step) on a new line (wrap each detail in a `p` element). The details are user.name, user.username, user.phone, user.email, and user.address.
- Below the `div` add a line break, then an anchor element that points to the root URL path and has the text content `Back to Account Summary`.
- Include `footer.ejs` **Hint: <%- %>**
@profile-ejs-create-view

Create the Profile Route
In `app.js` below the account get routes create a `get` route that points at the `/profile` URL path. Render the `profile` view and pass an object with the following key value pair:

- `user: users[0]`
@app-get-profile-route

URL Encoded Middleware
In `app.js` near your other app.use statement add express middleware to handle POST data. With the `use` function add the `express.urlencoded` middleware to `app`. Make sure to set the `extended` option to `true`.
@app-urlencoded-form-data

Create the Transfer GET Route
Near your other routes in `app.js` create a `get` route that points to the `/transfer` URL path. It should render the `transfer` view.
@app-get-transfer-route

Update the Transfer View
In `transfer.ejs` in the `src/views/` directory complete the following:

- Add the necessary attributes to the `transferForm` so that it posts to a transfer route.
- Add a `name` and `id` attribute with a value of `from` to the first select.
- Add a `name` and `id` attribute with a value of `to` to the second select.
@transfer-ejs-update-view

Create the Transfer POST Route
Switch back to `app.js` and create a `post` route that points to the `/transfer` URL path. We will fill in the body of the function for this route in the next few steps.
@app-post-transfer-route

Calculate and Set the From Balance
Still in `app.js` and in the function body of the post route we are going to calculate the new balances for the account we are transferring from.

We have several values that have been entered into the HTML form in `transfer.ejs`. Upon form submission the request body will contain `from`, `to`, and `amount`. Current account balances are stored in the `accounts` object.

As an example to access the current balance for the savings account use `accounts["savings"].balance`. Using these values, calculate the new balance of the account we are transferring **from**. Then set the balance to that amount.
@app-post-transfer-route-from-balance

Calculate and Set the To Balance
Still in `app.js` and in the function body of the post route we are going to calculate the new balances for the account we are transferring to.

We have several values that have been entered into the HTML form in `transfer.ejs`. Upon form submission the request body will contain `from`, `to`, and `amount`. Current account balances are stored in the `accounts` object.

As an example to access the current balance for the savings account use `accounts["savings"].balance`. Using these values, calculate the new balance of the account we are transferring **to**. Then set the balance to that amount. **Hint: you will need to use `parseInt()`**
@app-post-transfer-route-to-balance

Convert Account Data to JSON
Still in `app.js` and in the function body of the post route, convert the `accounts` javascript object to a string using the `JSON.stringify` function save this string in a variable called `accountsJSON`.
@app-post-transfer-route-convert-json

Write Account Data to JSON file
Still in `app.js` and in the function body of the post route, use the `writeFileSync` function of the built-in `fs` library to write the variable `accountsJSON` to the file located at `json/accounts.json`.

Notes:

- If at any point `accounts.json` gets overwritten and you would like the original back copy the JSON from `account_backup.json` to `account.json`
- Specify the absolute file path using `path.join` & `__dirname`
- Write the file with the `UTF8` encoding.
@app-post-transfer-route-write-json

Redirect with a Message
Still in `app.js` and in the function body of the post route, render the `transfer` view and pass an object with the following key value pair:

- `message: "Transfer Completed"`
@app-post-transfer-route-redirect

Add Payment Feature
The payment feature of the application is similar to the transfer feature. Add this new feature using this general outline of the steps:

- Near your existing routes in `app.js` create a get route with a URL path of `/payment` that renders the `payment` view and passes in an object with a key-value pair of `account: accounts.credit`.
- Below the payment get route create a post route with a URL path of `/payment` and an empty function.

- In the body of the payment post route function:
  - Subtract `req.body.amount` from `accounts.credit.balance` and save it back to `accounts.credit.balance`
  - Add `req.body.amount` to `accounts.credit.available` and save it back to `accounts.credit.available` remember to use `parseInt()` on both values when adding.
  - Convert the `accounts` javascript object to a JSON string and save it to a variable called `accountsJSON`
  - Write `accountsJSON` to a file. **Note: write the file with the `UTF8` encoding.**
  - Render the `payment` view and pass an object with the following key value pairs, `{ message: "Payment Successful", account: accounts.credit }`
@app-payment-feature

Create a library file
Create a new file called `data.js` in the root of the `src/` directory.
@data-js-create-file

Require Built-in Libraries
In `data.js` require the built-in library `fs` and store a reference to it in a `const` called `fs`. Next, require the built-in library `path` and store a reference to it in a `const` called `path`.
@data-js-require-built-ins

Transition Account Data to Data Library
In `app.js` locate the lines that are responsible for reading and parsing JSON from the `src/json/accounts.json` file. Copy and paste them to the new `data.js` file below the require statements.
@data-js-transition-const-accounts

Transition User Data to Data Library
In `app.js` locate the lines that are responsible for reading and parsing JSON from the `src/json/users.json` file. Copy and paste them to the new `data.js` file below the `accounts` const.
@data-js-transition-const-users

Write JSON Function
In `data.js` below the account and user data lines create a function called `writeJSON`. **Hint: It is best to use ES6 arrow style function (=>).**
@data-js-write-json-function

Write JSON Function Body
In `app.js` locate the lines in the `transfer` post route function body that are responsible for writing JSON data to a file. **Hint: there are two lines.** Copy these lines to the body of the `writeJSON` function in the `data.js` file.
@data-js-write-json-function-body

Export Data and Function
In `data.js` use `module.exports` to export an object containing the constants `accounts`, `users`, and the `writeJSON` function.
@data-js-exports-data

Require Data Library
Back In `app.js` require `data.js` and at the same time use object destructing to create three constants for `accounts`, `users`, and `writeJSON`.

Remove the lines in `app.js` that create the `accountData`, `accounts`, `userData`, and `users` consts.

`accounts`, `users`, and the `writeJSON` function are now brought in by the require statement. **Note: use relative paths to require the data module `'./data'`**
@app-js-require-data-js

Function Call Transfer
In `app.js` locate the lines in the `transfer` post route function body that are responsible for writing JSON data to a file and replace them with a call to the `writeJSON()` function.
@app-js-call-write-json-transfer

Function Call Payments
In `app.js` locate the lines in the `payment` post route function body that are responsible for writing JSON data to a file and replace them with a call to the `writeJSON()` function.
@app-js-call-write-json-payment

Create a Account Routes File
Create a new file called `accounts.js` in the directory `src/routes/` (you will need to create this directory).
@routes-accounts-js-create-file

Require Express
In the new `accounts.js` require the express framework and store a reference to it in a `const` called `express`.  Next, call the `express.Router()` function and store it in a `const` called `router`.
@routes-accounts-js-require-express

Require Data Library
In `accounts.js` require `data.js` and at the same time use object destructuring to create one constant called `accounts`. **Note: use relative paths to require the data module. Use `'../data'` since it is one level up.**
@routes-accounts-js-require-data

Move Account Routes
In `app.js` locate the savings, checking, and credit get routes, cut and paste these routes in `accounts.js` below the require statements. Now in `accounts.js` update the routes to be part of the router by replacing `app.get` with `router.get`.
@routes-accounts-js-move-routes

Export the Router
In `accounts.js` export the `router` using the `module.exports` syntax.
@routes-accounts-js-export-router

Create a Services Routes File
Create a new file called `services.js` in the directory `src/routes/`.
@routes-services-js-create-file

Require Express
In the new `services.js` require the express framework and store a reference to it in a `const` called `express`.  Next, call the `express.Router()` function and store it in a `const` called `router`.
@routes-services-js-require-express

Require Data Library
In `services.js` require `data.js` and at the same time use object destructing to create two constants called `accounts` and `writeJSON`. **Note: use relative paths to require the data module. Use `'../data'` since it is one level up.**
@routes-services-js-require-data

Move Services Routes
In `app.js` locate the transfer and payment post and get routes, cut and paste these routes to `services.js` below the require statements. Now in `services.js` update the routes to be part of the router by replacing `app.get` with `router.get` and `app.post` with `router.post`.
@routes-services-js-move-routes

Export the Router
In `services.js` export the `router` using the `module.exports` syntax.
@routes-services-js-export-router

Require account routes
Switch to `app.js` and require the `./routes/accounts.js` file and store a reference to it in a `const` called `accountRoutes`.
@app-require-account-routes

Require services routes
Still in `app.js`, require the `./routes/services.js` file and store a reference to it in a `const` called `servicesRoutes`.
@app-require-services-routes

Use the Account Routes
In `app.js` where your account routes used to be, call the `use` function on `app` with two arguments. The first argument should be `/account` and the second is the `accountRoutes` const.
@app-use-account-routes

Use the Services Routes
In `app.js` where your transfer and payment routes used to be, call the `use` function on `app` with two arguments. The first argument should be `/services` and the second is the `servicesRoutes` const.
@app-use-services-routes

Update Views
Since all URL paths have changed for accounts and services we need to change the following views:

- In `src/views/index.ejs` change `href="transfer"` to `href="/services/transfer"`
- In `src/views/summary.ejs` change `href="<%= account.unique_name %>"` to `href="/account/<%= account.unique_name %>"`
- In `src/views/transfer.ejs` change `action="/transfer"` to `action="/services/transfer"`
- In `src/views/payment.ejs` change `action="/payment"` to `action="/services/payment"`
- In `src/views/account.ejs` change `href="/payment"` to `href="/services/payment"`
@views-update-for-routes
