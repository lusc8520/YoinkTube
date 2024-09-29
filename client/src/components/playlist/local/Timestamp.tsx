import {VideoDto} from "@yoinktube/contract";
import {Box, Button, TextField} from "@mui/material";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {db, Timestamp} from "../../../localDatabase/dexie.ts";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";
import {LocalPlaylist} from "../../../types/PlaylistData.ts";
import {useEffect, useState} from "react";
import {preview} from "vite";


type Props = {
    video: VideoDto
    onSuccess?: () => void
    onCancel?: () => void
    playlist: LocalPlaylist
}

export function TimestampDialog({video, onSuccess, onCancel, playlist} : Props) {

    const {data, isLoading} = useTimestamp(video.id)
    const {mutate: editTimestamp, isSuccess: editSuccess} = useEditTimestamp()
    const {mutate: deleteTimestamp, isSuccess: deleteSuccess} = useDeleteTimestamp()

    useEffect(() => {
        if (editSuccess) onSuccess?.()
    }, [editSuccess])

    if (isLoading) return null

    const timestamp = data ?? {start: 0, end: 0}
    return <TimeStampEditor timestamp={timestamp}/>

    function TimeStampEditor({timestamp} : {timestamp: Timestamp}) {

        const toMinutes = timestampToMinutes(timestamp)
        const [timestampMinutes, setTimestampMinutes] = useState<TimestampMinutes>(toMinutes)
        const toTimestamp = minutesToTimestamp(timestampMinutes)
        const isValid = validateInput(toTimestamp)

        function confirm() {
            editTimestamp({videoId: video.id, playlistId: playlist.id, timestamp: toTimestamp})
        }

        function reset() {
            deleteTimestamp({videoId: video.id, playlistId: playlist.id})
        }

        function update(t: Partial<TimestampMinutes>) {

            setTimestampMinutes(prev => ({
                ...prev,
                ...t,
                start: {
                    ...prev.start,
                    ...(t.start || {})
                },
                end: {
                    ...prev.end,
                    ...(t.end || {})
                }
            }));
        }

        return (
            <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">

                <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
                    <Box>Start Time:</Box>
                    <Box display="flex" gap="0.25rem" alignItems="center">
                        <TextField
                            inputProps={{ min: 0 }}
                            value={timestampMinutes.start.minutes}
                            onChange={event => {
                                update({
                                    start: {
                                        minutes: parseIntWithDefault(event.target.value),
                                        seconds: timestampMinutes.start.seconds
                                    }
                                })
                            }}
                            label="Minutes..."
                            type="number"/>
                        <Box fontSize="xx-large">:</Box>
                        <TextField
                            inputProps={{ min: 0 }}
                            value={timestampMinutes.start.seconds}
                            onChange={event => {
                                update({
                                    start: {
                                        minutes: timestampMinutes.start.minutes,
                                        seconds: parseIntWithDefault(event.target.value)
                                    }
                                })
                            }}
                            label="Seconds..."
                            type="number"/>
                    </Box>
                </Box>

                <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
                    <Box>End Time:</Box>
                    <Box display="flex" gap="0.25rem" alignItems="center">
                        <TextField
                            inputProps={{ min: 0 }}
                            value={timestampMinutes.end.minutes}
                            onChange={event => {
                                update({
                                    end: {
                                        minutes: parseIntWithDefault(event.target.value),
                                        seconds: timestampMinutes.end.seconds
                                    }
                                })
                            }}
                            label="Minutes..."
                            type="number"/>
                        <Box fontSize="xx-large">:</Box>
                        <TextField
                            inputProps={{ min: 0 }}
                            value={timestampMinutes.end.seconds}
                            onChange={event => {
                                update({
                                    end: {
                                        minutes: timestampMinutes.end.minutes,
                                        seconds: parseIntWithDefault(event.target.value)
                                    }
                                })
                            }}
                            label="Seconds..."
                            type="number"/>
                    </Box>
                </Box>

                <Button
                    onClick={reset}
                    sx={{textTransform:"none"}}
                    color="info"
                    variant="contained">
                    Delete Timestamp
                </Button>

                <Box display="flex" gap="0.5rem">
                    <Button
                        onClick={confirm}
                        disabled={!isValid}
                        sx={{textTransform:"none"}}
                        color="success"
                        variant="contained">
                        Save
                    </Button>
                    <Button
                        onClick={onCancel}
                        sx={{textTransform:"none"}}
                        variant="contained"
                        color="error">
                        Cancel
                    </Button>
                </Box>
            </Box>
        )
    }
}


function parseIntWithDefault(s: string, fallback?: number): number {
    const n = parseInt(s)
    if (isNaN(n)) return fallback ?? 0
    return n
}

function useEditTimestamp() {

    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    async function editTimestamp({videoId, timestamp}: {videoId: number, timestamp: Timestamp, playlistId: number}) {
        return db.videos.where("id").equals(videoId).modify(video => {
            video.timestamp = timestamp
        })
    }

    return useMutation({
        mutationFn:editTimestamp,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({queryKey: ["localPlaylists"]})
            queryClient.invalidateQueries({queryKey: ["timestamp", variables.videoId]})
            queryClient.invalidateQueries({queryKey: ["localPlaylists", variables.playlistId]})
            showSnackbar("saved timestamp", "success")
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

function useDeleteTimestamp() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    async function deleteTimestamp({videoId, playlistId}: {videoId: number, playlistId: number}) {
        return db.videos.where("id").equals(videoId).modify(vid => {
            vid.timestamp = undefined
        })
    }

    return useMutation({
        mutationFn: deleteTimestamp,
        onSuccess: (data, {videoId, playlistId}, context) => {
            showSnackbar("timestamp was reset", "success")
            queryClient.invalidateQueries({queryKey: ["timestamp", videoId]})
            // queryClient.setQueryData<Timestamp | undefined>(["timestamp", videoId], (prev) => {
            //     return undefined
            // })
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useTimestamp(videoId: number | undefined) {

    async function getTimestamp(): Promise<Timestamp | null>{
        if (videoId === undefined) return null
        const vid = await db.videos.get(videoId)
        if (vid === undefined) throw {message: "video does not exist"}
        return vid.timestamp ?? null
    }

    return useQuery({
        queryKey: ["timestamp", videoId],
        queryFn: getTimestamp
    })
}

function validateInput(t: Timestamp): boolean {
    return (t.end > t.start)
}

type TimestampMinutes = {
    start: Minutes
    end: Minutes
}

type Minutes = {
    minutes: number
    seconds: number
}

function timestampToMinutes(timestamp: Timestamp) : TimestampMinutes {
    return {
        start: secondsToMinutes(timestamp.start),
        end: secondsToMinutes(timestamp.end)
    }
}

function secondsToMinutes(totalSeconds: number): Minutes {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return { minutes, seconds }
}

function minutesToSeconds(minutes: Minutes): number {
    return minutes.minutes * 60 + minutes.seconds
}

function minutesToTimestamp(timestampMinutes: TimestampMinutes): Timestamp {
    return {
        start: minutesToSeconds(timestampMinutes.start),
        end: minutesToSeconds(timestampMinutes.end)
    }
}
