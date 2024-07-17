const mongoose = require('mongoose');
// Defines an object dbConfig that holds the MongoDB connection URL and the database name.
const dbConfig = {
    url: 'mongodb://localhost:27017', // MongoDB URL
    dbname: 'shopping', // Database name
};

//Initializes a state object to store the database connection. Initially, db is set to null.
const state = {
    db: null,
};

// Connect function to establish a connection to the database
module.exports.connect = function (done) {//Defines a connect function that takes a done callback as an argument.
    const url = `${dbConfig.url}/${dbConfig.dbname}`; // Construct the full MongoDB URL

    mongoose.connect(url)
        .then((connection) => { //If the connection is successful, stores the database connection in the state.db and calls the done callback with no arguments to signal success.
            state.db = connection.connection.db; // Store the database connection in the state
            done(); // Callback to signal completion
        })
        .catch((err) => {
            done(err); // Callback with error if connection fails
        });
};

// Function to get the current database connection
module.exports.get = function () {
    return state.db; // Return the stored database connection
};
