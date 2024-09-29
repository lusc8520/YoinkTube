import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react"
import {baseUrl} from "../env/env.ts"
import {useSnackbar} from "./SnackbarProvider.tsx"
import {
    ChatMessage,
    ClientDto,
    LobbyDto, MuteMessage,
    SynchState,
    WatchTogetherClientMessage,
    WatchTogetherServerMessage
} from "@yoinktube/contract"
import {useAuth} from "./AuthProvider.tsx"
import {usePlayer} from "./PlayerProvider.tsx"


type WatchTogetherData = {
    client: ClientDto | undefined,
    lobby: LobbyDto | undefined,
    createLobby: () => void,
    joinLobby: (lobbyId: string) => void,
    leaveLobby: () => void,
    changeName: (name: string) => void,
    changeVideo: (videoId: string) => void,
    isConnected : boolean,
    isLoading: boolean,
    connect: () => void,
    isAllowed: boolean,
    peerConnections: Map<number , PeerConnection>,
    toggleAudioMute: () => Promise<void>,
    toggleVideoMute: () => Promise<void>,
    audioMute: boolean,
    videoMute: boolean,
    localAudioTrack: MediaStreamTrack | undefined,
    localVideoTrack: MediaStreamTrack | undefined,
    sendMessage : (msg: WatchTogetherClientMessage) => void
}

const WatchTogetherContext = createContext<WatchTogetherData |undefined>(undefined)

