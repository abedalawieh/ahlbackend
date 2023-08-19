import express from "express";
import bcrypt from "bcrypt";

import router from "./routes/post.js";
//import commentRoutes from "./routes/comments.js";
import multer from "multer";
import cors from "cors";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import dotenv from "dotenv";

import nodemailer from "nodemailer";

const app = express();
dotenv.config();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST,GET,PUT,DELETE"],
    credentials: true,
  })
);

//upload img with the extention
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../senior-project/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});

// using posts
app.use("/api/posts", router);

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? OR email = ? ";
    db.query(sql, [username, username], async (err, data) => {
      if (err) {
        console.log(err);
        return res.json({ Message: "Server Side Error" });
      } else if (data.length > 0) {
        const valid = await bcrypt.compare(password, data[0].password);
        console.log(password);
        console.log(data[0].password);
        console.log(valid);

        if (valid) {
          const userid = data[0].user_id;

          const token = jwt.sign({ id: userid }, "hadiwilliamabedmajd");
          const datares = data[0];
          const resp = {
            data: datares,
            token: token,
          };
          console.log(resp);
          return res.status(200).json({ Status: "Success", resp });
        } else {
          return res.json({
            Message:
              "Incorrect login details. Please check your password and try again",
          });
        }
      } else {
        return res.json({
          Message:
            "The profile you requested could not be found. Please ensure the information is correct and try again.",
        });
      }
    });
  } catch (e) {
    res.status(500).send("Something went wrong!!!");
  }
});
app.post("/api/login/sp", async (req, res) => {
  try {
    const { username, password } = req.body;
    const sql =
      "   SELECT * FROM site_provider where email = ? or username = ?  ";
    db.query(sql, [username, username], async (err, data) => {
      if (err) {
        console.log(err);
        return res.json({ Message: "Server Side Error" });
      } else if (data.length > 0) {
        const dataAdmin = data[0];

        let adminSpId;
        let role;

        if (dataAdmin.hasOwnProperty("site_provider_id")) {
          adminSpId = dataAdmin.siteprovider_id; // User found in the site_provider table
          role = "iamsiteprovider";
        }

        if (password == dataAdmin.password) {
          const token = jwt.sign({ adminSpId }, "adminsiteproviderlogin");
          const response = {
            data: dataAdmin,
            token: token,
            role: role,
          };
          console.log(response);
          return res.status(200).json({ Status: "Success", response });
        } else {
          return res.json({
            Message:
              "Incorrect login details. Please check your password and try again",
          });
        }
      } else {
        return res.json({
          Message:
            "The profile you requested could not be found,neither an admin nor an sp. Please ensure the information is correct and try again.",
        });
      }
    });
  } catch (e) {
    res.status(500).send("Something went wrong!!!");
  }
});
app.get("/",(req,res) => {
  res.setHeader("Access-Control-Allow-Credentials","true");
  res.send("Api Running");
});
app.get("/api/posts/site/:id", (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM site WHERE site_id = ?", id, (err, result) => {
    if (err) {
      return res.json({ Message: "Server Side Error" });
    } else {
      if (result.length == 0) {
        console.log("Post not found");
        res.status(404).send({ message: "Post not found" });
      } else {
        res.status(200).json({ data: result[0] });
        console.log(result[0]);
      }
    }
  });
});

