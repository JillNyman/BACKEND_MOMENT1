const sqlite3 = require("sqlite3").verbose();
//Skapa databas
const db = new sqlite3.Database("./db/courses.db");

//Skapa tabell, om den inte redan finns
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS courselist;");
    db.run(`
    CREATE TABLE courselist(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coursecode TEXT NOT NULL,
        coursename TEXT NOT NULL,
        syllabus TEXT,
        progression TEXT
    );
    `);
})


    db.close();