import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type("string")
    username : string;
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

}

export class TestRoom extends Room<State> {
    // this room supports only 5 clients connected
    maxClients = 5;

    onCreate (options) {
        console.log("ChatRoom created!", options);
        
        this.setState(new State());

        this.onMessage("message", (client, message) => {
            // client.sessionId = message;
            console.log("ChatRoom received message from", client.sessionId, ":", message);
            this.broadcast("messages", `(${this.state.players.get(client.sessionId).username}) ${message}`);
        });

        this.onMessage("set_username", (client, message) => {
            console.log(this.state.players.get(client.sessionId).username , "want to change username to:", message);
            this.state.players.get(client.sessionId).username = message;
            this.broadcast("messages", `(${client.sessionId}) changed username to ${message}`);
        });
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);
        this.state.players.get(client.sessionId).username = client.sessionId;
        this.broadcast("messages", `${ this.state.players.get(client.sessionId).username} joined.`);
    }

    onLeave (client) {
        this.broadcast("messages", `${ this.state.players.get(client.sessionId).username } left.`);
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose ChatRoom");
    }

}
