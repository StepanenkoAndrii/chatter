<template>
  <div class="div-container">
    <div class="div-main">
      <button class="button-logout" v-on:click="logout">Logout</button>
      <p class="p-header">Welcome to Chatter</p>
      <div class="div-button-new-container">
        <button class="button-new-chat" v-on:click="openModalWindow">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Create chat
        </button>
      </div>
      <div class="div-main-wrapper">
        <div class="div-all-chats">
          <div class="div-chat" v-for="room in rooms" :key="room.id" v-tilt="{speed: 200, max: 25}">
            <!--            <button :id="room.id" v-on:click="showMessages" :data-text="room.name" :class="{active: room.active}">-->
            <button :id="room.id" v-on:click="showMessages" :data-text="room.name"
                    :class="{ 'button-owner-chat' : room.owner.id === me.id }">
              {{ room.name }}
            </button>
          </div>
        </div>
        <div class="div-no-messages" v-if="mesIsHidden">
          <p>Select a chat to start messaging</p>
        </div>
        <div class="div-chat-info" v-if="!mesIsHidden">
          <div class="div-messages-header">
            <div class="div-button-delete-container">
              <button class="button-delete-chat" v-on:click="deleteChat" v-if="isChatOwner">Delete chat</button>
            </div>
            <div class="div-members-list">
              <div class="div-hover" @mouseover="showMembersList" @mouseleave="hideMembersList">
                Chat members
              </div>
              <div class="div-list" v-if="hovered">
                <div v-for="member in this.members" :key="member.id">
                  {{ member.username }}
                  <span class="span-me" v-if="member.id === me.id">(me)</span>
                </div>
              </div>
            </div>
            <div class="div-button-update-container">
              <button class="button-update-chat" v-on:click="updateChat" v-if="isChatOwner">Update chat</button>
            </div>
          </div>
          <div class="div-messages-container">
            <div v-for="message in this.room.lastMessages" :key="message.id" class="div-line-message">
              <div class="div-message" :class="{ 'div-owner-message' : message.author.id === me.id }">
                <div class="div-message-author">
                  {{ message.author.username }}
                </div>
                <div class="div-message-text">
                  {{ message.text }}
                </div>
                <div class="div-time">
                  {{ message.timestamp.slice(11).split("").reverse().join("").slice(5).split("").reverse().join("") }}
                </div>
              </div>
            </div>
          </div>
          <div class="div-enter-message">
            <input v-model="newMessage" placeholder="Enter your message"/>
            <button v-on:click="createNewMessage">Send</button>
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
import {onLogout} from "./../vue-apollo";

const allRooms = gql`query rooms {
  rooms {
    id
    name
    timestamp
    owner {
      id
      username
    }
    lastMessages {
      text
      timestamp
      author {
        id
        username
      }
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
    timestamp
    lastMessages {
      text
      timestamp
      author {
        id
        username
      }
    }
    owner {
      id
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
      id
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
    owner {
      id
      username
    }
  }
}`

const roomDeletion = gql`mutation deleteRoom($id:ID!) {
  deleteRoom(id: $id) {
    id
    name
    timestamp
    owner {
      id
      username
    }
  }
}`

const roomChange = gql`mutation updateRoom($name:String!,$id:ID!) {
  updateRoom(id: $id, name: $name) {
    id
    name
    timestamp
    owner {
      id
      username
    }
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
    timestamp
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
    timestamp
    owner {
      id
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
    timestamp
    owner {
      id
      username
    }
  }
}`

const joinedUser = gql`subscription memberJoined {
  memberJoined {
    id
    username
  }
}`

