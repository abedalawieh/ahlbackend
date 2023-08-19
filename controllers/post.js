import { db } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// export const getposts = (req, res) => {
//   const q = "select * from site";
//   db.query(q, (err, data) => {
//     if (err) res.status(400).json(err);

//     return res.status(200).json(data);
//   });
// };
export const getposts = (req, res, next) => {
  try {
    let { sort, category } = req.query;
    let getposts = `SELECT * FROM site`;

    if (category) {
      getposts += ` WHERE cat = '${category}'`;
    }

    if (sort === "LowestToHighest") {
      getposts += ` ORDER BY fees ASC`;
    } else if (sort === "HighestToLowest") {
      getposts += ` ORDER BY fees DESC`;
    }

    db.query(getposts, (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          description: "Server Error",
        });
      } else {
        res.status(200).json({
          success: true,
          data: result,
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      description: "Server Error",
    });
  }
};

export const addPost = (req, res) => {
  const q =
    "INSERT INTO site(`name`, `location`, `description`, `cat`, `img`,`fees`,`status`,`site_provider_id`,`rating`,`nb_rates`) VALUES (?)";

  const values = [
    req.body.name,
    req.body.location,
    req.body.desc,
    req.body.cat,
    req.body.img,
    req.body.fees,
    0,
    req.body.site_provider_id,
    0,
    0,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Post has been created.");
  });
};

export const addSP = (req, res) => {
  const q =
    "INSERT INTO site_provider(`phone`, `username`, `password`,`email`) VALUES (?)";

  const values = [
    req.body.phone,

    req.body.username,

    req.body.password,

    req.body.email,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Post has been created.");
  });
};

export const getNbPosts = (req, res) => {
  const q = "SELECT count(*) as count from site";
  db.query(q, (err, data) => {
    if (err) return res.status(400).json(err);
    const count = data[0].count;
    return res.status(200).json(count);
  });
};

export const getProvider = (req, res) => {
  const q = "SELECT * from site_provider";
  db.query(q, (err, data) => {
    if (err) return res.status(400).json(err);

    return res.status(200).json(data);
  });
};
//new
export const getStrequest = (req, res) => {
  const q =
    "SELECT site_id, name, username, cat, img, status from site NATURAL JOIN site_provider where status = 1;";
  db.query(q, (err, data) => {
    if (err) return res.status(400).json(err);

    return res.status(200).json(data);
  });
};
export const accept = (req, res) => {
  const id = req.params.id;
  const q = "UPDATE site SET `status`=1  WHERE `site_id` = ? ";

  const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Post has been updated.");
  });
};
export const deletepost = (req, res) => {
  const id = req.params.id;
  const q = "Delete from site  WHERE `site_id` = ? ";

  const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Post has been deleted.");
  });
};
export const deleteSP = (req, res) => {
  const id = req.params.id;
  const q = "Delete from site_provider  WHERE `site_provider_id` = ? ";

  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Sp has been deleted.");
  });
};
export const reject = (req, res) => {
  const id = req.params.id;
  const q = "UPDATE site SET `status`=-1  WHERE `site_id` = ? ";

  const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Post has been updated.");
  });
};
export const getnbusers = (req, res) => {
  const q = "SELECT count(*) as count from users";
  db.query(q, (err, data) => {
    if (err) return res.status(400).json(err);
    const count = data[0].count;
    return res.status(200).json(count);
  });
};
export const checkadmin = (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) return res.json({ Message: "Server Side Error" });
    if (data.length > 0) {
      const dataAdmin = data[0];

      let adminSpId;
      let role;
      if (dataAdmin.hasOwnProperty("admin_id")) {
        adminSpId = dataAdmin.admin_id;
        role = "iamadmin"; // User found in the admin table
        if (password == dataAdmin.password) {
          const token = jwt.sign({ adminSpId }, "adminsiteproviderlogin");
          const response = {
            data: dataAdmin,
            token: token,
            role: role,
          };

          return res.status(200).json({ Status: "Success", response });
        }
      }
    }
  });
};

export const spSites = (req, res) => {
  const id = req.params.id;
  const q = "SELECT * from site where site_provider_id = ?";
  db.query(q, [id], (err, data) => {
    if (err) return res.status(400).json(err);

    return res.status(200).json(data);
  });
};
export const siteWID = (req, res) => {
  const q =
    "update  site set name = ? ,  location = ? , description = ? , cat = ?  , fees = ? where site_id = ?";
  db.query(
    q,
    [
      req.body.name1,
      req.body.location1,
      req.body.desc1,
      req.body.cat1,
      req.body.fees1,
      parseInt(req.body.site_id),
    ],
    (err, data) => {
      if (err) return res.status(400).json(err);

      return res.status(200).json(data);
    }
  );
};
export const addimg = (req, res) => {
  const q = "INSERT INTO media VALUES (?)";

  const values = [parseInt(req.body.site_id), req.body.img];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Post has been created.");
  });
};

export const getresturants = (req, res) => {
  const q = "select * from site where cat = 'resturant'";
  db.query(q, (err, data) => {
    if (err) res.status(400).json(err);

    return res.status(200).json(data);
  });
};

export const getresorts = (req, res) => {
  const q = "select * from site where cat = 'resort'";
  db.query(q, (err, data) => {
    if (err) res.status(400).json(err);

    return res.status(200).json(data);
  });
};

export const updatepfp = (req, res) => {
  const q = "update  users set profile_picture = ? where user_id = ?";
  db.query(q, [req.body.img, parseInt(req.body.user_id)], (err, data) => {
    if (err) return res.status(400).json(err);

    return res.status(200).json(data);
  });
};

export const getUserInfo = (req, res) => {
  const id = req.params.user_id;
  const q = "select * from users where user_id = ?";
  db.query(q, [id], (err, data) => {
    if (err) res.status(400).json(err);

    return res.status(200).json(data);
  });
};

export const updateUserInfo = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(req.body.userPassword, salt);

    const q =
      "UPDATE users SET username = ?, email = ?, password = ?, bio = ?, phone = ? WHERE user_id = ?";
    db.query(
      q,
      [
        req.body.username,
        req.body.userEmail,
        passwordHash,
        req.body.userBio,
        req.body.userPhone,
        parseInt(req.body.user_id),
      ],
      (err, data) => {
        if (err) return res.status(400).json(err);
        return res.status(200).json(data);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const addComplaint = (req, res) => {
  const q =
    "INSERT INTO complaint(`firstname`,`lastname`,`email`,`phone`,`message`) VALUES (?)";

  const values = [
    req.body.firstname,
    req.body.lastname,
    req.body.email,
    req.body.phone,
    req.body.message,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("complaint send.");
  });
};
export const getImgs = (req, res) => {
  const id = req.params.id;
  console.log(id);
  const q =
    "select img from site where site_id = ? UNION SELECT img from media WHERE site_id = ?;";
  db.query(q, [id, id], (err, data) => {
    if (err) res.status(400).json(err);
    console.log(data);
    return res.status(200).json(data);
  });
};

export const getcomplaints = (req, res) => {
  const q = "select * from complaint";
  db.query(q, (err, data) => {
    if (err) res.status(400).json(err);

    return res.status(200).json(data);
  });
};

export const updatesppass = async (req, res) => {
  try {
    const q =
      "UPDATE site_provider SET site_provider.password= ? WHERE site_provider_id= ? ;";
    db.query(q, [req.body.newpass, parseInt(req.body.id)], (err, data) => {
      if (err) return res.status(400).json(err);
      return res.status(200).json(data);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An error occurred" });
  }
};
