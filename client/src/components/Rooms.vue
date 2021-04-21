<template>
  <div class="div-container">
    <div class="div-main">
      <p class="p-header">Welcome to Chatter</p>
      <div class="div-button-new-container">
        <button class="button-new-chat" v-on:click="openModalWindow">Create chat</button>
      </div>
      <div class="div-main-wrapper">
        <div class="div-all-chats">
          <div v-for="room in rooms" :key="room.id">
            <span :id="room.id" v-on:click="showMessages">
              <div class="div-image">{{room.name[0]}}</div>
              <span>{{ room.name }}</span>
            </span>
          </div>
        </div>
        <div class="div-no-messages" v-if="mesIsHidden">
          <p>Select a chat to start messaging</p>
        </div>
        <div class="div-chat-info" v-if="!mesIsHidden">
          <div v-for="message in this.room.lastMessages" :key="message.id">
            {{ message.text }}
          </div>
          <div class="div-enter-message">
            <input v-model="newMessage" placeholder="Enter your message"/>
            <button v-on:click="createNewMessage">PUSH</button>
          </div>
          <div class="div-button-delete-container">
            <button class="button-delete-chat" v-on:click="deleteChat" v-if="isChatOwner">Delete chat</button>
          </div>
          <div class="div-button-update-container">
            <button class="button-update-chat" v-on:click="updateChat" v-if="isChatOwner">Update chat</button>
          </div>
          <div class="div-members-list">
            <div v-for="member in this.members" :key="member.id">
              {{ member.username }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="div-modal-new" v-if="!modalIsHidden">
      <div class="div-centered-window">
        <button class="button-cross" v-on:click="closeModal">x</button>
        <p>Enter new chat name:</p>
        <div>
          <input type="text" placeholder="New chat name:" v-model="roomName" required minlength="1"/>
          <button class="button-create-new-room" v-on:click="createNewChat">Create</button>
        </div>
      </div>
    </div>
    <div class="div-modal-new" v-if="!modalIsHidden2">
      <div class="div-centered-window">
        <button class="button-cross" v-on:click="closeModal">x</button>
        <p>Enter new chat name:</p>
        <div>
          <input type="text" placeholder="New chat name:" v-model="roomName2" required minlength="1"/>
          <button class="button-create-new-room" v-on:click="updateExistingChat">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

const allRooms = gql`query rooms {
  rooms {
    id
    name
    owner {
      username
    }
    lastMessages {
      text
    }
    members {
      id
      username
    }
  }
}`

const joinRoom = gql`mutation join($id:ID!) {
  joinRoom(roomId: $id) {
    id
    name
    lastMessages {
      text
    }
    owner {
      username
    }
    members {
      id
      username
    }
  }
}`

const leaveRoom = gql`mutation leave {
  leaveCurrentRoom {
    id
    name
  }
}`

const createdMessage = gql`mutation join($text:String!) {
  createMessage(text: $text) {
    id
    timestamp
    author {
      username
    }
    text
  }
}`

const newRoomCreation = gql`mutation createRoom($roomName:String!) {
  createRoom(name: $roomName) {
    id
    name
    timestamp
  }
}`

const roomDeletion = gql`mutation deleteRoom($id:ID!) {
  deleteRoom(id: $id) {
    id
    name
    timestamp
  }
}`

const roomChange = gql`mutation updateRoom($name:String!,$id:ID!) {
  updateRoom(id: $id, name: $name) {
    id
    name
    timestamp
  }
}`

const userInfo = gql`query me {
  me {
    id
    username
    timestamp
    currentRoom {
      id
      name
    }
  }
}`

const createdMessageSub = gql`subscription messageCreated {
  messageCreated {
    id
    timestamp
    author {
      id
      username
    }
    text
  }
}`

const createdRoomSub = gql`subscription roomCreated {
  roomCreated {
    id
    name
    owner {
      id
      username
    }
  }
}`

const updatedRoomSub = gql`subscription roomUpdated {
  roomUpdated {
    id
    name
    owner {
      username
    }
    lastMessages {
      text
    }
    members {
      id
      username
    }
  }
}`

const deletedRoomSub = gql`subscription roomDeleted {
  roomDeleted {
    id
    name
    owner {
      id
      username
    }
  }
}`

// const joinedUser = gql`subscription memberJoined {
//   memberJoined {
//     id
//     username
//   }
// }`
//
// const leftUser = gql`subscription memberLeft {
//   memberLeft {
//     id
//     username
//   }
// }`

export default {
  data() {
    return {
      rooms: [],
      messages: [],
      members: [],
      mesIsHidden: true,
      room: {},
      me: {},
      id: '',
      newMessage: '',
      modalIsHidden: true,
      modalIsHidden2: true,
      newChat: {},
      roomName: '',
      roomName2: '',
      isChatOwner: false,
    };
  },
  name: "Rooms",
  async created() {
    const rooms = await this.$apollo.query({
      query: allRooms
    })
    this.rooms = rooms.data.rooms
  },
  apollo: {
    $subscribe: {
      messageCreation: {
        query: createdMessageSub,
        result({data}) {
          console.log(data.messageCreated)
          this.messages.push(data.messageCreated);
        },
      },
      roomCreation: {
        query: createdRoomSub,
        result({data}) {
          this.rooms.push(data.roomCreated);
        },
      },
      roomChange: {
        query: updatedRoomSub,
        result({data}) {
          this.rooms = this.rooms.map(room => {
            if (room.id === data.roomUpdated.id) {
              room.name = data.roomUpdated.name
            }
            return room
          })
        },
      },
      roomDeletion: {
        query: deletedRoomSub,
        result({data}) {
          let specificIndex = -1;
          this.rooms.forEach((room, roomIndex) =>
              room.id === data.roomDeleted.id ? (specificIndex = roomIndex) : ""
          );
          this.rooms.splice(specificIndex, 1);
        },
      },
      // joinedUser: {
      //   query: joinedUser,
      //   result({data}) {
      //     console.log(data)
      //     this.members.push(data.memberJoined)
      //   },
      // },
      // leftUser: {
      //   query: leftUser,
      //   result({data}) {
      //     console.log(data)
      //     let specificIndex = -1;
      //     this.members.forEach((member, memberIndex) =>
      //         member.id === data.memberDeleted.id ? (specificIndex = memberIndex) : ""
      //     );
      //     this.members.splice(specificIndex, 1);
      //   },
      // },
    },
  },
  methods: {

    //get specific room
    async joinRoom() {
      const room = await this.$apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: joinRoom,
        variables: {
          id: this.id
        },
      })
      console.log(room.data.joinRoom)
      return room.data.joinRoom
    },

    //leave current room
    async leaveRoom() {
      return await this.$apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: leaveRoom,
      })
    },

    //create new message
    async createNewMessage() {
      const chatMessage = await this.$apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: createdMessage,
        variables: {
          text: this.newMessage,
        },
      })
      console.log(chatMessage.data)
      return chatMessage.data
    },

    //open modal window
    async openModalWindow() {
      this.modalIsHidden = false
    },

    //close modal window
    async closeModal() {
      this.modalIsHidden = true
      this.modalIsHidden2 = true
    },

    //create new chat
    async createNewChat() {
      this.modalIsHidden = true
      const newRoom = await this.$apollo.mutate({
        mutation: newRoomCreation,
        variables: {
          roomName: this.roomName,
        },
      })
      console.log(newRoom.data)
      return newRoom.data
    },

    async updateChat() {
      this.modalIsHidden2 = false
    },

    //update chat
    async updateExistingChat() {
      this.modalIsHidden2 = true
      const updatedRoom = await this.$apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: roomChange,
        variables: {
          id: this.id,
          name: this.roomName2,
        },
      })
      console.log(updatedRoom.data)
      return updatedRoom.data
    },

    //delete chat
    async deleteChat() {
      const deletedRoom = await this.$apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: roomDeletion,
        variables: {
          id: this.id,
        },
      })
      // await this.leaveRoom()
      this.mesIsHidden = true
      console.log(deletedRoom.data)
    },

    //show room's messages
    async showMessages(e) {
      const userCred = await this.$apollo.query({
        query: userInfo
      })
      this.me = userCred.data.me
      console.log(userCred.data.me.username)
      if (userCred.data.me.currentRoom) {
        await this.leaveRoom()
      }
      this.mesIsHidden = false
      console.log(e.target.id)
      this.id = e.target.id
      console.log(userCred.data.me.username)
      this.room = await this.joinRoom()
      this.members = this.room.members
      this.messages = this.room.lastMessages
      this.isChatOwner = userCred.data.me.username === this.room.owner.username
    },

    // async createdMessageSubscription() {
    //   this.$apollo.queries.tags.subscribeToMore({
    //     // GraphQL document
    //     document: createdMessageSub,
    //     // Mutate the previous result
    //     updateQuery: (previousResult, { subscriptionData }) => {
    //       // Here, return the new result from the previous with the new data
    //     },
    //   })
    // }

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.div-container {
  z-index: 1;
}

