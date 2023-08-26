const router = require('express').Router();

const { validateUpdateUser } = require('../middlewares/validate');
const {
  getCurrentUser,
  updateUser,
} = require('../controllers/users');

router.get('/me', getCurrentUser);

router.patch('/me', validateUpdateUser, updateUser);

module.exports = router;
