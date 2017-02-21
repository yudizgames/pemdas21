var database = require("../../config/database");
var mysql=require('mysql');
var connection=mysql.createPool(database.connection);
module.exports=connection;



