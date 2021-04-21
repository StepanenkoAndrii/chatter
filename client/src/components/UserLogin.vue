<template>
  <div class="div-main">
    <div class="div-login" v-if="regIsHidden">
      <input type="text" v-model="username" placeholder="Username" required/>
      <br/>
      <input type="password" v-model="password" placeholder="Password" required/>
      <br/>
      <button v-on:click="getLoginData">Submit</button>
      <br/>
      <a v-on:click="regIsHidden = false">Sign up</a>
      <br/>
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
      <a v-on:click="regIsHidden = true">Log in</a>
      <br/>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"
import { onLogin } from "./../vue-apollo";

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
      regIsHidden: true
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
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