//comments
app.post("/site/addcomment", (req, res) => {
  const { text, commentmedia, postedBy, user_id, site_id } = req.body;
  console.log({ text, commentmedia, postedBy, user_id, site_id });
  db.query(
    "INSERT INTO comments (text, commentmedia, postedBy, user_id, site_id) VALUES (?, ?, ?, ?, ?)",
    [text, commentmedia, postedBy, user_id, site_id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});
//getting the comments
app.get("/site/comments/:site_id", (req, res) => {
  const { site_id } = req.params;
  db.query(
    "SELECT id,text,commentmedia,postedBy,createdAt,user_id,site_id,profile_picture FROM comments NATURAL JOIN users WHERE site_id= ?;",
    [site_id],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});
//deleting a comment
app.post("/api/comments/user/delete", (req, res) => {
  const user_id = req.body.userId; // You will need to pass the userId from your frontend
  const site_id = req.body.siteId; // And the siteId
  const comment_id = req.body.comment_id;

  // Start by inserting the new rating into the ratings table
  db.query(
    "DELETE FROM comments WHERE id = ? AND user_id = ? AND site_id = ?",
    [comment_id, user_id, site_id],
    (error, data) => {
      if (error) {
        return res.status(500).json({ Message: "Server Side Error" });
      }

      return res.status(200).json({ Status: "Successs" });
    }
  );
});

app.post("/api/comments/admin/delete", (req, res) => {
  const site_id = req.body.siteId; // And the siteId
  const comment_id = req.body.comment_id;
  db.query(
    "DELETE FROM comments WHERE id = ? AND site_id = ?",
    [comment_id, site_id],
    (error, data) => {
      if (error) {
        return res.status(500).json({ Message: "Server Side Error" });
      }

      return res.status(200).json({ Status: "Successs" });
    }
  );
});

//rating input
app.post("/api/rating", (req, res) => {
  const user_id = req.body.userId; // You will need to pass the userId from your frontend
  const site_id = req.body.siteId; // And the siteId
  const rating_value = req.body.ratingValue; // And the ratingValue
  console.log(user_id);
  console.log(site_id);
  console.log(rating_value);

  const checkUserRate =
    "SELECT COUNT(*) AS userRate FROM rating WHERE user_id = ? AND site_id = ?";
  try {
    db.query(checkUserRate, [user_id, site_id], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ Message: "Server Side Error" });
      }

      if (data[0].userRate > 0) {
        return res.json({ Message: "You already rated" });
      }

      // Start by inserting the new rating into the ratings table
      db.query(
        "INSERT INTO rating (user_id, site_id, rate) VALUES (?, ?, ?)",
        [user_id, site_id, rating_value],
        (error, results) => {
          if (error) {
            console.log(error);
            res
              .status(500)
              .send("An error occurred while inserting the rating");
          } else {
            // If the insertion was successful, calculate the new average rating for the site
            db.query(
              "SELECT AVG(rate) AS averageRating FROM rating WHERE site_id = ?",
              [site_id],
              (error, results) => {
                if (error) {
                  console.log(error);
                  res
                    .status(500)
                    .send(
                      "An error occurred while calculating the average rating"
                    );
                } else {
                  const averageRating = results[0].averageRating;

                  // Then update the average rating in the sites table
                  db.query(
                    "UPDATE site SET rating = ? WHERE site_id = ?",
                    [averageRating, site_id],
                    (error, results) => {
                      if (error) {
                        console.log(error);
                        res
                          .status(500)
                          .send(
                            "An error occurred while updating the average rating"
                          );
                      } else {
                        res.send("Successfully updated the average rating");
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  } catch (e) {
    console.log("Error", e);
  }
});
//has rated
app.post("/api/rated", (req, res) => {
  const user_id = req.body.userId; // You will need to pass the userId from your frontend
  const site_id = req.body.siteId;
  const checkUserHasRated =
    "SELECT COUNT(*) AS userRate FROM rating WHERE user_id = ? AND site_id = ?";
  try {
    db.query(checkUserHasRated, [user_id, site_id], async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ Message: "Server Side Error" });
      }

      if (data[0].userRate > 0) {
        const sqlReturnRate =
          "SELECT * FROM rating WHERE user_id = ? AND site_id = ? ";
        db.query(sqlReturnRate, [user_id, site_id], async (err, data) => {
          if (err) {
            console.log(err);
            return res.json({ Message: "Server Side Error" });
          } else {
            const result = data[0];
            console.log(data);
            return res.json({ Status: "Rated", result });
          }
        });
      } else {
        res.send({ Status: "NotRated" });
      }
    });
  } catch {}
});

//nb_rates
app.post("/api/site/nbrates", async (req, res) => {
  try {
    const siteid = req.body.site_id;
    db.query(
      "UPDATE site SET nb_rates = (SELECT COUNT(*) FROM rating where site_id = site.site_id);",
      (err, data) => {
        if (err) {
          return res.json({ Message: "server side error" });
        } else {
          return res.status(200).json(data);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

//check if fav
app.post("/api/favoriteCheck", (req, res) => {
  const user_id = req.body.userId; // You will need to pass the userId from your frontend
  const site_id = req.body.siteId;
  const checkFavorite =
    "SELECT COUNT(*) AS userFavorite FROM favorite WHERE user_id = ? AND site_id = ?";
  try {
    db.query(checkFavorite, [user_id, site_id], async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ Message: "Server Side Error" });
      }
      if (data[0].userFavorite > 0) {
        return res.json({ Status: "Liked" });
      } else {
        res.send({ Status: "NotLiked" });
      }
    });
  } catch (e) {
    console.log("Error", e);
  }
});

//make fav
app.post("/api/setFavorite", (req, res) => {
  const user_id = req.body.userId; // You will need to pass the userId from your frontend
  const site_id = req.body.siteId; // And the siteId

  // Start by inserting the new rating into the ratings table
  db.query(
    "INSERT INTO favorite (user_id, site_id) VALUES (?, ?)",
    [user_id, site_id],
    (error, data) => {
      if (error) {
        return res.status(500).json({ Message: "Server Side Error" });
      }

      return res.status(200).json({ Status: "Successs" });
    }
  );
});

//remove fav
app.post("/api/removeFavorite", (req, res) => {
  const user_id = req.body.userId; // You will need to pass the userId from your frontend
  const site_id = req.body.siteId; // And the siteId

  // Start by inserting the new rating into the ratings table
  db.query(
    "DELETE FROM favorite WHERE user_id = ? AND site_id = ?",
    [user_id, site_id],
    (error, data) => {
      if (error) {
        return res.status(500).json({ Message: "Server Side Error" });
      }

      return res.status(200).json({ Status: "Successs" });
    }
  );
});

//retrieve fav
app.post("/api/posts/user/favorite", (req, res) => {
  const userId = req.body.userId;

  db.query(
    "SELECT * from favorite NATURAL JOIN site where user_id= ? ;",
    [userId],
    (err, data) => {
      if (err) {
        return res.json({ Message: "Server Side Error" });
      } else {
        console.log(data);
        return res.status(200).json(data);
      }
    }
  );
});

app.post("/api/signup", async (req, res) => {
  try {
    const user = {
      phone: req.body.phone,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    };
    const salt = await bcrypt.genSalt();

    const passwordHash = await bcrypt.hash(user.password, salt);

    const checkUserSql =
      "SELECT COUNT(*) AS userCount FROM users WHERE username = ? OR email = ?";
    db.query(checkUserSql, [user.username, user.email], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ Message: "Server Side Error" });
      }

      if (data[0].userCount > 0) {
        return res.json({ Message: "User already exists" });
      }

      const insertUserSql = "INSERT INTO users SET ?";
      db.query(
        insertUserSql,
        {
          phone: user.phone,
          username: user.username,
          password: passwordHash,
          email: user.email,
        },
        (err, data) => {
          if (err) {
            return res.status(500).json({ Message: "Server Side Error" });
          }

          return res.status(200).json({ Status: "Successs" });
        }
      );
    });
  } catch (e) {
    res.status(500).send("Something went wrong!!!");
  }
});

function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "activityhub@hotmail.com",
        pass: "Aboudi77",
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    const mail_configs = {
      from: "activityhub@hotmail.com",
      to: recipient_email,
      subject: "ACTIVITY-HUB PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
  <html lang="en">
  <head>

    <meta charset="UTF-8">
    <title>Activity-Hub OTP Email Template</title>
  </head>
  <body>
  <!-- partial:index.partial.html -->
  <div style="font-family: Helvetica, Arial, sans-serif; min-width:1000px; overflow:auto; line-height:2">
    <div style="margin:50px auto; width:70%; padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em; color: #00466a; text-decoration:none; font-weight:600">Abed Alaweye</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Activity Hub. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
      <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${OTP}</h2>
      <p style="font-size:0.9em;">Regards,<br />Abed Alaweye</p>
      <hr style="border:none; border-top:1px solid #eee" />
      <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
        <p>Activity-Hub </p>
        <p>Beirut</p>
        <p>Lebanon</p>
      </div>
    </div>
  </div>
  <!-- partial -->
    
  </body>
  </html>`,
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occurred` });
      }
      return resolve({ message: "Email sent successfully" });
    });
  });
}

