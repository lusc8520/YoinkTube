
export type ClientDto = {
    id: number
    displayName: string
}


export type ChatMessage = {
    client: ClientDto,
    text: string,
    timestamp: string;
}

export type LobbyDto = {
    id: string
    clients: ClientDto[]
    ownerId: number
    state: SynchState
    messages: ChatMessage[]
}

export type WatchTogetherClientMessage = {
    type: "createLobby"
    state: SynchState
} | {
    type: "joinLobby"
    lobbyId: string
} | {
    type: "leaveLobby"
} | {
    type: "changeName"
    name: string
} | {
    type : "changeVideo"
    videoId?: string
} |  UpdateMessage | {
    type: "sendOffer"
    clientId: number
    sdp?: string
} | {
    type: "sendCandidate"
    clientId: number
    candidate: RTCIceCandidateInit
} | {
    type: "sendAnswer"
    clientId: number
    sdp?: string
} | {
    type: "renegotiate"
    init: RTCSessionDescriptionInit
    toClient: number
} | Omit<MuteMessage, "clientId"> | {
    type: "sendChatMessage"
    text: string
}

export type UpdateMessage = {
    type: "update"
    state: SynchState
}

export type MuteMessage = {
    type: "muteMessage"
    muteType: "video" | "audio"
    value: boolean
    clientId: number
}

export type SynchState = {
    playerState: YT.PlayerState.PAUSED | YT.PlayerState.PLAYING
    time: number // zeitvortschritt des videos
    videoId? : string
    timestamp: number // zeitpunkt der absendung des zustands
    speed: number // abspielgeschwindigkeit des videos
}

export type WatchTogetherServerMessage = {
    type: "connected"
    client: ClientDto
} | {
    type: "createdLobby"
    lobby: LobbyDto
} | {
    type: "joinedLobby"
    data: {
        isSuccess: false
    } | {
        isSuccess: true
        lobby: LobbyDto
    }
} | {
    type: "clientJoinedLobby"
    client: ClientDto
} | {
    type: "leftLobby"
} | {
    type: "clientLeftLobby"
    clientId: number
    newOwnerId?: number
} | {
    type: "changedName"
    data: {
        isSuccess : false
        reason: string
    } | {
        isSuccess : true
        name: string
    }
} | {
    type: "clientChangedName"
    clientId: number
    name: string
} | {
    type: "videoChanged"
    videoId?: string
} | UpdateMessage | {
    type: "receiveOffer"
    clientId: number
    sdp?: string
}  | {
    type: "receiveCandidate",
    clientId: number
    candidate: RTCIceCandidateInit
} | {
    type: "receiveAnswer",
    clientId: number
    sdp?: string
} | {
    type: "renegotiate"
    init: RTCSessionDescriptionInit
    senderClient: number
} | MuteMessage | {
    type: "receiveChatMessage"
    msg: ChatMessage
}