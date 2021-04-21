<template>
  <div class="home">
<!--    <img alt="Vue logo" src="../assets/logo.png">-->
    <Rooms />
  </div>
</template>

<script>
// @ is an alias to /src
import Rooms from '@/components/Rooms.vue'

export default {
  name: 'Home',
  components: {
    Rooms
  }
}
</script>

<style scoped>
p {
  font-weight: 600;
  font-size: 36px;
  color: white;
  text-align: center;
}
.home {
  width: 100%;
  /*height: 100vh;*/
}
</style>
