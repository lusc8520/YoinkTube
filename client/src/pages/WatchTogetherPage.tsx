import {useWatchTogether} from "../context/WatchTogetherProvider.tsx";
import {useEffect, useRef, useState} from "react";
import {useSnackbar} from "../context/SnackbarProvider.tsx";
import {Alert, Box, Button, CircularProgress, IconButton, Popover, TextField, useTheme} from "@mui/material";
import {ClientDto, LobbyDto, tryExtractVideoId} from "@yoinktube/contract";
import {usePlayer} from "../context/PlayerProvider.tsx";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import VolumeMuteRoundedIcon from '@mui/icons-material/VolumeMuteRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ChatIcon from '@mui/icons-material/Chat';

function formatTime(timestamp: string | Date) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${formattedHours}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
}

export function WatchTogetherPage() {

    const {
        lobby,
        client: localClient,
        createLobby,
        joinLobby,
        leaveLobby,
        changeName,
        isConnected,
        connect,
        isLoading,
        isAllowed
    } = useWatchTogether()

    const {setVideoId} = usePlayer()

    const {showSnackbar} = useSnackbar()
    const [inputLobbyId, setInputLobbyId] = useState("")
    const [inputVideoId, setInputVideoId] = useState("")
    const [showNameDialog, setShowNameDialog] = useState(false)
    const [nameInput, setNameInput] = useState("")
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleChatClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        if (localClient !== undefined) setNameInput(localClient.displayName)
    }, [localClient]);

    if (isLoading) return <CircularProgress sx={{alignSelf: "center"}}/>

    if (!isConnected) {
        return (
            <Alert variant="outlined" severity="error" sx={{alignSelf: "center", alignItems: "center"}}>
                <div style={{display: "flex", gap: "0.5rem", alignItems: "center"}}>
                    <div style={{fontSize: "larger"}}>not connected to websocket</div>
                    <Button onClick={connect} color="error" variant="contained">reconnect</Button>
                </div>
            </Alert>
        )
    }

    if (localClient === undefined) return null

    return (
        <div style={{display: "flex", flexDirection: "column", gap: "1rem", fontSize: "larger", padding: "1rem",}}>
            <div style={{display: "flex", alignItems: "flex-end", gap: "0.5rem", borderBottom: "white 1px solid",
                paddingBottom: "0.5rem", justifyContent: "space-between"
            }}>
                <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
                    {nameDisplay(localClient.displayName)}
                </div>
                { lobby &&
                <IconButton onClick={handleChatClick}>
                    <ChatIcon/>
                </IconButton>
                }
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center"}}>
                {lobbyDisplay()}
            </div>
            <Popover
                id={id}
                open={open && lobby !== undefined}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div
                    style={{
                        border: '1px solid white',
                        borderRadius: '8px',
                        width: '320px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        marginBottom: '0.5rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #ccc',
                        padding: '0.5rem',
                    }}>
                        Lobby Chat
                    </div>

                    <div style={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        padding: '0.5rem',
                    }}>
                        {lobby ? (
                            <ChatDisplay lobby={lobby} />
                        ) : null}
                    </div>
                </div>
            </Popover>


        </div>
    )

    function lobbyDisplay() {
        return (
            (lobby === undefined)?
            <div style={{display: "flex", gap: "1rem", flexWrap: "wrap"}}>
                <Button
                    startIcon={<AddBoxIcon/>}
                    sx={{textTransform: "none"}}
                    variant="contained"
                    onClick={createLobby}>
                    create lobby
                </Button>
                <div style={{display: "flex", gap: "0.5rem", alignItems: "stretch"}}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none", textWrap: "nowrap"}}
                        onClick={() => joinLobby(inputLobbyId)}>
                        Join Lobby:
                    </Button>
                    <TextField
                        size="small"
                        onChange={e => {
                            const val = e.target.value
                            if (val.length > 10) return
                            setInputLobbyId(val.trim())
                        }}
                        value={inputLobbyId}
                        placeholder="lobby id"
                    />
                </div>
            </div>
            :
                <>
                    <div style={{display: "flex", gap: "0.5rem", alignItems: "center"}}>
                        <div>Lobby ID: {lobby.id} (share this)</div>
                        <IconButton
                            size="small"
                            sx={{color: "info.main" }}
                            onClick={() => {
                                navigator.clipboard.writeText(lobby.id)
                                showSnackbar("copied lobby id", "success")
                            }}>
                            <ContentCopyIcon/>
                        </IconButton>
                    </div>
                    <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                        {
                            isAllowed &&
                            <div style={{display: "flex", gap: "0.5rem", alignItems: "center"}}>
                                <div>Change Video:</div>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    onChange={e => {
                                        setInputVideoId(e.target.value)
                                    }}
                                    value={inputVideoId}
                                    placeholder="Youtube Link..."
                                />
                                <Button
                                    size="small"
                                    variant="acceptButton"
                                    onClick={() => {
                                        try {
                                            const videoId = tryExtractVideoId(inputVideoId)
                                            setVideoId(videoId)
                                        } catch (e) {
                                            showSnackbar("invalid link", "error")
                                        }
                                    }}>
                                    OK
                                </Button>
                            </div>
                        }
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                        <div style={{display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center"}}>
                            { <ClientList lobby={lobby}/> }
                        </div>
                    </div>
                    <Button
                        sx={{textTransform: "none", alignSelf: "center", backgroundColor: "error.dark", ":hover": {backgroundColor: "error.light"},}}
                        startIcon={<LogoutIcon style={{transform: "rotate(180deg)"}}/>}
                        variant="cancelButton"
                        onClick={leaveLobby}>
                        Leave Lobby
                    </Button>
                </>
        )
    }

    function nameDisplay(name: string) {
        return (
            showNameDialog ?
                <>
                    <TextField
                        size="small"
                        variant="standard"
                        value={nameInput}
                    onChange={e => {
                        const val = e.target.value
                        if (val.length > 20) return
                        setNameInput(e.target.value)
                    }}
                />
                <Button
                    sx={{textTransform: "none"}}
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => {
                        if (nameInput !== name) {
                            changeName(nameInput)
                        }
                        setShowNameDialog(false)
                    }}>
                Ok
                </Button>
                <Button
                    size="small"
                    sx={{textTransform: "none"}}
                    color="error"
                    variant="contained"
                    onClick={() => setShowNameDialog(false)}>
                    Cancel
                </Button>
            </>
            :
            <>
                <div>@{name}</div>
                <Button
                    size="small"
                    sx={{textTransform: "none"}}
                    variant="contained"
                    onClick={() => setShowNameDialog(true)}>
                    Edit Name
                </Button>
            </>
        )
    }
}

