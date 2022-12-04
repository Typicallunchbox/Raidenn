const express = require('express')
const router = express.Router()
const { getComments, getCommentsByMovieId, setComment, updateComment, deleteComment } = require('../controllers/commentController')
const {protect} = require('../middleware/authMiddleware')

router.route('/').get(protect,getComments).post(protect, setComment)
router.route('/movieId/:id').get(protect,getCommentsByMovieId)
router.route('/:id').put(protect, updateComment).delete(protect, deleteComment)

module.exports = router