const leftUser = gql`subscription memberLeft {
  memberLeft {
    id
    username
  }
}`

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
      hovered: false,
      // active: false
    };
  },
  name: "Rooms",
  async created() {
    const rooms = await this.$apollo.query({
      query: allRooms
    })
    const userCred = await this.$apollo.query({
      query: userInfo
    })
    // await this.$apollo.mutate({
    //   fetchPolicy: "no-cache",
    //   mutation: leaveRoom,
    // })
    this.me = userCred.data.me
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
      joinedUser: {
        query: joinedUser,
        result({data}) {
          console.log(data)
          this.members.push(data.memberJoined)
        },
      },
      leftUser: {
        query: leftUser,
        result({data}) {
          console.log(data)
          let specificIndex = -1;
          this.members.forEach((member, memberIndex) =>
              member.id === data.memberLeft.id ? (specificIndex = memberIndex) : ""
          );
          this.members.splice(specificIndex, 1);
        },
      },
    },
  },
  methods: {

    // //choose room
    // async chooseRoom() {
    //   let specificIndex = -1;
    //   console.log(this.id)
    //   this.rooms.forEach((room, roomIndex) =>
    //       room.id === this.id ? (specificIndex = roomIndex) : ""
    //   );
    //   let chosenRoom = this.rooms[specificIndex]
    //   console.log(chosenRoom)
    //   chosenRoom.active = !chosenRoom.active
    //   this.$set(this.rooms, specificIndex, chosenRoom)
    // },

    //logout
    async logout() {
      await onLogout(this.$apollo.provider.defaultClient);
      await this.$apollo.provider.defaultClient.resetStore();
      await this.$router.push('/login')
    },

    //show users
    async showMembersList() {
      this.hovered = true
    },

    //show users
    async hideMembersList() {
      this.hovered = false
    },

    //get specific room
    async joinRoom() {
      const room = await this.$apollo.mutate({
        fetchPolicy: "no-cache",
        mutation: joinRoom,
        variables: {
          id: this.id
        },
      })
      console.log("here_in")
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
      this.newMessage = ""
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
        fetchPolicy: "no-cache",
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
      this.me.currentRoom = null
      this.room = null
      console.log(deletedRoom.data)
    },

    //show room's messages
    async showMessages(e) {
      this.me.currentRoom = this.room
      console.log(this.me.currentRoom)
      if (this.me.currentRoom) {
        console.log("here")
        await this.leaveRoom()
      }
      this.mesIsHidden = false
      console.log(e.target.id)
      this.id = e.target.id
      this.room = await this.joinRoom()
      console.log("here 2")
      this.members = this.room.members
      this.messages = this.room.lastMessages
      this.isChatOwner = this.me.username === this.room.owner.username
      // let specificIndex = -1;
      // console.log(this.id)
      // this.rooms.forEach((room, roomIndex) =>
      //     room.id === this.id ? (specificIndex = roomIndex) : ""
      // );
      // let chosenRoom = this.rooms[specificIndex]
      // console.log(chosenRoom)
      // chosenRoom.active = !chosenRoom.active
      // this.$set(this.rooms, specificIndex, chosenRoom)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.div-container {
  z-index: 1;
}

.div-button-new-container {
  width: 25%;
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
  display: inline-block;
  position: relative;
  overflow: hidden;
  transition: .2s;
  font-family: 'Prompt', sans-serif;
}

.button-delete-chat {
  background-color: rgba(196, 33, 33, 0.2);
  margin-left: 15px;
  z-index: 100;
}

.button-update-chat {
  background-color: rgba(196, 115, 33, 0.2);
  margin-right: 15px;
}

.button-delete-chat, .button-update-chat {
  width: 160px;
  height: 50px;
  padding: 5px 10px;
  font-size: 16px;
  margin-top: 7px;
}

.button-new-chat:hover {
  background: #34eb92;
  color: black;
  transition-duration: 1s;
  box-shadow: 0 0 10px #34eb92,
  0 0 40px #34eb92,
  0 0 80px #34eb92;
}

.button-update-chat:hover {
  background: rgb(204, 136, 61);
  color: black;
  transition-duration: 1s;
  box-shadow: 0 0 5px rgb(204, 136, 61),
  0 0 15px rgb(204, 136, 61),
  0 0 30px rgb(204, 136, 61);
}

.button-delete-chat:hover {
  background: rgb(222, 67, 67);
  color: black;
  transition-duration: 1s;
  box-shadow: 0 0 5px rgb(222, 67, 67),
  0 0 15px rgb(222, 67, 67),
  0 0 30px rgb(222, 67, 67);
}

.button-new-chat span {
  position: absolute;
  display: block;
}

.div-main-wrapper {
  display: flex;
  height: 60vh;
  margin-top: 3vh;
  text-align: center;
}

.div-all-chats {
  border-radius: 20px;
  color: white;
  width: 25%;
  overflow-y: auto;
  position: relative;
}

/*.div-plug {*/
/*  width: 100%;*/
/*  height: 100%;*/
/*  position: absolute;*/
/*  top: 0;*/
/*  left: 0;*/
/*  z-index: 20;*/
/*  margin: auto;*/
/*  background: transparent;*/
/*  border: 1px solid white;*/
/*  cursor: initial;*/
/*}*/

.div-all-chats::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.div-all-chats::-webkit-scrollbar {
  width: 12px;
}

.div-all-chats::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
}

