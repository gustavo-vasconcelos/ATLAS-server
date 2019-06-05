const express = require("express")
const router = express.Router()
const controller = require("../controllers/events.controller")
const auth = require("../middlewares/auth.middleware")
const proponentClearance = require("../middlewares/proponentClearance.middleware")
const adminClearance = require("../middlewares/adminClearance.middleware")

router.get("/", auth, adminClearance, controller.get)
router.get("/dates/", controller.getOccasions)
router.get("/dates/:date", controller.getByDate)
router.get("/ids/:id", auth, adminClearance, controller.getById)
router.get("/ids/:id/related", controller.getByIdAndRelated)
router.get("/enrollments/:id", controller.getEnrolledByUserId)
router.get("/authors/:id", controller.getByAuthorId)
router.post("/", auth, proponentClearance, controller.add)
router.put("/:id", auth, proponentClearance, controller.edit)
router.delete("/:id", auth, proponentClearance, controller.remove)
// enrollments
router.post("/ids/:id/enrollments", auth, controller.addEnrollment)
router.delete("/ids/:id/enrollments/:userId", auth, controller.removeEnrollment)
// discussions
router.get("/ids/:id/discussions/:discussionId", controller.getDiscussionById)
router.post("/ids/:id/discussions", auth, controller.addDiscussion)
router.delete("/ids/:id/discussions/:discussionId", auth, proponentClearance, controller.removeDiscussionById)
// discussion answers
router.post("/ids/:id/discussions/:discussionId/answers",
    auth,
    controller.util.middlewares.verifiesEventIntegrity,
    controller.util.middlewares.verifiesDiscussionIntegrity,
    controller.addDiscussionAnswer
)
router.delete("/ids/:id/discussions/:discussionId/answers", auth, controller.removeDiscussionAnswer)

module.exports = app => app.use("/events", router)