const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const helmet = require('helmet');

const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("./courses.db");
const app = express();
const port = 1991;

//app.use(helmet());
app.set('view engine', 'ejs');
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", `http://localhost:${port}`, "http://*.example.com"]
    }
}));

app.use(bodyParser.urlencoded({ extended: true}));

/*app.use('/stylesheets', (req, res, next) => {
    res.setHeader(
        'Content-Type', 'text/css');
    next();
});*/

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy", 
    `default-src 'none'; script-src 'self'; style-src 'self' http://localhost:${port} http://*.example.com`);
  next();
});


//Routing
app.get("/", (req, res) => {
    res.render("index");
});

//Hämta hela tabellen och skicka till frontend
app.get("/list", (req, res) => {
    db.all('SELECT * FROM courselist;', (err, rows) => {
        if(err){
            console.error(err.message);
            return;
        }        
            res.render("list", {
                
                rows: rows,
                error: ""
            });
        
    });

})

app.get("/addcourse", (req, res) => {
    res.render('addcourse', {error: ""});
   
});

app.get("/about", (req, res) => {
    res.render("about", {
        error: "",
    });
});

//Skapa ny post
app.post("/addcourse",  (req, res) => {   
    
    let coursecode = req.body.coursecode;
    let coursename = req.body.coursename;
    let syllabus = req.body.coursesyllabus;
    let progression = req.body.courseprogression;

    error = "";
    
    //alla fält måste vara ifyllda
    if(coursecode.length > 0 && coursename.length > 0   && syllabus.length > 0   && progression.length > 0   ){
        let stmt = db.prepare(`INSERT INTO courselist(coursecode, coursename, syllabus, progression) VALUES(?, ?, ?, ?);`);
        stmt.run(coursecode, coursename, syllabus, progression);
        stmt.finalize();
    
     
        res.render("addcourse", {
        error: "Kursen har lagrats!"       
        });  
        
    }
    else   {
        //felmeddelande
        res.render("addcourse", {
            error: "Du måste fylla i samtliga fält."     
            });   
      
    
    };    

});

//radera kurs från listan
app.get("/delete/:id", (req, res) => {
    let id = req.params.id;

    db.run("DELETE FROM courselist WHERE id=?;", id, (err) => {
        if(err){
            console.error(err.message);
            return;
        }
        res.redirect("/");
        
    });
});

//Hämta sida för att kunna uppdatera kurs
app.get("/edit/:id", (req, res) => {
    let id = req.params.id;

    //GET istället för RUN eftersom vi vill ha något tillbaka från databasen
   db.get(`SELECT * FROM courselist WHERE id=?;`, id, (err, row) => {
        if(err){
            console.error(err.message);
        }
        res.render("edit", {
            row: row,
            error: ""

        });
   });
}); 

//Posta ändringen
app.post("/edit/:id",  (req, res) => {
    
   let id = req.params.id;
   let coursecode = req.body.coursecode;
   let coursename = req.body.coursename;
   let syllabus = req.body.coursesyllabus;
   let progression = req.body.courseprogression;

    error = "";
//användaren måste fylla i alla fält
   if(coursecode.length > 0 && coursename.length > 0 && syllabus.length > 0 && progression.length > 0){
    const stmt = db.prepare("UPDATE courselist SET coursecode=?, coursename=?, syllabus=?, progression=? WHERE id=?;"); 
    stmt.run(coursecode, coursename, syllabus, progression, id);
    stmt.finalize();   
   } else {
        error = "Fyll i samtliga fält!";      
   }
   res.render(`/edit/${id}`);
});

//Starta applikationen
app.listen(port, () => {
    console.log("Application started on port: " + port);
});

//db.close();



    