.div-messages-container::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.div-messages-container::-webkit-scrollbar {
  width: 12px;
}

.div-messages-container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
}

.div-message-text::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.div-message-text::-webkit-scrollbar {
  width: 6px;
}

.div-message-text::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
}

/*.div-message-author::-webkit-scrollbar-track {*/
/*  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);*/
/*  border-radius: 2px;*/
/*}*/

/*.div-message-author::-webkit-scrollbar {*/
/*  width: 3px;*/
/*}*/

/*.div-message-author::-webkit-scrollbar-thumb {*/
/*  border-radius: 2px;*/
/*  background-color: rgba(255, 255, 255, 0.1);*/
/*}*/

.div-chat-info, .div-no-messages {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  width: 64%;
  margin-left: 3vw;
  position: relative;
}

.div-no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
}

.div-no-messages p {
  display: block;
}

.div-all-chats div button {
  width: 100%;
  height: 70px;
  text-align: center;
  line-height: 70px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 2px;
  font-size: 24px;
  text-shadow: 0 0 20px #34eb92;
  outline: none;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-family: "Prompt", sans-serif;
}

.div-all-chats div button:after {
  content: attr(data-text);
  position: absolute;
  z-index: -1;
  color: #34eb92;
  filter: blur(15px);
}

.div-all-chats div button:before {
  content: '';
  position: absolute;
  z-index: -2;
  background: #097841;
  opacity: 0.5;
  filter: blur(100px);
}

.div-chat {
  height: 70px;
  border-radius: 40px;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.1);
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.div-chat:nth-child(1) {
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
  border-radius: 25px;
  width: 40%;
  height: 22vh;
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  position: relative;
}

.div-centered-window p {
  font-size: 36px;
  font-weight: 900;
  color: black;
  text-align: center;
}

.button-cross {
  position: absolute;
  top: 7px;
  right: 16px;
  font-size: 28px;
  font-weight: 900;
  background-color: transparent;
  border: none;
}

.button-cross:hover {
  cursor: pointer;
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

.div-enter-message {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
}

.div-enter-message input, .div-centered-window div input {
  width: 50%;
  height: 40px;
  border-radius: 25px;
  box-shadow: 0 0 5px #34eb92,
  0 0 10px #34eb92,
  0 0 15px #34eb92;
  background: rgba(0, 0, 0, 0.5);
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  border-bottom: 0;
  border-right: 0;
  margin-bottom: 10px;
  outline: none;
  font-family: 'Prompt', sans-serif;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 20px;
}

.div-enter-message button, .div-centered-window div button {
  margin-left: 3%;
  width: 8%;
  height: 40px;
  background: #34eb92;
  color: black;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Prompt', sans-serif;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5),
  0 0 10px rgba(0, 0, 0, 0.5),
  0 0 15px rgba(0, 0, 0, 0.5);
  border: none;
}

.div-centered-window div button {
  width: 15%;
}

.div-enter-message button:hover {
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5),
  0 0 15px rgba(0, 0, 0, 0.5),
  0 0 25px rgba(0, 0, 0, 0.5),
  0 0 35px rgba(0, 0, 0, 0.5),
  0 0 45px rgba(0, 0, 0, 0.5);
  /*text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);*/
}

