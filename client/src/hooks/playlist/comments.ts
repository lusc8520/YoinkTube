import {InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useFetch} from "../../context/FetchProvider.tsx";
import {CommentCreationRequest, CommentDto} from "@yoinktube/contract";
import {useSnackbar} from "../../context/SnackbarProvider.tsx";

export function useComments(playlistId: number) {

    const {fetchData} = useFetch()

    const fetchComments = async () => {
        return await fetchData<CommentDto[]>(`/comments/${playlistId}`, "GET")
    }

    return useQuery({
        queryKey: ["comments", playlistId],
        queryFn: fetchComments,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })
}
const pageSize = 10
export function useInfiniteComments(playlistId: number) {
    const {fetchData} = useFetch()

    return useInfiniteQuery({
        queryKey: ["comments", playlistId],
        queryFn: ({pageParam }) => {
            return fetchData<CommentDto[]>(`/comments/${playlistId}?page=${pageParam}`, "GET")
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < pageSize) {
                return undefined
            }
            return allPages.length
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        staleTime: 0,
        initialPageParam: 0,
    })
}

export function useAddComment() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const queryClient = useQueryClient()
    const addComment = async (request: CommentCreationRequest) => {
        if (request.text.length <= 0) throw {message: "can't send empty comment"}
        return await fetchData<CommentDto>(`/comments`, "POST", request)
    }

    return useMutation({
        mutationFn: addComment,
        onSuccess: (comment, request) => {
            showSnackbar("added comment", "success")
            queryClient.setQueryData<InfiniteData<CommentDto[], unknown> | undefined>( ["comments", request.playlistId],
                (oldData) => {
                if (oldData === undefined) return oldData
                const updatedPages = oldData.pages.map((page, index) => {
                    if (index === 0) {
                        return [comment, ...page]
                    }
                    return page;
                })
                return {
                    ...oldData,
                    pages:updatedPages
                }
            })
        },
        onError: (e) => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useAddCommentReply() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const queryClient = useQueryClient()
    async function addComment(request: CommentCreationRequest) {
        if (request.text.length <= 0) throw {message: "can't send empty comment"}
        return await fetchData<CommentDto>(`/comments`, "POST", request)
    }

    return useMutation({
        mutationFn: addComment,
        onSuccess: (comment, request) => {
            queryClient.setQueryData<InfiniteData<CommentDto[], unknown> | undefined>( ["comments", request.playlistId],
                (oldData) => {
                    if (oldData === undefined) return oldData
                    const updatedPages = oldData.pages.map((page, index) => {
                        return page.map(c => {
                            if (c.id !== request.parentId) return c
                            return {
                                ...c,
                                replies: [...c.replies, comment]
                            }
                        })
                    })
                    return {
                        ...oldData,
                        pages:updatedPages
                    }
                })
        },
        onError: (e) => {
            showSnackbar(e.message, "error")
        }
    })
}



function deleteNestedComment(comments: CommentDto[], commentId: number) {
    function removeCommentFromList(commentList: CommentDto[]): CommentDto[] {
        return commentList
            .filter(comment => comment.id !== commentId)
            .map(comment => ({
                ...comment,
                replies: removeCommentFromList(comment.replies)
            }));
    }
    return removeCommentFromList(comments);
}

export function useDeleteComment() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const queryClient = useQueryClient()
    const deleteComment = async ({commentId, playlistId}: {commentId: number,playlistId: number}) => {
        return await fetchData(`/comments/${commentId}`, "DELETE")
    }

    return useMutation({
        mutationFn: deleteComment,
        retry: false,
        onSuccess: (_, {commentId, playlistId}) => {
            showSnackbar("deleted comment", "success")
            queryClient.setQueryData<InfiniteData<CommentDto[], unknown> | undefined>( ["comments", playlistId],
                (oldData) => {
                    if (oldData === undefined) return oldData
                    const updatedPages = oldData.pages.map(p => {
                        return deleteNestedComment(p, commentId)
                    })
                    return {
                        ...oldData,
                        pages:updatedPages
                    }
                })
        },
        onError: (e) => {
            showSnackbar(e.message, "error")
        }
    })
}