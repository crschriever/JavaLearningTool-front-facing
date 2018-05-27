"use strict";
require("dotenv").config();
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const morgan = require("morgan");
const logger = require("./logger.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const userManager = require("./util/userManager");
const MongoStore = require("connect-mongo")(session);

const index = require("./routes/index");
const admin = require("./routes/admin");
const auth = require("./routes/auth");

const mongoose = require("mongoose");
const Category = require("./models/challenge_category.js");
const Challenge = require("./models/challenge.js");

if (process.env.MONGO_ROUTE) {
    mongoose.connect("mongodb://" + process.env.MONGO_ROUTE + "/JavaLearningTool", {
        useMongoClient: true
    });
} else {
    mongoose.connect("mongodb://" + "localhost/JavaLearningTool", {
        useMongoClient: true
    });
}

mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", logger.error.bind(logger, "connection error:"));

Category.count({}, function(err, count) {
    if (count == 0) {
        let cat = Category({
            title: "Basic Skills",
            description: "The basic skills any good programmer needs to know."
        });
        cat.save();
        logger.info("Adding Category");
    }
});

Challenge.count({}, function(err, count) {
    if (count == 0) {
        let chall = Challenge({
            name: "Hello World",
            description: 'Print out "Hello World" with a new line at the end.',
            difficulty: 1.0,
            defaultText:
                'public class Test {\n    public static void main(String[] args) {\n        // Print out "Hello World" here\n    }\n}',
            testFile: "HelloWorld"
        });
        chall.save();
        logger.info("Adding Challenge");
    }
});

const app = express();

// setup session cookies
if (process.env.SESSION_SECRET === undefined) {
    logger.warn("WARNING!! Session Secret is undefined.");
}

app.use(
    session({
        secret: process.env.SESSION_SECRET || "Super spooky secret don't tell",
        cookie: { maxAge: 1 * 60 * 60 * 1000 }, // 1 hour
        /*
    IMPORTANT: When https is in use set cookie.secure: true
    */
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 1.5 * 60 * 60 * 1000 // 1.5 hours
        })
    })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan("dev", { stream: logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/prod")));
app.use("/javadocs", express.static(path.join(__dirname, "public/javadocs")));

app.use(userManager.sessionInfoFiller);
app.use("/", index);
app.use("/admin", admin);
app.use("/auth", auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("404 Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    logger.error("An error occurred: " + err);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.LOGS === "dev" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error", {
        title: "Error",
        styles: ["mainStyle"]
    });
});

module.exports = app;
