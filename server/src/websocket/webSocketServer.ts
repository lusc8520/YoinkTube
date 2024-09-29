import WebSocket, {WebSocketServer} from "ws"
import {
    ChatMessage,
    ClientDto,
    LobbyDto, MuteMessage,
    SynchState,
    UpdateMessage,
    WatchTogetherClientMessage,
    WatchTogetherServerMessage
} from "@yoinktube/contract"
import {IncomingMessage, Server, ServerResponse} from "node:http"

const connectedClients = new Map<number, Client>()
let idCounter = 0

const lobbies = new Map<string, Lobby>()

type Client = {
    id: number,
    displayName: string,
    webSocket: WebSocket,
    currentLobbyId?: string
}

const Client = {
    equals: function (c1: Client, c2: Client) {
        return c1.id === c2.id
    }
}


type Lobby = {
    id: string,
    clients: Map<number, Client>,
    ownerId: number,
    state: SynchState,
    messages: ChatMessage[]
}


export function setupWebSocket(httpServer: Server<typeof IncomingMessage, typeof ServerResponse>) {
    const webSocketServer = new WebSocketServer({server: httpServer})

    webSocketServer.on("connection", (webSocket, request) => {
        const clientId = idCounter
        const client: Client = {
            id: clientId,
            webSocket: webSocket,
            displayName: `user${clientId}`
        }
        
        connectedClients.set(clientId, client)
        idCounter++

        webSocket.onmessage = (event) => {
            try {
                handleWatchTogetherMessage(JSON.parse(event.data as string), client)
            } catch (error) {
                console.error("unknown message error", error)
                webSocket.close()
            }
        }
        webSocket.onerror = (event) => {
            webSocket.close()
        }
        webSocket.onclose = (event) => {
            leaveLobby(client)
            connectedClients.delete(clientId)
        }
        sendMessageToClient(client, {type: "connected", client: clientToDto(client)})
    })
}


function handleWatchTogetherMessage(message: WatchTogetherClientMessage, client: Client) {
    switch (message.type) {
        case "createLobby":
            createLobby(client, message.state)
            break
        case "joinLobby":
            joinLobby(client, message.lobbyId)
            break
        case "leaveLobby":
            leaveLobby(client)
            break
        case "changeName":
            changeClientName(client, message.name)
            break
        case "changeVideo":
            changeVideoInLobby(client, message.videoId)
            break
        case "update":
            handleUpdate(client, message)
            break
        case "sendOffer":
            handleOffer(client, message.clientId, message.sdp)
            break
        case "sendAnswer":
            handleAnswer(client, message.clientId, message.sdp)
            break
        case "sendCandidate":
            handleCandidate(client, message.clientId, message.candidate)
            break
        case "renegotiate":
            handleNegotiate(client, message.toClient, message.init)
            break
        case "muteMessage":
            handleMute(client, message)
            break
        case "sendChatMessage":
            broadcastChatMessage(client, message.text)

    }
    printLobbyState()
}

function handleNegotiate(client: Client, toClient: number, init: RTCSessionDescriptionInit) {

    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    const receiver = lobby.clients.get(toClient)
    if (receiver === undefined) return

    sendMessageToClient(receiver, {type: "renegotiate", init: init, senderClient: client.id})
}

function handleMute(client: Client, msg: Omit<MuteMessage, "clientId">) {
    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    broadcastMessageInLobbyExcept(
        lobby,
        client,
        {
            type: "muteMessage",
            muteType: msg.muteType,
            value: msg.value,
            clientId: client.id
        }
    )
}

function broadcastChatMessage(client: Client, text: string) {

    if (text.length <= 0 || text.length > 200) return
    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    const clientDto = clientToDto(client)
    const message: ChatMessage = {
        client: clientDto,
        text: text,
        timestamp: new Date().toISOString()
    };

    lobby.messages.push(message);
    broadcastMessageInLobby(lobby, { type: "receiveChatMessage", msg: message });
}

function changeVideoInLobby(client: Client, videoId: string | undefined) {
   const lobby = getClientLobby(client)
    if (lobby === undefined) return

    if (!isLobbyOwner(lobby, client)) {
        return
    }

    broadcastMessageInLobbyExcept(lobby, client, {type: "videoChanged", videoId: videoId})
}


function createLobby(client: Client, state: SynchState) {
    if (clientHasLobby(client)) return

    const lobbyId = createLobbyId()
    const lobby: Lobby = {
        id: lobbyId,
        clients: new Map<number, Client>([[client.id, client]]),
        ownerId: client.id,
        state: state,
        messages: []
    }
    lobbies.set(lobbyId,lobby)
    client.currentLobbyId = lobbyId

    sendMessageToClient(client, {type: "createdLobby", lobby: lobbyToDto(lobby)})
}

function joinLobby(client: Client, lobbyId: string) {
    if (clientHasLobby(client)) return

    const lobby = lobbies.get(lobbyId)
    if (lobby === undefined) {
        sendMessageToClient(client, {type: "joinedLobby", data: {isSuccess: false}})
        return
    }
    lobby.clients.set(client.id, client)
    client.currentLobbyId = lobbyId

    sendMessageToClient(client, {type: "joinedLobby", data: {isSuccess: true, lobby: lobbyToDto(lobby)}})
    broadcastMessageInLobbyExcept(lobby, client, {type: "clientJoinedLobby", client: clientToDto(client)})
}