app.post("/api/send_recovery_email", (req, res) => {
  const email = req.body.recipient_email;
  const sql = "SELECT * FROM users WHERE email = ? ";
  db.query(sql, email, (err, data) => {
    if (err) return res.json({ Message: "Server Side Error" });
    if (data.length > 0) {
      console.log(req.body);

      return sendEmail(req.body)
        .then((response) => {
          res.send(response.message);
        })
        .catch((error) => {
          res.status(500).send(error.message);
        });
    } else {
      return res.status(404).json({
        Message:
          "The profile you requested could not be found. Please ensure the information is correct and try again.",
      });
    }
  });
});
// ...
app.post("/site/addcomment", (req, res) => {
  const { text, commentmedia, postedBy, user_id, site_id } = req.body;
  db.query(
    "INSERT INTO comments (text, commentmedia, postedBy, user_id, site_id) VALUES (?, ?, ?, ?, ?)",
    [text, commentmedia, postedBy, user_id, site_id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});
app.get("/site/comments/:site_id", (req, res) => {
  const { site_id } = req.params;
  db.query(
    "SELECT * FROM comments INNER JOIN site ON comments.site_id = site.site_id WHERE comments.site_id = ?",
    [site_id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});
app.post("/api/reset", async (req, res) => {
  try {
    const { password, email } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const sql = "UPDATE users SET password = ? WHERE email = ?";
    db.query(sql, [passwordHash, email], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
      }
      console.log("Password Changed");
      return res.status(200).json({ message: "Password updated successfully" });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

//connecting to port 8800 on api side
app.listen(8800, () => {
  console.log("Running on port 8800");
});
