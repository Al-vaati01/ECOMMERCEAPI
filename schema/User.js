import dbClient from '../utils/db.js';

const user = new dbClient.con.Schema({
    username: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    }
});

const accessTokens = new dbClient.con.Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

const admin = new dbClient.con.Schema({
    username: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});

const User = dbClient.con.model('users', user);
User.on('index', function (err) {
    if (err) console.error(err);
});
const Admin = dbClient.con.model('admins', admin);
Admin.on('index', function (err) {
    if (err) console.error(err);
});
const AccessToken = dbClient.con.model('accessTokens', accessTokens);
AccessToken.on('index', function (err) {
    if (err) console.error(err);
});

export { User, Admin, AccessToken};