function handleUpdate(client: Client, message: UpdateMessage) {
    const lobby = getClientLobby(client)
    if (lobby === undefined) return
    if (!isLobbyOwner(lobby, client)) return

    broadcastMessageInLobbyExcept(lobby, client, message)
    lobby.state = message.state
}

function leaveLobby(client: Client) {

    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    lobby.clients.delete(client.id)
    client.currentLobbyId = undefined
    sendMessageToClient(client, {type: "leftLobby"})

    if (deleteLobbyIfEmpty(lobby)) {
        return
    }
    let newOwnerId = undefined
    if (isLobbyOwner(lobby, client)) {
        const [newOwner] = lobby.clients.values()
        newOwnerId = newOwner.id
        lobby.ownerId = newOwnerId
    }
    broadcastMessageInLobby(lobby, {type: "clientLeftLobby", clientId: client.id, newOwnerId: newOwnerId})
}

function changeClientName(client: Client, name: string) {
    const errorReason = validateDisplayName(name)
    if (errorReason !== null) {
        sendMessageToClient(client, {type: "changedName", data: {isSuccess: false, reason: errorReason}})
        return
    }

    client.displayName = name
    sendMessageToClient(client, {type: "changedName", data: {isSuccess: true, name: name}})

    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    broadcastMessageInLobbyExcept(lobby, client,  {type: "clientChangedName", name: name, clientId: client.id})
}


function handleOffer(client: Client, clientId: number, sdp?: string) {
    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    const receiver = lobby.clients.get(clientId)
    if (receiver === undefined) return

    sendMessageToClient(receiver, {type: "receiveOffer", clientId: client.id, sdp: sdp})
}

function handleAnswer(client: Client, clientId: number, sdp?: string) {
    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    const receiver = lobby.clients.get(clientId)
    if (receiver === undefined) return

    sendMessageToClient(receiver, {type: "receiveAnswer", clientId: client.id, sdp: sdp})
}

function handleCandidate(client: Client, clientId: number, candidate: RTCIceCandidateInit) {
    const lobby = getClientLobby(client)
    if (lobby === undefined) return

    const receiver = lobby.clients.get(clientId)
    if (receiver === undefined) return

    sendMessageToClient(receiver, {type: "receiveCandidate", candidate: candidate, clientId: client.id})
}


function sendMessageToClient(client: Client, message: WatchTogetherServerMessage) {
    client.webSocket.send(JSON.stringify(message))
}

function broadcastMessageInLobbyExcept(lobby: Lobby, exceptClient: Client, message: WatchTogetherServerMessage) {
    lobby.clients.forEach(client => {
        if (Client.equals(client, exceptClient)) {
            return
        }
        sendMessageToClient(client, message)
    })
}

function broadcastMessageInLobby(lobby: Lobby, message: WatchTogetherServerMessage) {
    lobby.clients.forEach(client => {
        sendMessageToClient(client, message)
    })
}


// HELPER FUNCTIONS

function getLobbyClientCount(lobby: Lobby) {
    return lobby.clients.size
}

function getClientLobby(client: Client): Lobby | undefined {
    if (client.currentLobbyId === undefined) return undefined
    return lobbies.get(client.currentLobbyId)
}

function lobbyToDto(lobby: Lobby): LobbyDto {
    return  {
        id: lobby.id,
        ownerId: lobby.ownerId,
        clients: Array.from(lobby.clients.values()).map(clientToDto),
        state: lobby.state,
        messages: lobby.messages
    }
}

function clientHasLobby(client: Client) {
    return client.currentLobbyId !== undefined
}

function clientToDto(client: Client): ClientDto {
    return {
        id: client.id,
        displayName: client.displayName
    }
}

function isLobbyOwner(lobby: Lobby, client: Client) {
    return lobby.ownerId === client.id
}

function deleteLobbyIfEmpty(lobby: Lobby) {
    const clientCount = getLobbyClientCount(lobby)
    if (clientCount <= 0) {
        lobbies.delete(lobby.id)
        return true
    }
    return false
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
const charsLength = chars.length
const lobbyIdLength = 10
function createLobbyId(): string {
    let randomId = ""
    for (let i = 0; i < lobbyIdLength; i++) {
        randomId += chars.charAt(Math.floor(Math.random() * charsLength))
    }
    if (randomId in lobbies) {
        randomId = createLobbyId()
    }
    return randomId
}


const maxNameLength = 20
function validateDisplayName(name: string): string | null {
    if (name.length <= 0) {
        return "name cannot be empty"
    }
    if (name.length > maxNameLength) {
        return "name is too long"
    }
    return null
}

function printLobbyState() {
    console.log("current state of lobbies:")
    console.log("lobby count:", lobbies.size)
    lobbies.forEach(lobby => {
        console.log("lobby ID: ", lobby.id, "owner ID: ", lobby.ownerId)
        console.log("clients in lobby:")
        lobby.clients.forEach(client => {
            console.log("client ID", client.id)
        })
    })
}