function ChatDisplay({ lobby }: { lobby: LobbyDto }) {
    const { sendMessage, client: localClient } = useWatchTogether();
    const [input, setInput] = useState("");
    const theme = useTheme();
    // Speech recognition hooks
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lobby.messages]);

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    const handleSend = () => {
        if (input.length <= 0) return;
        sendMessage({ type: "sendChatMessage", text: input });
        setInput("");
        resetTranscript();
    };

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            SpeechRecognition.startListening();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
            }}>
                {lobby.messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            justifyContent: localClient?.id === msg.client.id ? "flex-end" : "flex-start",
                            margin: "0.2rem 0rem",
                        }}
                    >
                        <div
                            style={{
                                maxWidth: "65%",
                                padding: "0.7rem 1rem",
                                borderRadius: "20px",
                                backgroundColor: localClient?.id === msg.client.id ? theme.palette.success.dark : theme.palette.info.light,
                                color: localClient?.id === msg.client.id ? "white" : "black",
                                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                                position: "relative",
                                wordBreak: "break-word",
                                fontSize: "1rem",
                                lineHeight: "0.8rem",
                            }}
                        >
                            {localClient?.id !== msg.client.id && (
                                <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                                    @{msg.client.displayName}
                                </div>
                            )}
                            <div>{msg.text}</div>
                            <div
                                style={{
                                    fontSize: "0.7rem",
                                    color: localClient?.id === msg.client.id ? "lightgray" : "gray",
                                    textAlign: "right",
                                    marginTop: "0.5rem"
                                }}
                            >
                                {formatTime(msg.timestamp || new Date())}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem" }}>
                <TextField
                    size="small"
                    value={input}
                    placeholder="Message..."
                    fullWidth
                    inputProps={{ maxLength: 200 }}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                                borderColor: 'white',
                            },
                        },
                    }}
                />
                <Button onClick={handleSend} variant="contained">
                    Send
                </Button>
                <Button
                    variant="contained"
                    onClick={toggleListening}
                    sx={{
                        borderRadius: '50%',
                        minWidth: '40px',
                        height: '40px',
                        padding: 0,
                        backgroundColor: listening ? 'error.main' : 'primary.main',
                        '&:hover': {
                            backgroundColor: listening ? 'error.dark' : 'primary.light',
                        },
                        animation: listening ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                            '0%': {
                                boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)',
                            },
                            '70%': {
                                boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)',
                            },
                            '100%': {
                                boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)',
                            },
                        },
                    }}
                >
                    <MicOutlinedIcon />
                </Button>
            </div>
        </div>
    );
}



