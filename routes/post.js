import express from "express";
import {
  getposts,
  addPost,
  getNbPosts,
  getStrequest,
  accept,
  reject,
  getnbusers,
  checkadmin,
  deletepost,
  addSP,
  getProvider,
  deleteSP,
  spSites,
  siteWID,
  addimg,
  getresturants,
  getresorts,
  updatepfp,
  getUserInfo,
  updateUserInfo,
  addComplaint,
  getImgs,
  getcomplaints,
  updatesppass,
} from "../controllers/post.js";

const router = express.Router();

router.get("/site", getposts);
router.post("/addPost", addPost);
router.post("/addComplaint", addComplaint);
router.get("/nbp", getNbPosts);
router.get("/Strequest", getStrequest);
router.get("/provider", getProvider);
router.put("/acc/:id", accept);
router.put("/rej/:id", reject);
router.delete("/delete/:id", deletepost);
router.delete("/deleteSP/:id", deleteSP);
router.post("/signupSP", addSP);
router.post("/photo", addimg);
router.get("/nbusers", getnbusers);
router.post("/Loginadmin", checkadmin);
router.get("/spsite/:id", spSites);
router.put("/sitewId", siteWID);
router.get("/resturants", getresturants);
router.get("/resorts", getresorts);
router.put("/updatepfp", updatepfp);
router.get("/user/:user_id", getUserInfo);
router.put("/updateuserInfo", updateUserInfo);
router.get("/getImgs/:id", getImgs);
router.get("/Complaints", getcomplaints);
router.put("/newsppass", updatesppass);

export default router;
