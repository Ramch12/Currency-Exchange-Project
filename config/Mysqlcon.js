const { createConnection } = require('mysql2/promise');
async function connect() {
    const connect = createConnection({
        host: 'localhost',
        user: "root",
        password: "",
        database: "trade"
    });
    return connect;
}

module.exports=connect;