function ClientList({lobby}: { lobby: LobbyDto }) {

    const {client: localClient} = useWatchTogether()
    if (localClient === undefined) return null
    return (
        <>
            {<LocalClientItem key={localClient.id} client={localClient}/>}
            {
                lobby.clients.map(c => {
                    if (c.id === localClient?.id) return null
                    return <RemoteClientItem key={c.id} client={c}/>
                })
            }
        </>
    )
}

function LocalClientItem({client}: { client: ClientDto }) {
    const {

        toggleVideoMute,
        toggleAudioMute,
        audioMute,
        videoMute,
        localAudioTrack,
        localVideoTrack
    } = useWatchTogether()

    const [localStream, setLocalStream] = useState<MediaStream>(new MediaStream())
    const [loading, setLoading] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    async function handleClick(func: () => Promise<void>) {
        if (loading) return
        setLoading(true)
        await func()
        setLoading(false)
    }

    useEffect(() => {
        if (localVideoTrack !== undefined) localStream.addTrack(localVideoTrack)
        if (localAudioTrack !== undefined) localStream.addTrack(localAudioTrack)
    }, [localAudioTrack, localVideoTrack])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = localStream
        }
    }, [videoRef])


    return (
        <div
            style={{display: "flex", flexDirection: "column", alignItems: "center"}}
            key={client.id}>
            <video
                style={{width: "300px", height: "200px", objectFit: "cover", backgroundColor: "black",
                    border: "1px solid white", borderRadius: "10px", marginRight: "5px" }}
                ref={videoRef}
                autoPlay
                muted={true}
            />
            <div style={{display: "flex", gap: "1rem", paddingTop: "0.2rem", paddingBottom: "0.2rem"}}>
                <div
                    style={{display: "flex", alignItems: "center", cursor: "pointer"}}
                    onClick={() => handleClick(toggleAudioMute)}>
                    { audioMute? <VolumeOffRoundedIcon/> : <VolumeUpRoundedIcon/> }
                </div>
                <div
                    style={{display: "flex", alignItems: "center", cursor: "pointer"}}
                    onClick={() => handleClick(toggleVideoMute)}>
                    { videoMute ? <VideocamOffRoundedIcon/> : <VideocamRoundedIcon/>}
                </div>
            </div>
            {client.displayName} (You)
        </div>
    )
}

function RemoteClientItem({client}: { client: ClientDto }) {
    const {
        peerConnections
    } = useWatchTogether()

    const videoRef = useRef<HTMLVideoElement>(null)
    const pc = peerConnections.get(client.id)
    const [volume, setVolume] = useState(1)


    useEffect(() => {

        const stream = pc?.remoteStream
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [videoRef, pc])

    function getVolumeIcon() {
        if (volume <= 0.0) {
            return <VolumeMuteRoundedIcon color="inherit"/>
        } else if (volume <= 0.5) {
            return <VolumeDownRoundedIcon color="inherit"/>
        } else {
            return <VolumeUpRoundedIcon color="inherit"/>
        }
    }

    return (
        <div
            style={{display: "flex", flexDirection: "column", alignItems: "center"}}
            key={client.id}>
            <div style={{width: "300px", height: "200px", backgroundColor: "black", border: "1px solid white", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginRight: "5px"}}>
                {
                    pc?.videoMute ?
                        <VideocamOffRoundedIcon/>
                        :
                        <video
                            style={{width: "300px", height: "200px", objectFit: "cover"}}
                            ref={videoRef}
                            autoPlay
                            muted={false}
                        />
                }
                {
                    (pc?.audioMute) && <div style={{position: "absolute", left: "10px", top: "10px"}}>
                        <VolumeOffRoundedIcon/>
                    </div>
                }
            </div>
            <div
                style={{display: "flex"}}>
                { getVolumeIcon() }
                <input
                    min={0}
                    max={1}
                    value={volume}
                    step={0.1}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setVolume(val)
                        if (videoRef.current !== null) videoRef.current.volume = val
                    }}
                    type="range"
                />
            </div>
            <div>
                {client.displayName}
            </div>
        </div>
    )
}