.div-main {
  /*height: 60vh;*/
  /*margin-top: 10vh;*/
  /*position: absolute;*/
  /*z-index: 1;*/
}

.div-button-new-container {
  width: 30%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-new-chat, .button-delete-chat, .button-update-chat {
  border-radius: 30px;
  background-color: rgba(33, 196, 77, 0.2);
  font-size: 24px;
  border: none;
  padding: 15px 30px;
  color: white;
  cursor: pointer;
}

.button-delete-chat {
  background-color: rgba(196, 33, 33, 0.2);
}

.button-update-chat {
  background-color: rgba(196, 115, 33, 0.2);
}

.div-main-wrapper {
  display: flex;
  height: 60vh;
  margin-top: 3vh;
  text-align: center;
}

.div-all-chats {
  /*background: rgba(255, 255, 255, 0.2);*/
  border-radius: 20px;
  color: white;
  width: 30%;
  overflow-y: auto;
}

.div-all-chats::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.div-all-chats::-webkit-scrollbar {
  width: 12px;
}

.div-all-chats::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
}

.div-chat-info, .div-no-messages {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  color: white;
  width: 69%;
}

.div-no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
}

.div-no-messages p {
  display: block;
}

.div-all-chats div span {
  width: 100%;
  height: 70px;
  text-align: center;
  line-height: 70px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.div-all-chats div span div{
  /*position: absolute;*/
  border-radius: 50%;
  background-color: #42b983;
  text-align: center;
  width: 60px;
  height: 60px;
}

.div-all-chats div span span{
  width: 70%;
}

.div-all-chats div {
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 60px;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}

.div-all-chats div:nth-child(1) {
  margin-top: 0;
}

.div-modal-new {
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
}

.div-centered-window {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  width: 50%;
  height: 30vh;
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  position: relative;
}

.div-centered-window p {
  font-size: 36px;
  color: black;
  text-align: center;
}

.button-cross {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 24px;
  background-color: transparent;
  border: none;
}

.p-header {
  font-weight: 600;
  font-size: 36px;
  color: white;
  text-align: center;
}

.div-centered-window div {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
