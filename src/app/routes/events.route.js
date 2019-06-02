const express = require("express")
const router = express.Router()
const controller = require("../controllers/events.controller")
const auth = require("../middlewares/auth.middleware")
const proponentClearance = require("../middlewares/proponentClearance.middleware")

router.get("/", controller.get)
router.get("/dates/", controller.getOccasions)
router.get("/dates/:date", controller.getByDate)
router.get("/ids/:id", controller.getById)
router.get("/ids/:id/related", controller.getByIdAndRelated)
router.get("/enrollments/:id", controller.getEnrolledByUserId)
router.get("/authors/:id", controller.getByAuthorId)
router.post("/", /*auth, proponentClearance, */controller.add)
router.put("/:id", /*auth, proponentClearance, */controller.edit)
router.delete("/:id", /*auth, proponentClearance, */controller.remove)
// enrollments
router.post("/ids/:id/enrollments", controller.addEnrollment)
router.delete("/ids/:id/enrollments/:userId", controller.removeEnrollment)
// discussions
router.get("/ids/:id/discussions/:discussionId", controller.getDiscussionById)
router.post("/ids/:id/discussions", controller.addDiscussion)
router.delete("/ids/:id/discussions/:discussionId", controller.removeDiscussionById)
// discussion answers
router.post("/ids/:id/discussions/:discussionId/answers",
    controller.util.middlewares.verifiesEventIntegrity,
    controller.util.middlewares.verifiesDiscussionIntegrity,
    controller.addDiscussionAnswer
)
router.delete("/ids/:id/discussions/:discussionId/answers", controller.removeDiscussionAnswer)

module.exports = app => app.use("/events", router)