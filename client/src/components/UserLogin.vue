<template>
  <div class="div-main">
    <h1>Please, sign in / sign up to enter Chatter</h1>
    <div class="div-login" v-if="regIsHidden">
      <input type="text" v-model="username" placeholder="Username" required/>
      <br/>
      <input type="password" v-model="password" placeholder="Password" required/>
      <br/>
      <button v-on:click="getLoginData">Submit</button>
      <br/>
      <p v-if="errorMes.length > 0">{{ errorMes }}</p>
    </div>
    <div class="div-a" v-if="regIsHidden">
      <p>Or<a v-on:click="regIsHidden = false; errorMes = ''; username = ''; password = ''">&nbsp;sign up&nbsp;</a>if you're new</p>
    </div>
    <div class="div-register" v-if="!regIsHidden">
      <input type="text" v-model="username" placeholder="Username" required/>
      <br/>
      <input type="password" v-model="password" placeholder="Password" required/>
      <br/>
      <input type="password" v-model="passwordConfirmed" placeholder="Confirm password" required/>
      <br/>
      <button v-on:click="getRegisterData">Submit</button>
      <br/>
      <p v-if="errorMes.length > 0">{{ errorMes }}</p>
    </div>
    <div class="div-a" v-if="!regIsHidden">
      <p>Or<a v-on:click="regIsHidden = true; errorMes = ''; username = ''; password = ''; passwordConfirmed = ''">&nbsp;sign in&nbsp;</a>if you're already registered</p>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"
import {onLogin} from "./../vue-apollo";

const userToken = gql`query login($username:String!,$password:String!) {
  token: login(username: $username, password: $password)
}`
const newUserCredentials = gql`query registration($username:String!,$password:String!) {
  register(username: $username, password: $password) {
    id
    username
    timestamp
  }
}`
const checkUserExistence = gql`query checkUsername($username:String!) {
  user: usernameExists(username: $username)
}`

export default {
  data() {
    return {
      // login: '',
      token: '',
      username: '',
      password: '',
      passwordConfirmed: '',
      regIsHidden: true,
      errorMes: ''
    }
  },
  name: "UserLogin",
  methods: {

    // check user existence
    async checkUser() {
      const userObject = await this.$apollo.query({
        query: checkUserExistence,
        variables: {
          username: this.username
        },
      })
      return userObject.data.user
    },

    //get user token
    async getToken() {
      const token = await this.$apollo.query({
        query: userToken,
        variables: {
          username: this.username,
          password: this.password
        },
      })
      return token.data.token
    },

    // signing in
    async getLoginData() {
      if (this.username.length === 0 || this.password.length === 0) {
        this.errorMes = "Incorrect data input"
        console.log("Incorrect data input.")
        return
      }
      const userExistence = await this.checkUser()
      if (!userExistence) {
        console.log("User with such username doesn't exists.")
        return
      }
      const token = await this.getToken()
      if (!token) {
        console.log("Can't get user's token.")
        return
      }
      console.log(token)
      onLogin(this.$apollo.provider.defaultClient, token);
      await this.$router.push('/')
    },

    // registration
    async getRegisterData() {
      if (this.username.length === 0 || this.password.length === 0 || this.password.length !== this.passwordConfirmed.length) {
        this.errorMes = "Incorrect data input"
        console.log("Incorrect data input.")
        return
      }
      const userExistence = await this.checkUser()
      if (userExistence) {
        console.log("User with such username already exists.")
        return
      }
      const newUser = await this.$apollo.query({
        query: newUserCredentials,
        variables: {
          username: this.username,
          password: this.password,
        },
      })
      if (!newUser) {
        console.log("Can't create new account.")
        return
      }
      console.log(newUser.data.register.username)
      const token = await this.getToken()
      if (!token) {
        console.log("Can't get user's token.")
        return
      }
      console.log(token)
      onLogin(this.$apollo.provider.defaultClient, token);
      await this.$router.push('/')
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  text-align: center;
  color: white;
  width: 40%;
  display: block;
  margin: 6vh auto;
}

.div-login, .div-register {
  text-align: center;
  width: 30%;
  height: 25vh;
  margin: 6vh auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.div-register {
  height: 33vh;
}

.div-login input, .div-register input {
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
  margin-top: 20px;
}

.div-login button, .div-register button {
  margin-top: 5%;
  width: 20%;
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

.div-login button:hover, .div-register button:hover {
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5),
  0 0 15px rgba(0, 0, 0, 0.5),
  0 0 25px rgba(0, 0, 0, 0.5),
  0 0 35px rgba(0, 0, 0, 0.5),
  0 0 45px rgba(0, 0, 0, 0.5);
}

.div-a {
  width: 30%;
  margin: 6vh auto;
  text-align: center;
}

p {
  font-size: 20px;
  color: white;
}

a {
  color: #34eb92;
}

a:hover {
  cursor: pointer;
}

.div-register p {
  margin-top: 30px;
  display: block;
  color: #ff6767;
}

</style>
