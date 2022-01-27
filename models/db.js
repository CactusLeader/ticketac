const mongoose = require('mongoose');

const options = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology : true
   }
mongoose.connect('mongodb+srv://mangotest:cecodemeprendlatete@cluster0.gj1m0.mongodb.net/Ticketac?retryWrites=true',
    options,        
    function(err) {
    if (err) {
        console.log(`error, failed to connect to the database because --> ${err}`);
        } else {
        console.info('*** Database Ticketac connection : Success ***');
        }
    }
);

module.exports = mongoose;