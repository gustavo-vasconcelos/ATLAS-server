const express = require("express")
const router = express.Router()
const controller = require("../controllers/events.controller")
const auth = require("../middlewares/auth.middleware")
const proponentClearance = require("../middlewares/proponentClearance.middleware")
const adminClearance = require("../middlewares/adminClearance.middleware")

router.get("/", auth, adminClearance, controller.get)
router.get("/occasions/:occasion", controller.getOccasions)
router.get("/dates/:date", controller.getByDate)
router.get("/ids/:id",
    controller.util.middlewares.verifyEventIntegrity,
    controller.getById
)
router.get("/authors/:id", auth, proponentClearance, controller.getByAuthorId)
router.post("/", auth, proponentClearance, controller.add)
router.put("/:id", auth, proponentClearance, controller.edit)
router.delete("/:id", auth, proponentClearance, controller.remove)
// enrollments
router.post("/ids/:id/enrollments",
    auth,
    controller.util.middlewares.verifyEventIntegrity,
    controller.addEnrollment
)
router.delete("/ids/:id/enrollments",
    auth,
    controller.util.middlewares.verifyEventIntegrity,
    controller.removeEnrollment
)
router.delete("/ids/:id/enrollments/:userId",
    auth,
    proponentClearance,
    controller.util.middlewares.verifyEventIntegrity,
    controller.removeEnrollmentByUserId
)
// discussions
router.get("/ids/:id/discussions/:discussionId",
    controller.util.middlewares.verifyEventIntegrity,
    controller.util.middlewares.verifyDiscussionIntegrity,
    controller.getDiscussionById
)
router.post("/ids/:id/discussions",
    auth,
    controller.util.middlewares.verifyEventIntegrity,
    controller.addDiscussion
)
router.put("/ids/:id/discussions/:discussionId",
    auth,
    controller.util.middlewares.verifyEventIntegrity,
    controller.util.middlewares.verifyDiscussionIntegrity,
    controller.editDiscussion
)
router.delete("/ids/:id/discussions/:discussionId",
    auth,
    proponentClearance,
    controller.util.middlewares.verifyEventIntegrity,
    controller.util.middlewares.verifyDiscussionIntegrity,
    controller.removeDiscussionById
)
// discussion answers
router.post("/ids/:id/discussions/:discussionId/answers",
    auth,
    controller.util.middlewares.verifyEventIntegrity,
    controller.util.middlewares.verifyDiscussionIntegrity,
    controller.addDiscussionAnswer
)
router.delete("/ids/:id/discussions/:discussionId/answers", auth, controller.removeDiscussionAnswer)

module.exports = app => app.use("/events", router)