.div-enter-message input::placeholder {
  /*padding-left: 10px;*/
  color: rgba(255, 255, 255, 0.47);
  font-family: 'Prompt', sans-serif;
}

.div-message {
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  width: 42%;
  border-radius: 20px;
  height: 60px;
  background: rgba(44, 62, 80, 0.5);
  background: linear-gradient(0.25turn, rgba(99, 167, 237, 0.3), rgba(44, 62, 80, 0.3), rgba(44, 62, 80, 0.8));
  /*margin-top: 15px;*/
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  margin-left: 2%;
  line-height: 60px;
}

.div-owner-message {
  background: linear-gradient(0.25turn, rgba(34, 230, 135, 0.35), rgba(35, 163, 96, 0.5), rgba(35, 163, 96, 0.8));
  float: right;
  margin-right: 2%;
  margin-left: 0;
}

.div-messages-container {
  width: 100%;
  height: 70%;
  overflow-y: auto;
}

.div-line-message {
  width: 100%;
  height: 80px;
}

.div-message-author {
  margin-left: 3%;
  font-size: 24px;
  font-family: 'Lobster', sans-serif;
  width: 15%;
  float: left;
  overflow: hidden;
}

.div-message-text {
  margin-left: 7%;
  width: 50%;
  text-align: left;
  /*overflow: hidden;*/
  float: left;
  overflow-y: auto;
  overflow-x: hidden;
  height: 60px;
  word-wrap: break-word;
}

.div-time {
  font-size: 24px;
  font-family: 'Lobster', sans-serif;
  float: right;
  margin-right: 3%;
}

.div-messages-header {
  width: 100%;
  height: 12%;
  position: relative;
}

.div-button-delete-container {
  float: left;
  display: flex;
  justify-content: center;
  align-items: center;
}

.div-button-update-container {
  float: right;
  display: flex;
  justify-content: center;
  align-items: center;
}

.div-members-list {
  position: absolute;
  text-align: center;
  width: 100%;
  height: 100%;
  margin: auto;
}

.div-members-list:hover {
  cursor: pointer;
}

.div-hover {
  /*border: 1px solid white;*/
  width: 20%;
  margin: 1.5% auto;
  font-size: 24px;
}

.div-list {
  background: rgba(0, 0, 0, 0.2);
  margin: auto;
  width: 25%;
  border-radius: 25px;
  font-size: 20px;
  font-family: 'Lobster', sans-serif;
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
}

.div-list div {
  margin-top: 10px;
}

.div-list div:first-of-type {
  padding-top: 8px;
}

.div-list div:last-of-type {
  padding-bottom: 8px;
}

.active {
  background-color: red;
}

.button-owner-chat {
  border-radius: 40px;
  box-shadow: 0 0 1px #009a08,
  0 0 3px #009a08,
  0 0 10px #009a08;
}

.div-chat:first-of-type {
  margin-top: 10px;
}

.div-chat:last-of-type {
  margin-bottom: 10px;
}

.button-logout {
  position: fixed;
  top: 16vh;
  right: 9vw;
  color: #34eb92;
  font-size: 20px;
  outline: none;
  border: none;
  background: transparent;
  width: 80px;
  height: 40px;
}

.button-logout:hover {
  cursor: pointer;
}

</style>