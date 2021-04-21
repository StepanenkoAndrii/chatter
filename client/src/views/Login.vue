<template>
  <div class="login">
    <h1>This is a login page</h1>
    <UserLogin/>
  </div>
</template>

<script>
import UserLogin from "@/components/UserLogin.vue";

export default {
  name: "Login",
  components: {
    UserLogin,
  },
};
</script>
