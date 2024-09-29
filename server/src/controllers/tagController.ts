import { Request, Response } from 'express';
import { getAllTagsService } from '../services/tagService';

export const getAllTags = async (req: Request, res: Response) => {
    const tags = await getAllTagsService();
    res.json(tags);
};
