const request = require('request-promise-native')
const express = require('express');
const app = express();
const archiver = require('archiver');
const Swagger = require('swagger-client');
const {URL} = require('url');
const bodyparser = require('body-parser');
const session = require('express-session');

const {
  KALEIDO_REST_GATEWAY_URL,
  KALEIDO_AUTH_USERNAME,
  KALEIDO_AUTH_PASSWORD,
  PORT,
  FROM_ADDRESS,
  CONTRACT_MAIN_SOURCE_FILE,
  CONTRACT_CLASS_NAME
} = require('./config');

// Set up the session used for logging in/out
app.use(session({
    cookieName: 'fortissimo',
    secret: 'thisissuchagreatsecret',
    duration: 60 * 60 * 1000, // Hour long session
    activeDuration: 15 * 60 * 1000, // 15 minue active extension
    resave: false,
    saveUninitialized: false,
}));

// Addresses of the fortissimo contract used for all transactions
let tokenContractAddress = '0xa2a98f63e074ed6269ff9c2e42dd9e30e7012244';

// Clients for the contracts
let tokenClient;
let payToViewClient;

app.use(bodyparser.json());

// Middleware redirects users that are not logged in to the login page
app.use(function requireLogin(req, res, next) {
    if (req.path !== "/login" && !req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
});

app.get("/login", async(req, res) => {
    res.status(200).send("You need to login.");
});

// Create a session variable representing the logged in user
app.post("/login", async(req, res) => {
    try {

        // Reset the session variable for a new login
        if (req.session) {
            delete req.session.user;
        }

        // Set "user" on the session to the address
        req.session.user = req.body.address;

        console.log("Logged in as: " + req.session.user);
        res.status(200).send(req.session.user);
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// View the information of the currently logged in user
app.get("/account", async(req, res) => {
    try {
        res.status(200).send(req.session.user);
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Logout of the current session
app.get("/logout", async(req, res) => {
    try {
        if (req.session.user) {
            console.log("Logged out for: " + req.session.user);
            delete req.session.user;
        }
        res.redirect("/login");
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Request to get the balance of an address
app.get('/fortissimo/balance/', async(req, res) => {
    try {
        let postRes = await tokenClient.apis.default.balanceOf_get({
            address: tokenContractAddress,
            body: {},
            "_owner": req.session.user,
            "kld-from": req.session.user,
        });
        console.log("Balance for: " + req.session.user + ". Amount: " + postRes.body["balance"]);
        res.status(200).send(postRes.body);
    }
    catch(err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Request to send an approve
app.post('/fortissimo/approve', async(req, res)=> {
    try {
        let postRes = await tokenClient.apis.default.approve_post({
            address: tokenContractAddress,
            body: {
                "_spender": req.body.spender,
                "_value": req.body.value,
            },
            "kld-from": req.session.user,
            "kld-sync": true,
        });
        console.log("Approval from: " + req.session.user + ". Spender: " +
                    req.body.spender +". Price: " + req.body.value);
        res.status(200).send(postRes.body);
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Request to purchase access to a secret contract
app.post('/paytoview/:contract_address/buySecret', async(req,res) => {
    try {
        let postRes = await payToViewClient.apis.default.buySecret_post({
            address: req.params.contract_address,
            body: {},
            "kld-from": req.session.user,
            "kld-sync": true,
        });
        console.log("User : " + req.session.user + " purchased secret: " + req.params.contract_address);
        res.status(200).send(postRes.body);
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Request to see the secret of a secret contract
app.get('/paytoview/:contract_address/secret', async(req, res) => {
    try {
        let getRes = await payToViewClient.apis.default.seeSecret_get({
            address: req.params.contract_address,
            body: {},
            "kld-from": req.session.user,
        });
        console.log("User: " + req.session.user + " requested secret: " + req.params.contract_address);
        res.status(200).send(getRes.body);
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Create a new instance of paytoview
app.post('/paytoview', async(req, res) => {
    console.log("PayToView user: " + req.session.user);
    console.log("Price: " + req.body.price);
    console.log("Secret: " + req.body.secret);
    let postRes;
    try {
        postRes = await payToViewClient.apis.default.constructor_post({
            "kld-from": req.session.user,
            body: {
                "_ffCtrAddr": tokenContractAddress,
                "_price": req.body.price,
                "_secret": req.body.secret,
            },
        });
        console.log("PayToView created by: " + req.session.user);
        res.status(200).send(postRes.body);
    }
    catch (err) {
        console.log(postRes);
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

async function init() {

    let tokenAPIURL = 'https://u0zn6f7wvi-u0zl2kses9-connect.us0-aws.kaleido.io/gateways/u0tdtmyf12?swagger';
    let payToViewAPIURL = 'https://u0zn6f7wvi-u0zl2kses9-connect.us0-aws.kaleido.io/gateways/u0vqg7j1jk?swagger';

    // Get the swagger client for fortissimo deployed to an environment
    tokenClient = await Swagger(tokenAPIURL, {
        requestInterceptor: req => {
            req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
        }
    });

    // Get the swagger client for the paytoview contract deployed to an environment
    payToViewClient = await Swagger(payToViewAPIURL, {
        requestInterceptor: req => {
            req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
        }
    });

    // Start listening
    app.listen(PORT, () => console.log(`Kaleido DApp backend listening on port ${PORT}!`))
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = {
  app
};
