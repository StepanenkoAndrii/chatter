<template>
  <div class="home">
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
  margin: 60px;
}
.home {
  width: 100%;
}
</style>
