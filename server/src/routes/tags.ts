import { Router } from 'express';
import { getAllTags } from '../controllers/tagController';

const tagRoutes: Router = Router();

tagRoutes.get('/', getAllTags);

export default tagRoutes;