export function WatchTogetherProvider({children}: {children: ReactNode}) {

    const {showSnackbar} = useSnackbar()
    const {user} = useAuth()
    const [currentClient, setCurrentClient] = useState<ClientDto | undefined>(undefined)
    const [currentLobby, setCurrentLobby] = useState<LobbyDto | undefined>(undefined)
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const isAllowed = checkIsOwner()

    const [peerConnections, setPeerConnections] = useState<Map<number, PeerConnection>>(new Map())
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack>()
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack>()
    const [audioMute, setAudioMute] = useState(true)
    const [videoMute, setVideoMute] = useState(true)

    const {currentVideoId, setVideoId, playerState, player, synchronize, speed} = usePlayer()
    const allowedRef = useRef(isAllowed)
    const playerRef = useRef(player)
    const synchRef = useRef<SynchState>()

    useEffect(() => {
        const interval = setInterval(() => {
            forceSynch()
        }, 500)

        return () => clearInterval(interval)
    }, [])


    useEffect(() => {
        playerRef.current = player
    }, [player])

    useEffect(() => {
        allowedRef.current = isAllowed
    }, [isAllowed])


    function forceSynch() {
        if (allowedRef.current) return
        if (synchRef.current === undefined) return
        if (playerRef.current === undefined) return
        const player = playerRef.current
        const pState = player.getPlayerState()
        const state = synchRef.current

        setVideoId(state.videoId)
        if (state.videoId === undefined) return

        let showError = false

        // apply time according to new state from owner
        const currentPlayerTime = player.getCurrentTime()
        if (state.playerState === YT.PlayerState.PLAYING) {
            const diff = (Date.now() - state.timestamp) / 1000 // diff in seconds
            const shouldBeTime = state.time + (diff * state.speed)
            const timeDiff = currentPlayerTime - shouldBeTime // time diff for wiggle room
            if (Math.abs(timeDiff) > 1) {
                showError = true
                player.seekTo(shouldBeTime, true)
            }
        } else if (state.playerState === YT.PlayerState.PAUSED) {
            const timeDiff = currentPlayerTime - state.time
            if (Math.abs(timeDiff) > 1) {
                showError = true
                player.seekTo(state.time, true)
            }
        }

        // apply pause or playing state according to owner
        if (pState !== state.playerState) {
            if (pState === YT.PlayerState.PLAYING || pState === YT.PlayerState.PAUSED) showError = true
            if (state.playerState === YT.PlayerState.PLAYING) {
                player.playVideo()
            } else {
                player.pauseVideo()
            }
        }

        // apply playbackrate according to owner
        player.setPlaybackRate(state.speed)

        if (showError) showSnackbar("you are not the lobby owner", "error")
    }

    useEffect(() => {
        sendUpdate()
    }, [playerState, speed])

    function sendUpdate() {
        if (!isAllowed || playerState === undefined || player === undefined || currentLobby === undefined) return
        if (playerState !== YT.PlayerState.PLAYING && playerState !== YT.PlayerState.PAUSED) return
        sendMessage(
            {
                type: "update",
                state: {
                    videoId: currentVideoId,
                    playerState: playerState,
                    timestamp: Date.now(),
                    time: player.getCurrentTime(),
                    speed: player.getPlaybackRate()
                }
            }
        )
    }

    useEffect(() => {
        if (!isAllowed || currentLobby === undefined) return
        changeVideo(currentVideoId)
    }, [currentVideoId])


    useEffect(() => {
        if (user !== undefined && isConnected) {
            changeName(user.username)
        }
    }, [user])

    const [webSocket, setWebSocket] = useState<WebSocket| undefined>(undefined)
    useEffect(() => {
        connect()
    }, [])

    function checkIsOwner(): boolean {
        if (currentLobby === undefined || currentClient === undefined) return true
        return currentClient.id === currentLobby.ownerId
    }

    function connect() {
        setIsLoading(true)
        setWebSocket(new WebSocket(baseUrl))
    }

    if (webSocket !== undefined) {
        webSocket.onopen = e => {
            setIsConnected(true)
            setIsLoading(false)
        }
        webSocket.onerror = event => {
            setIsLoading(false)
            showSnackbar("websocket connection failed", "error")
            webSocket.close()
        }
        webSocket.onclose = e => {
            setIsConnected(false)
            setCurrentClient(undefined)
            setCurrentLobby(undefined)
        }
        webSocket.onmessage = msg => {
            try {
                handleMessage(JSON.parse(msg.data))
            } catch (error) {
                showSnackbar("websocket error (look console)", "error")
                console.error("websocket error", error)
            }
        }
    }

    function changeName(name: string) {
        sendMessage({type: "changeName", name: name})
    }

    function changeVideo(videoId: string | undefined) {
        sendMessage({type: "changeVideo", videoId: videoId})
    }

    function createLobby() {
        sendMessage(
            {
                type: "createLobby",
                state: {
                    speed: player?.getPlaybackRate() ?? 1,
                    videoId: currentVideoId,
                    playerState: (playerState === 1)? 1 : 2,
                    time: player?.getCurrentTime() ?? 0,
                    timestamp: Date.now()
                }
            }
        )
    }

    function joinLobby(lobbyId: string) {
        sendMessage({type: "joinLobby", lobbyId: lobbyId})
    }

    function leaveLobby() {
        sendMessage({type: "leaveLobby"})
    }


    function sendMessage(message: WatchTogetherClientMessage) {
        webSocket?.send(JSON.stringify(message))
    }

    async function sendOfferToClient(client: ClientDto) {
        if (client.id === currentClient?.id) return

        const remoteStream = new MediaStream()
        const peerConnection = new RTCPeerConnection(rtcConfig)
        peerConnection.onnegotiationneeded = async () => {
            const reOffer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(reOffer)
            sendMessage({type: "renegotiate", init: reOffer, toClient: client.id})
        }

        setPeerConnections(peerConnections.set(client.id, {remoteStream: remoteStream, connection: peerConnection, audioMute: true, videoMute: true}))

        peerConnection.ontrack = event => {
            remoteStream.addTrack(event.track)
        }

        const candidates: RTCIceCandidate[] = []

        peerConnection.onicecandidate = event => {
            if (event.candidate === null) return
            candidates.push(event.candidate)
        }

        peerConnection.onicegatheringstatechange = ev => {
            if (peerConnection.iceGatheringState === "complete") {
                candidates.forEach(candidate => {
                    sendMessage({type: "sendCandidate", clientId: client.id, candidate: candidate.toJSON() })
                })
            }
        }

        const offer = await peerConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true})
        await peerConnection.setLocalDescription(offer)
        sendMessage({type: "sendOffer", clientId: client.id, sdp: offer.sdp})
    }

    function updatePeerConnection(id: number, func: (pc: PeerConnection) => PeerConnection) {
        setPeerConnections(prevState => {
            const peer = prevState.get(id)
            if (peer === undefined) return prevState

            const updatedPeer = func(peer)
            const newMap = new Map(prevState)
            return newMap.set(id, updatedPeer)
        })
    }

    async function receiveOffer(clientId: number, sdp?: string) {
        if (clientId === currentClient?.id) return
        if (currentClient === undefined) return

        const remoteStream = new MediaStream()
        const peerConnection = new RTCPeerConnection(rtcConfig)
        peerConnection.onnegotiationneeded = async () => {
            const reOffer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(reOffer)
            sendMessage({type: "renegotiate", init: reOffer, toClient: clientId})
        }

        console.warn("received offer")

        setPeerConnections(peerConnections.set(clientId, {remoteStream: remoteStream, connection: peerConnection, audioMute: true, videoMute: true}))

        if (localAudioTrack !== undefined) peerConnection.addTrack(localAudioTrack)
        if (localVideoTrack !== undefined) peerConnection.addTrack(localVideoTrack)

        peerConnection.ontrack = event => {
            remoteStream.addTrack(event.track)
        }

        const candidates: RTCIceCandidate[] = []
        peerConnection.onicecandidate = event => {
            if (event.candidate === null) return
            candidates.push(event.candidate)
        }

        peerConnection.onicegatheringstatechange = ev => {
            if (peerConnection.iceGatheringState === "complete") {
                candidates.forEach(candidate => {
                    sendMessage({type: "sendCandidate", clientId: clientId, candidate: candidate.toJSON() })
                })
            }
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription({type: "offer", sdp: sdp}))
        const answer = await peerConnection.createAnswer({offerToReceiveAudio: true, offerToReceiveVideo: true})
        await peerConnection.setLocalDescription(answer)

        sendMessage({type: "muteMessage", muteType: "audio", value: audioMute})
        sendMessage({type: "muteMessage", muteType: "video", value: videoMute})
        sendMessage({type: "sendAnswer", clientId: clientId, sdp: answer.sdp})
    }

    async function toggleAudioMute() {

        let audioTrack: MediaStreamTrack
        if (localAudioTrack === undefined) {
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({audio: true})
                audioTrack = localStream.getAudioTracks()[0]
                if (!audioTrack) throw {message: "no audio detected"}
                setLocalAudioTrack(audioTrack)
                peerConnections.forEach(pc => {
                    pc.connection.addTrack(audioTrack)
                })

            } catch (e: any) {
                showSnackbar(e.message, "error")
                return
            }
        } else {
            audioTrack = localAudioTrack
        }
        audioTrack.enabled = audioMute
        sendMessage({type: "muteMessage", muteType: "audio", value: !audioMute})
        setAudioMute(!audioMute)
    }

    async function toggleVideoMute() {
        let videoTrack: MediaStreamTrack
        if (localVideoTrack === undefined) {
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({video: true})
                videoTrack = localStream.getVideoTracks()[0]
                if (!videoTrack) throw {message: "no video detected"}
                setLocalVideoTrack(videoTrack)
                peerConnections.forEach(pc => {
                    pc.connection.addTrack(videoTrack)
                })

            } catch (e: any) {
                showSnackbar(e.message, "error")
                return
            }
        } else {
            videoTrack = localVideoTrack
        }
        videoTrack.enabled = videoMute
        sendMessage({type: "muteMessage", muteType: "video", value: !videoMute})
        setVideoMute(!videoMute)
    }

    async function receiveAnswer(clientId: number, sdp?: string) {

        const connection = peerConnections.get(clientId)
        if (connection === undefined) return
        console.warn("received answer")
        const peerConnection = connection.connection
        if (localAudioTrack !== undefined) peerConnection.addTrack(localAudioTrack)
        if (localVideoTrack !== undefined) peerConnection.addTrack(localVideoTrack)
        await peerConnection.setRemoteDescription(new RTCSessionDescription({type: "answer", sdp: sdp}))
        sendMessage({type: "muteMessage", muteType: "audio", value: audioMute})
        sendMessage({type: "muteMessage", muteType: "video", value: videoMute})
    }

    async function handleNegotiate(fromClient: number, init: RTCSessionDescriptionInit) {
        const peerConnection = peerConnections.get(fromClient)
        if (peerConnection === undefined) return

        const rtcConnection = peerConnection.connection

        if (init.type === "offer") {
            await rtcConnection.setRemoteDescription(init)
            const answer = await rtcConnection.createAnswer({offerToReceiveAudio: true, offerToReceiveVideo: true})
            await rtcConnection.setLocalDescription(answer)
            sendMessage({type: "renegotiate", init: answer, toClient: fromClient})
        } else if (init.type === "answer") {
            await rtcConnection.setRemoteDescription(init)
        }
    }

    async function receiveCandidate(clientId: number, candidate:  RTCIceCandidateInit) {
        const connection = peerConnections.get(clientId)
        if (connection === undefined) return
        console.warn("received candidate")
        await connection.connection.addIceCandidate(new RTCIceCandidate(candidate))
    }

    function handleMute(msg: MuteMessage) {
        const {clientId, muteType, value} = msg
        updatePeerConnection(clientId, pc => {
            if (muteType === "video") {
                return {
                    ...pc,
                    videoMute: value
                }
            } else if (muteType === "audio") {
                return {
                    ...pc,
                    audioMute: value
                }
            }
            return pc
        })
    }

    function clearLobby() {
        peerConnections.forEach(pc => {
            pc.connection.close()
        })
        setPeerConnections(new Map())
        setCurrentLobby(undefined)
    }


    function handleMessage(message: WatchTogetherServerMessage) {
        switch (message.type) {
            case "connected":
                setCurrentClient(message.client)
                break
            case "changedName":
                if (message.data.isSuccess) {
                    const newName = message.data.name
                    updateLobby(lob => changeClientNameInLobby(currentClient?.id, newName, lob))
                    updateClient(client => changeClientName(client, newName))
                } else {
                    showSnackbar(message.data.reason, "error")
                }
                break
            case "createdLobby":
                setCurrentLobby(message.lobby)
                changeVideo(currentVideoId)
                showSnackbar("created lobby", "success")
                break
            case "leftLobby":
                clearLobby()
                showSnackbar("left lobby", "success")
                break
            case "joinedLobby":
                if (message.data.isSuccess) {
                    setCurrentLobby(message.data.lobby)
                    synchRef.current = message.data.lobby.state
                    synchronize(message.data.lobby.state)
                    message.data.lobby.clients.forEach(sendOfferToClient)

                    showSnackbar("joined lobby", "success")
                } else {
                    showSnackbar("lobby does not exist", "error")
                }
                break
            case "clientChangedName":
                updateLobby(lob => changeClientNameInLobby(message.clientId, message.name, lob))
                break
            case "clientJoinedLobby":
                updateLobby(lob => addClientToLobby(message.client, lob))
                break
            case "clientLeftLobby":
                const newMap = new Map(peerConnections)
                newMap.delete(message.clientId)
                setPeerConnections(newMap)
                updateLobby(lob => removeClientFromLobby(message.clientId, message.newOwnerId, lob))
                break
            case "videoChanged":
                updateLobby(lob => updateVideo(lob, message.videoId))
                break
            case "update":
                synchRef.current = message.state
                synchronize(message.state)
                break
            case "receiveOffer":
                receiveOffer(message.clientId, message.sdp)
                break
            case "receiveAnswer":
                receiveAnswer(message.clientId, message.sdp)
                break
            case "receiveCandidate":
                receiveCandidate(message.clientId, message.candidate)
                break
            case "renegotiate":
                handleNegotiate(message.senderClient, message.init)
                break
            case "muteMessage":
                handleMute(message)
                break
            case "receiveChatMessage":
                addChatMessage(message.msg)

        }
    }

    function addChatMessage(msg: ChatMessage) {

        updateLobby(lobby => {
            return {
                ...lobby,
                messages: [...lobby.messages, msg]
            }
        })
    }

    function updateClient(updateFunc: (client: ClientDto) => ClientDto) {
        if (currentClient === undefined) return
        setCurrentClient(updateFunc(currentClient))
    }

    function updateLobby(updateFunc: (lobby: LobbyDto) => LobbyDto) {
        setCurrentLobby(prev => {
            if (prev === undefined) return prev
            return updateFunc(prev)
        })
    }

    function changeClientName(client: ClientDto, name: string): ClientDto {
        // showSnackbar(`${client.displayName} changed name to ${name}`, "info")
        return {
            ...client,
            displayName: name
        }
    }

    function changeClientNameInLobby(clientId: number | undefined, name: string ,lobby: LobbyDto): LobbyDto {
        return {
            ... lobby,
            clients: lobby.clients.map(c => {
                if (c.id === clientId) {
                    return changeClientName(c, name)
                }
                return c
            })
        }
    }

    function updateVideo(lobby: LobbyDto, videoId: string | undefined): LobbyDto {
        setVideoId(videoId)
        if (synchRef.current !== undefined) synchRef.current = {...synchRef.current, videoId: videoId}
        showSnackbar("lobby video changed", "info")
        return {
            ...lobby,
            state: {
                ...lobby.state,
                videoId: videoId
            }
        }
    }

    function addClientToLobby(client: ClientDto, lobby:LobbyDto): LobbyDto {
        showSnackbar(`${client.displayName} joined the lobby`, "info")
        return {
            ...lobby,
            clients: [...lobby.clients, client]
        }
    }

    function removeClientFromLobby(clientId: number, newOwnerId: number | undefined , lobby: LobbyDto): LobbyDto {
        const pc = peerConnections.get(clientId)
        if (pc !== undefined) pc.connection.close()
        return {
            ...lobby,
            clients: removeClient(clientId, lobby),
            ownerId: newOwnerId ?? lobby.ownerId
        }
    }

    function removeClient(clientId: number, lobby: LobbyDto): ClientDto[] {
        return lobby.clients.filter(c => {
            if (c.id === clientId) {
                showSnackbar(`${c.displayName} left the lobby`, "info")
                return false
            }
            return true
        })
    }

    return (
        <WatchTogetherContext.Provider
            value={{
                client: currentClient,
                lobby: currentLobby,
                createLobby,
                joinLobby,
                leaveLobby,
                changeName,
                changeVideo,
                isConnected,
                connect,
                isLoading,
                isAllowed,
                peerConnections,
                toggleVideoMute,
                toggleAudioMute,
                audioMute,
                videoMute,
                localAudioTrack,
                localVideoTrack,
                sendMessage
            }}>
            {children}
        </WatchTogetherContext.Provider>
    )
}

export function useWatchTogether() {
    const context = useContext(WatchTogetherContext)
    if (context === undefined) {
        throw {message: "WATCH TOGETHER CONTEXT ERROR"}
    }
    return context
}

export type PeerConnection = {
    remoteStream: MediaStream
    connection: RTCPeerConnection,
    videoMute: boolean,
    audioMute: boolean
}

const rtcConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302"
            ]
        }
    ]
}