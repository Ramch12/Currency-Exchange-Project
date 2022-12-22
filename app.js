const express = require('express');
const app = express();
require('dotenv').config({ path: '' });
const error = require('./middleware/error');
const router = require('./router/router');

const PORT = process.env.PORT || 3000;



app.use(express.json());
app.use('/', router);
app.use(error);



app.listen(PORT, () => {
     console.log(`Your application is running on PORT ${PORT}`);
});



