const express = require("express");
const app = express();
const cors = require('cors');
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("data.db", (err) => {
  if (err) {
    throw err;
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
});

app.get('/notes', (req, res)=> {
    db.all('SELECT * FROM notes', (err, rows)=> {
        if(err){
            console.log(err);
            return res.status(500).json({success: false, message: 'An error occurred!'})
        }
        return res.json({success:true, data: rows})
    });
});

app.get('/notes/:id', (req, res)=> {
    db.get('SELECT * FROM notes WHERE id = ?',(err, rows)=> {
        if(err){
            console.log(err);
            return res.status(500).json({success: false, message: 'An error occurred!'})
        }
        return res.json({success:true, data: rows});
    });
});

app.post('/notes', (req, res)=> {
    const {title, content} = req.body;
    if(!title || !content){
        return res.status(400).json({ success: false, message: 'title and content are required' });
    }
    
    db.run('INSERT INTO notes (title, content) VALUES (?, ?)',[title, content], function(err) {
        if(err){
            console.log(err);
            return res.status(500).json({success: false, message:'An error occurred!'})
        }

        return res.json({
            success: true,
            data:{
                id: this.lastID,
                title,
                content
            }
        })
    })
});

app.delete('/notes/:id',(req, res)=> {
    const {id} = req.params;

    db.get('SELECT * FROM notes WHERE id = ?', [id], (err, rows)=> {
        if(err){
            console.log(err);
            return res.status(500).json({success:false, message: 'An error occurred!'})
        }
        if(!rows){
            return res.status(400).json({success:false, message: 'Note does not exist!'})
        }

        db.run('DELETE FROM notes WHERE id = ?', [id], (error)=> {
            if(error){
                console.log(error);
                return res.status(500).json({success: false, message: 'An error occurred!'})
            }
            return res.json({ success: true, message: 'Note deleted successfully' });
        })
    })
});

app.put('/notes/:id', (req,res)=> {
    const {title, content, id} = req.body;
    if(!title || !content){
        return res.status(400).json({ success: false, message: 'title and content are required' });
    }
    
    db.run('UPDATE notes (title, content) VALUES (?, ?)',[title, content], function(err) {
        if(err){
            console.log(err);
            return res.status(500).json({success: false, message:'An error occurred!'})
        }

        return res.json({
            success: true,
            data:{
                id: id,
                title,
                content
            }
        })
    })
})

app.listen(process.env.PORT || 3001, () => {
  console.log(`Notes app listening on port: ${3001}`);
});
