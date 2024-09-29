import { prismaClient } from '../index'
import { TagDto } from "@yoinktube/contract";

const tagToDto = (tag: { id: number; name: string }): TagDto => {
    return {
        id: tag.id,
        name: tag.name
    };
};

export const getAllTagsService = async (): Promise<TagDto[]> => {
    const tags = await prismaClient.tag.findMany();
    return tags.map(tagToDto);
}
