<template>
    <div id="app">
      <particles-bg type="cobweb" color="404040" :bg="true" />
<!--        <div id="nav">-->

<!--            <router-link to="/">Home</router-link> |-->
<!--            <router-link to="/login">Login</router-link> |-->
<!--            <router-link to="/about">About</router-link>-->
<!--        </div>-->
        <router-view/>
    </div>
</template>

<style>

@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Prompt:wght@300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

body {
    background-color: black;
}

#app {
  /*font-family: Avenir, Helvetica, Arial, sans-serif;*/
  font-family: 'Prompt', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
