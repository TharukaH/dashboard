const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

const livereload = require("livereload");
const liveReloadServer = livereload.createServer();

const connectLivereload = require("connect-livereload");
const { response } = require("express");
app.use(connectLivereload());

app.use(express.json());
app.use(cors());    // act like a cross platform of sending info from frontend to backend

//register database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'register'
})

//register
app.post('/register', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    db.query(
    'INSERT INTO form (username, password) VALUES (?, ?)', 
    [username, password],
    (err, result) =>{
        console.log(err);
    }
    );
});

//login
app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    db.query(
    'SELECT * FROM form WHERE username = ? AND password = ?', 
    [username, password],
    (err, result) =>{

        if (err) {
            res.send({err: err});
        }

        if(result.length > 0) {
            res.send(result);
            console.log(result);
            console.log(result.length);
        }
        else {
            console.log(result);
            console.log(result.length);
            res.send({message: "wrong username/password combination"});
        }        
    }
    );
});

//user maintain
app.get('/users', (req, res) => {
    const sqlUser = "SELECT * FROM form";
    db.query(sqlUser, (err, result) => {
        res.send(result);
        console.log(result);
    })
})

//business database
const con = {
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'business'
}
const salesdb = mysql.createPool(con);

//category counts
app.get('/counts', (req, res) => {
    // const sqlCount = "SELECT COUNT(id) as count_val FROM sales GROUP BY category";
    const sqlCount = 'call countVal()';
    salesdb.query(sqlCount, (err, result) => {
        res.send(result[0]);
    })
})

//query for sale chart
app.get("/sale", (req, res) => {
    // const sqlSelect = "SELECT id, sale FROM sales limit 100";
    const sqlSelect = "call discounts()";
    salesdb.query(sqlSelect, (err, result) => {
        res.send(result[0]);
    });
})

// ***count given from frontend*** //
app.post('/category', (req, res) => {
    const category = req.body.cat;
    const sqlCategory = "call category('"+category+"')";  
    salesdb.query(sqlCategory, (err, result) => {
        res.send(result);
    });
});


//send employee column and datatype 
app.get("/emps" , (req, res) => {
    const employeeDetails = "call empData()";
    salesdb.query(employeeDetails, (err, result) => {
        res.send(result[0]);
    })
})

//search result
app.post("/result", (req, res) => {

    const filterArray = req.body;
    let searchQuery = "";

    for (let i=0;i<filterArray.length;i++) {
        const header = filterArray[i].column;
        const symbol = filterArray[i].symbol;
        const value = filterArray[i].val;
        const logic = filterArray[i].logic;

        searchQuery += header + " " + symbol + " " + "'"+value+"'" + " " + logic + " "; 
    }

    console.log(searchQuery);

    const sqlResult = "SELECT * FROM employees WHERE " + searchQuery;

    console.log(sqlResult);
    salesdb.query(sqlResult, (err, result) => {
        res.send(result);
        console.log(result); 
    });
})

// categories counts
///////////furniture count///////////
// app.get("/furniture", (req, res) => {
//     // const sqlFurniture = "SELECT COUNT(category) AS furniture_count FROM sales WHERE  category = 'Furniture'";
//     const sqlFurniture = "call counts('Furniture')";  
//     salesdb.query(sqlFurniture, (err, result) => {
//         res.send(result);
//     });
// })

/////////office count/////////////////
// app.get('/office', (req, res) => {
//     // const sqlOffice = "SELECT COUNT(category) AS office_count FROM sales WHERE category = 'Office Supplies'";
//     // const sqlOffice = "call counts()";
//     // const sqlOffice = "call counts('Office Supplies')";
//     salesdb.query(sqlOffice, (err, result) => {
//         res.send(result);
//         console.log(result);
//     })
// })

//////////technology count/////////////
// app.get('/technology', (req, res) => {
//     // const sqlTechnology = "SELECT COUNT(category) AS technology_count FROM sales WHERE category = 'Technology' ";
//     const sqlTechnology = "call counts('Technology')"; 
//     salesdb.query(sqlTechnology, (err, result) => {
//         res.send(result);
//         // console.log(result);
//     })
// })

app.listen(5000, () =>{
    console.log("server is running");
});