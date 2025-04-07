import express, { Request, Response } from 'express';
import mysql from "mysql2";
import cors from 'cors';

const connection = mysql.createConnection({
  host: "34.121.38.197",
  user: "root",
  password: "haam",
  database: "sympchat_database",
});

connection.connect((err) => {
  if (!err) {
    console.log("connected");
  } else {
    throw err;
  }
});

const app = express();
const PORT = 5000; //backend port
app.listen(PORT, () => {
  console.log(`Server running on localhost:${PORT}`);
});

app.use(cors({
  origin: 'http://localhost:3000', //react port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

//create functionality
app.post("/users", (req, res) => {
  const {UserID, Username, Email, Password} = req.body;
  
  connection.query(
    "INSERT INTO User (UserID, Username, Email, Password) VALUES (?, ?, ?, ?)", [UserID, Username, Email, Password],
    (err: mysql.QueryError | null) => {
      if (!err) {
        res.status(201).json({ 
          message: "user created"
        });
      } else {
        res.status(500).json({error:"create failed", details: err.message});
      }
    }
  );
});

//read functionality
app.get("/api/users", (req: Request, res: Response) => {
  connection.query("SELECT * FROM User LIMIT 20", (err, results) => {
    if (!err) {
      res.json(results);
    } else {
      return res.status(500).json({error:"read failed", details: err.message });
    }
  });
});

//update functionality
app.put("/users/:id", (req, res) => {
  const UserID = req.params.id;
  const {Username} = req.body;
  
  connection.query("UPDATE User SET Username = ? WHERE UserID = ?", [Username, UserID],
    (err) => {
      if (!err) {
        res.json({
          message: "updated user"
        });
      } else {
        res.status(500).json({ error: "update failed", details: err.message });
      }
    }
  );
});

//delete functionality
app.delete("/users/:id", (req, res) => {
  const UserID = req.params.id;
  
  connection.query(
    "DELETE FROM User WHERE UserID = ?", [UserID],
    (err) => {
      if (!err) {
        res.json({
          message: "user deleted"
        });
      } else {
        res.status(500).json({ error: "delete failed", details: err.message, fullError: err });
      }
    }
  );
});