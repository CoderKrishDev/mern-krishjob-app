import { Router } from 'express';

const router = Router();

import {
  getAllJobs,
  getSingleJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} from '../controllers/jobController.js';
import {
  validateIdParam,
  validateJobInput,
} from '../middleware/validationMiddleware.js';
import { checkForTestUser } from '../middleware/authMiddleware.js';

// router.get('/', getAllJobs);
// router.post('/', createJob);

router
  .route('/')
  .get(getAllJobs)
  .post(checkForTestUser, validateJobInput, createJob);

router.get('/stats', showStats);

router
  .route('/:id')
  .patch(checkForTestUser, validateJobInput, validateIdParam, updateJob)
  .get(validateIdParam, getSingleJob)
  .delete(checkForTestUser, validateIdParam, deleteJob);

export default router;
