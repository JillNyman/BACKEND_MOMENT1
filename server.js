const express = require('express');
//const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("courses.db");

const port = 1999;
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true}));

app.get("courses", (req, res) => {
    console.log("Welcome to my API");
})

//Routing
app.get("/", (req, res) => {
    db.all('SELECT * FROM courselist;', (err, rows) => {
        if(err){
            console.error(err.message);
            return;
        }
    });
});

app.get("/addcourse", (req, res) => {
    res.render('addcourse', {error: ""});
   
});

app.get("/about", (req, res) => {
    res.render("about", {
        error: "",
    });
});

//Skapa nytt inlägg
app.post("/addcourse",  (req, res) => {   
    
    let coursecode = req.body.coursecode;
    let coursename = req.body.coursename;
    let syllabus = req.body.coursesyllabus;
    let progression = req.body.courseprogression;

    error = "";
    //&& coursename !== "" && syllabus !== "" && progression !== ""
    //if(coursecode !== "" && coursename !== "" && syllabus !== "" && progression !== "" )
    if(coursecode.length > 0 && coursename.length > 0   && syllabus.length > 0   && progression.length > 0   ){
        let stmt = db.prepare(`INSERT INTO courselist(coursecode, coursename, syllabus, progression) VALUES(?, ?, ?, ?);`);
        stmt.run(coursecode, coursename, syllabus, progression);
        stmt.finalize();
    
     
         res.render("addcourse", {
        error: "Kursen har lagrats!"       
        });   
        
    }
    else   {
        
        res.render("addcourse", {
            error: "Du måste fylla i samtliga fält."     
            });   
      
    
    };    

});

app.get("/delete/:id", (req, res) => {
    let id = req.params.id;

    db.run("DELETE FROM courselist WHERE id=?;", id, (err) => {
        if(err){
            console.error(err.message);
        }
        res.redirect("/");
        
    });
});

//Hämta ändringssida
app.get("/edit/:id", (req, res) => {
    let id = req.params.id;

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

   if(coursecode.length > 0 && coursename.length > 0 && syllabus.length > 0 && progression.length > 0){
    const stmt = db.prepare("UPDATE courselist SET coursecode=?, coursename=?, syllabus=?, progression=? WHERE id=?;"); 
    stmt.run(coursecode, coursename, syllabus, progression, id);
    stmt.finalize();   
   } else {
        error = "Fyll i samtliga fält!";      
   }
   res.redirect("/");
});

//Starta applikationen
app.listen(port, () => {
    console.log("Application started on port: " + port);
});



    