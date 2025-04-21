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

//transaction () endpoint
app.post("/diagnose", (req, res) => {
  const symptoms = req.body.symptoms; 
  let max_results;
  if (req.body.maxResults) {
    max_results = req.body.maxResults
  } else {
    max_results = 10;
  }
  
  const input_symptoms = symptoms.join(',');

  connection.query(
    "CALL DiseaseDiagnosis6(?, ?)", [input_symptoms, max_results],
    (err, results) => {
      // @ts-ignore
      res.json({diagnoses: results[0]});
    }
  );
});

//stored procedure (user health history) endpoint
app.get("/history", (req, res) => {
  // @ts-ignore
  const userId = req.user.id;
  let months;
  if (req.query.months) {
    // @ts-ignore
    months = parseInt(req.query.months)
  } else {
    months = 6
  }
  
  connection.query(
    "CALL UserHealthHistory2(?,?)", [userId, months],
    (err, results) => {
      const response = {
        // @ts-ignore
        recurringSymptoms: results[0] || [],
        // @ts-ignore
        recurringDiseases: results[1] || []
      };

      res.json(response);
    }
  );
});

//signup endpoint
// @ts-ignore
app.post("/signup", (req, res) => {
  const {Username, Email, Password} = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).json({ message: 'all fields required' });
  }

  connection.query(
    "SELECT * FROM User WHERE Username = ? or Email = ?",
    [Username, Email],
    (err, results) => {
      // @ts-ignore
      if (results.length > 0) {
        return res.status(409).json({message:'user already exists'});
      }

      connection.query(
        "SELECT MAX(UserID) as maxId FROM User",
        (err, results) => {
          // @ts-ignore
          let newUserId;
          // @ts-ignore
          if (results[0].maxId) {
            // @ts-ignore
            newUserId = results[0].maxId+1;
          } else {
            // @ts-ignore
            newUserId = 1;
          }

          connection.query(
            "INSERT INTO User (UserId, Username, Email, Password) VALUES (?, ?, ?, ?)",
            [newUserId, Username, Email, Password],
            (err, results) => {
              res.status(200).json({
                message:'user signedup successfully',
                user: {
                  userId: newUserId,
                  username: Username,
                  email: Email
                }
              });
            }
          );
        }
      );
    }
  );
});

//login endpoint 
// @ts-ignore
app.post("/login", (req, res) => {
  const {Username, Password} = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ message: 'username and password required' });
  }

  connection.query(
    "SELECT * FROM User WHERE Username = ? AND Password = ?", [Username, Password],
    (err, results) => {
      if (err) {
        return res.status(500).json({error:"login failed", details: err.message});
      }

      // @ts-ignore
      if (results.length === 0) {
        return res.status(401).json({message:'invalid login credentials'});
      }

      // @ts-ignore
      const user = results[0];
      res.status(200).json({
        message: 'login successful',
        user: {
          userId: user.UserID,
          username: user.Username,
          email: user.Email
        }
      });
    }
  );
});

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