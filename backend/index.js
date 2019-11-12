const request = require('request-promise-native')
const express = require('express');
const app = express();
const archiver = require('archiver');
const Swagger = require('swagger-client');
const {URL} = require('url');
const bodyparser = require('body-parser');
const session = require('express-session');

const {
  KALEIDO_AUTH_USERNAME,
  KALEIDO_AUTH_PASSWORD,
  PORT,
  API_TOKEN
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

// Swagger clients for the contracts
let tokenClient;
let payToViewClient;

// Kaleido settings
const kaleido_env = "u0zn6f7wvi";
const kaleido_cnst = "u0wer0z0ol";
const payToViewAPIPath = "u0dm7jynd6";

app.use(bodyparser.json());

/********** Account management **********/

// Middleware redirects users that are not logged in to the login page
app.use(function requireLogin(req, res, next) {
    if (req.path !== "/login" && !req.session.user) {
        console.log("Login redirect.");
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

        // Set user and node on the session
        req.session.user = req.body.address;
        req.session.node = req.body.node;

        // Create the API pathways for the user
        const tokenAPIPath = "u0tdtmyf12";
        let tokenAPIURL = 'https://' + kaleido_env + '-' + req.body.node +
            '-connect.us0-aws.kaleido.io/gateways/' + tokenAPIPath + '?swagger';
        let payToViewAPIURL = 'https://' + kaleido_env + '-' + req.body.node +
            '-connect.us0-aws.kaleido.io/gateways/'  + payToViewAPIPath + '?swagger';

        console.log("Swagger client pathways:");
        console.log(tokenAPIURL);
        console.log(payToViewAPIURL);

        // Get the swagger clients
        tokenClient = await Swagger(tokenAPIURL, {
            requestInterceptor: req => {
                req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
            }
        });
        payToViewClient = await Swagger(payToViewAPIURL, {
            requestInterceptor: req => {
                req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
            }
        });

        console.log("Logged in as: " + req.session.user + " on: " + req.session.node);
        res.status(200).send({"user": req.session.user, "node": req.session.node});
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// View the information of the currently logged in user
app.get("/account", async(req, res) => {
    try {
        res.status(200).send({user: req.session.user, node: req.session.node});
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
    }
    catch (err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

/********** Fortissimo coin management **********/

// Request to get the balance of the currently logged in user
app.get('/fortissimo/balance/', async(req, res) => {
    try {
        let postRes = await tokenClient.apis.default.balanceOf_get({
            address: tokenContractAddress,
            body: {},
            "_owner": req.session.user,
            "kld-from": req.session.user,
        });
        console.log("Balance for: " + req.session.user + ". Amount: " + postRes.body.balance);
        res.status(200).send(postRes.body);
    }
    catch(err) {
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Approve another entity to spend money on behalf of the current user
app.post('/fortissimo/approve', async(req, res)=> {
    console.log("Approval");
    console.log(req.body);
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

/********** PayToView contract management **********/

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
    console.log("Create paytoview");
    console.log(req.body);
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

// Returns PayToView instances that the current user may want to purchase
app.get('/shop', async(req, res) => {
    let getRes;
    try {
        getRes = await fetch("https://console.kaleido.io/api/v1/ledger/" +
            kaleido_cnst + "/" + kaleido_env + "/gateway_apis/" +
            payToViewAPIPath + "/contracts/", {
            headers: {'Authorization': 'Bearer ' + API_TOKEN}
        });
        var results = await getRes.json();

        // Filter listings made by the user
        var filteredContracts = results.contracts.filter(f => f.creator.toLowerCase() !== req.session.user.toLowerCase());

        // Pair all listings with their transactions
        for (var i = 0; i < filteredContracts.length; i++) {

            var txns = await fetch(
                "https://console.kaleido.io/api/v1/ledger/" + kaleido_cnst +
                "/" + kaleido_env + "/addresses/" + filteredContracts[i].address + "/transactions",
                {
                    headers: {'Authorization': 'Bearer ' + API_TOKEN}
                }
            );
            var txn_json = await txns.json();

            filteredContracts[i] = {
                address: filteredContracts[i].address,
                transactions: txn_json
            };
        }

        // Check listings for transaction indicating purchase by this user
        var avialableContracts = filteredContracts.filter(f => {

            // Check each transaction for the buyer
            for (x of f.transactions) {
                if (x.from.toLowerCase() === req.session.user.toLowerCase()) {
                    return false;
                }
            }

            // If no transaction mentions this user, they do not own this contract
            return true;
        }).map(f => f.address);

        // Get price and owner information for eligible contracts
        for (var i = 0; i < avialableContracts.length; i++) {

            let priceRes = await payToViewClient.apis.default.price_get({
                address: avialableContracts[i],
                body: {},
                "kld-from": req.session.user,
            });

            let ownerRes = await payToViewClient.apis.default.owner_get({
                address: avialableContracts[i],
                body: {},
                "kld-from": req.session.user,
            });

            avialableContracts[i] = {
                address: avialableContracts[i],
                price: priceRes.body.output,
                owner: ownerRes.body.output
            };
        }
        res.status(200).send(avialableContracts);
    }
    catch (err) {
        console.log(getRes);
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Returns PayToView instances already bought by the user
app.get('/my_purchases', async(req, res) => {
    let getRes;
    try {
        getRes = await fetch("https://console.kaleido.io/api/v1/ledger/" +
            kaleido_cnst + "/" + kaleido_env + "/gateway_apis/" +
            payToViewAPIPath + "/contracts/", {
            headers: {'Authorization': 'Bearer ' + API_TOKEN}
        });
        var results = await getRes.json();

        // Filter contracts made by the user
        var filteredContracts = results.contracts.filter(f => {
            return f.creator.toLowerCase() !== req.session.user.toLowerCase();
        });

        // Pair all contracts with their transactions
        for (var i = 0; i < filteredContracts.length; i++) {

            var txns = await fetch(
                "https://console.kaleido.io/api/v1/ledger/" + kaleido_cnst +
                "/" + kaleido_env + "/addresses/" +
                filteredContracts[i].address + "/transactions",
                {
                    headers: {'Authorization': 'Bearer ' + API_TOKEN}
                }
            );
            var txn_json = await txns.json();

            filteredContracts[i] = {
                address: filteredContracts[i].address,
                transactions: txn_json
            };
        }

        // Check listings for transaction indicating purchase
        var purchasedContracts = filteredContracts.filter(f => {

            // Check each transaction for the current user
            for (x of f.transactions) {
                if (x.from.toLowerCase() === req.session.user.toLowerCase()) {
                    return true;
                }
            }

            // If a transaction does not mention the current user, they do not own
            // this contract
            return false;
        }).map(f => f.address);

        // Get price and secret for purchased contracts
        for (var i = 0; i < purchasedContracts.length; i++) {

            let priceRes = await payToViewClient.apis.default.price_get({
                address: purchasedContracts[i],
                body: {},
                "kld-from": req.session.user,
            });

            let secretRes = await payToViewClient.apis.default.seeSecret_get({
                address: purchasedContracts[i],
                body: {},
                "kld-from": req.session.user,
            });

            purchasedContracts[i] = {
                address: purchasedContracts[i],
                price: priceRes.body.output,
                secret: secretRes.body._secret
            };
        }

        res.status(200).send(purchasedContracts);
    }
    catch (err) {
        console.log(getRes);
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

// Returns PayToView contracts created by the user
app.get('/my_listings', async(req, res) => {
    let getRes;
    try {
        getRes = await fetch("https://console.kaleido.io/api/v1/ledger/" +
            kaleido_cnst + "/" + kaleido_env + "/gateway_apis/" +
            payToViewAPIPath + "/contracts/", {
            headers: {'Authorization': 'Bearer ' + API_TOKEN}
        });
        var results = await getRes.json();

        // Filter listings made by other users
        var myContracts = results.contracts.filter(f => {
            return f.creator.toLowerCase() === req.session.user.toLowerCase();
        });

        // Get the price and secret for the user's contracts
        for (var i = 0; i < myContracts.length; i++) {

            let priceRes = await payToViewClient.apis.default.price_get({
                address: myContracts[i].address,
                body: {},
                "kld-from": req.session.user,
            });

            let secretRes = await payToViewClient.apis.default.seeSecret_get({
                address: myContracts[i].address,
                body: {},
                "kld-from": req.session.user,
            });

            myContracts[i] = {
                address: myContracts[i].address,
                price: priceRes.body.output,
                secret: secretRes.body._secret
            };
        }
        res.status(200).send(myContracts);
    }
    catch (err) {
        console.log(getRes);
        res.status(500).send({error: `${err.response && err.response.body && err.response.text}\n${err.stack}`});
    }
});

async function init() {
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
