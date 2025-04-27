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
  allowedHeaders: ['Content-Type', 'X-User-ID']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//transaction (disease diagnosis) endpoint
app.post("/diagnose", (req, res) => {
  // @ts-ignore
  const symptoms = req.body.symptoms.map(s => s.toLowerCase()); 
  let max_results;
  if (req.body.maxResults) {
    max_results = req.body.maxResults
  } else {
    max_results = 3;
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

//helper endpoint to also display medicine for diagnosed disease
app.post("/diagnose-helper", (req, res) => {
  const diseaseID = req.body.diseaseID;

  connection.query("SELECT m.MedicineID, m.MedicineName, m.SideEffects, m.UsageInstructions FROM Medicine m JOIN Disease_Medicine dm ON m.MedicineID = dm.MedicineID WHERE dm.DiseaseID = ?", [diseaseID],
    (err, results) => {
    if (err) {
      console.error("Error fetching medicines:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    res.json({ medicines: results });
  });
});

//stored procedure (user health history) endpoint
app.get("/history", (req, res) => {
  // @ts-ignore
  const userId = req.headers['x-user-id'] || req.query.userId;
  console.log('Parsed UserID:', userId);

  let months;
  if (req.query.months) {
    // @ts-ignore
    months = parseInt(req.query.months)
  } else {
    months = 6
  }
  console.log('Parsed Months:', months);
  
  connection.query(
    "CALL UserHealthHistory2(?,?)", [userId, months],
    (err, results) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('Query Results:', results);

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

//consultation - create endpoint
// @ts-ignore
app.post("/consultation", (req, res) => {
  const { UserID, DiseaseName, Notes } = req.body;
  // @ts-ignore
  const currentDate = new Date().toISOString().split('T')[0]; //making date today
  
  connection.query(
    "SELECT DiseaseID FROM Disease WHERE DiseaseName = ?",
    [DiseaseName],
    (err, diseaseResults) => {
      // @ts-ignore
      if (diseaseResults.length === 0) {
        return res.status(404).json({ error: "Disease not found", diseaseName: DiseaseName });
      }
      
      // @ts-ignore
      const DiseaseID = diseaseResults[0].DiseaseID;
      
      connection.query(
        "SELECT MAX(ConsultationID) as maxId FROM UserConsultation",
        (err, results) => {
          let newConsultationId;
          // @ts-ignore
          if (results[0].maxId) {
            // @ts-ignore
            newConsultationId = results[0].maxId + 1;
          } else {
            newConsultationId = 1;
          }
          
          connection.query(
            "INSERT INTO UserConsultation (ConsultationID, UserID, DiseaseID, Date, Notes) VALUES (?, ?, ?, ?, ?)",
            [newConsultationId, UserID, DiseaseID, currentDate, Notes || ""],
            (err, results) => {
              if (err) {
                console.error("MySQL Insert Error:", err);
                return res.status(500).json({ 
                    error: "Insert failed", 
                    details: err.message,
                    sqlState: err.sqlState
                });
            }

              res.status(201).json({
                message: "Consultation added successfully",
                consultation: {
                  ConsultationID: newConsultationId,
                  UserID,
                  DiseaseName,
                  DiseaseID,
                  Date: currentDate,
                  Notes
                }
              });
            }
          );
        }
      );
    }
  );
});

//consultation - a user can read consultations they've made thus far
app.get("/user-consultations/:userId", (req, res) => {
  const userId = req.params.userId;

  // Comprehensive query to fetch consultations with disease names and symptoms
  connection.query(
    `SELECT uc.ConsultationID, d.DiseaseName, uc.Date, uc.Notes,
      (SELECT GROUP_CONCAT(s.SymptomName SEPARATOR ', ') 
       FROM UserConsultation_Symptom ucs
       JOIN Symptom s ON ucs.SymptomID = s.SymptomID
       WHERE ucs.ConsultationID = uc.ConsultationID) as Symptoms
    FROM UserConsultation uc
    JOIN Disease d ON uc.DiseaseID = d.DiseaseID
    WHERE uc.UserID = ?
    ORDER BY uc.Date DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Consultation fetch error:', err);
        return res.status(500).json({ 
          error: "Failed to fetch consultations", 
          details: err.message 
        });
      }
      // @ts-ignore
      const consultations = results.map(result => ({
        ...result,
        // @ts-ignore
        Symptoms: result.Symptoms ? result.Symptoms.split(',').map(s => s.trim()) : []
      }));

      res.json({ consultations });
    }
  );
});

//consultation - update endpoint
app.put("/consultation/:consultationId", (req, res) => {
  const { consultationId } = req.params;
  const { DiseaseName, Notes, Symptoms } = req.body;
  const currentDate = new Date().toISOString().split('T')[0];

  connection.beginTransaction((err) => {
    connection.query(
      "SELECT DiseaseID FROM Disease WHERE DiseaseName = ?",
      [DiseaseName],
      (err, diseaseResults) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ error: "Disease lookup failed" });
          });
        }

        // @ts-ignore 
        if (diseaseResults.length === 0) {
          return connection.rollback(() => {
            res.status(404).json({ error: "Disease not found" });
          });
        }

        // @ts-ignore 
        const DiseaseID = diseaseResults[0].DiseaseID;

        //update main consultation 
        connection.query(
          "UPDATE UserConsultation SET DiseaseID = ?, Notes = ?, Date = ? WHERE ConsultationID = ?",
          [DiseaseID, Notes || "", currentDate, consultationId],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ error: "Consultation update failed" });
              });
            }

            connection.query(
              "DELETE FROM UserConsultation_Symptom WHERE ConsultationID = ?",
              [consultationId],
              (err) => {
                if (err) {
                  return connection.rollback(() => {
                    res.status(500).json({ error: "Symptom deletion failed" });
                  });
                }

                if (Symptoms && Symptoms.length > 0) {
                  // @ts-ignore 
                  const symptomInsertQueries = Symptoms.map(symptom => 
                    new Promise((resolve, reject) => {
                      connection.query(
                        "SELECT SymptomID FROM Symptom WHERE SymptomName = ?",
                        [symptom.trim()],
                        (err, symptomResults) => {
                          if (err) return reject(err);
                          // @ts-ignore 
                          if (symptomResults.length === 0) return resolve(null);

                          // @ts-ignore 
                          const SymptomID = symptomResults[0].SymptomID;
                          connection.query(
                            "INSERT INTO UserConsultation_Symptom (ConsultationID, SymptomID) VALUES (?, ?)",
                            [consultationId, SymptomID],
                            (err) => {
                              if (err) return reject(err);
                              resolve(null);
                            }
                          );
                        }
                      );
                    })
                  );

                  Promise.all(symptomInsertQueries)
                    .then(() => {
                      connection.commit((err) => {
                        if (err) {
                          return connection.rollback(() => {
                            res.status(500).json({ error: "Commit failed" });
                          });
                        }
                        res.status(200).json({ 
                          message: "Consultation updated successfully",
                          consultationId 
                        });
                      });
                    })
                    .catch((err) => {
                      return connection.rollback(() => {
                        res.status(500).json({ error: "Symptom insertion failed" });
                      });
                    });
                } else {
                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        res.status(500).json({ error: "Commit failed" });
                      });
                    }
                    res.status(200).json({ 
                      message: "Consultation updated successfully",
                      consultationId 
                    });
                  });
                }
              }
            );
          }
        );
      }
    );
  });
});

//consultation - delete endpoint
app.delete("/consultation/:consultationId", (req, res) => {
  const { consultationId } = req.params;

  connection.beginTransaction((err) => {
    connection.query(
      "DELETE FROM UserConsultation_Symptom WHERE ConsultationID = ?",
      [consultationId],
      (err) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ error: "Symptom deletion failed" });
          });
        }

        connection.query(
          "DELETE FROM UserConsultation WHERE ConsultationID = ?",
          [consultationId],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ error: "Consultation deletion failed" });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  res.status(500).json({ error: "Commit failed" });
                });
              }
              res.status(200).json({ 
                message: "Consultation deleted successfully",
                consultationId 
              });
            });
          }
        );
      }
    );
  });
});

//add-on endpoint to update join table when adding user consultation
app.post("/consultation-symptoms", (req, res) => {
  const { ConsultationID, Symptoms } = req.body;

  connection.beginTransaction((err) => {
    // @ts-ignore
    const insertSymptom = (symptom, callback) => {
      connection.query(
        "SELECT SymptomID FROM Symptom WHERE SymptomName = ?",
        [symptom.trim()],
        (err, symptomResults) => {
          if (err) {
            return callback(err);
          }

          // @ts-ignore
          if (symptomResults.length === 0) {
            console.warn(`Symptom not found in database: ${symptom}`);
            return callback(null);
          }

          // @ts-ignore
          const SymptomID = symptomResults[0].SymptomID;

          connection.query(
            "INSERT INTO UserConsultation_Symptom (ConsultationID, SymptomID) VALUES (?, ?)",
            [ConsultationID, SymptomID],
            (err) => {
              if (err) {
                return callback(err);
              }
              callback(null);
            }
          );
        }
      );
    };

    const async = require('async');
    // @ts-ignore
    async.each(Symptoms, insertSymptom, (err) => {
      if (err) {
        return connection.rollback(() => {
          res.status(500).json({ 
            error: "Failed to insert symptoms", 
            details: err.message 
          });
        });
      }

      connection.commit((err) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ error: "Commit failed" });
          });
        }

        res.status(201).json({
          message: "Symptoms added successfully",
          ConsultationID,
          Symptoms
        });
      });
    });
  });
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