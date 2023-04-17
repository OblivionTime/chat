<template>
    <div class="menu-container">
        <div class="menu-item operation-text" v-for="item in menus" :key="item.name" @click="item.RowClick">
            {{ item.name }}
        </div>
    </div>
</template>

<script>
export default {
    name: "homeMenu",
    props: {
        menus: {
            default: []
        }
    },
    methods: {
        hiddenMenu() {

        }
    },
}
</script>

<style lang="scss" scoped>
.menu-container {
    padding: 5px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.menu-item {
    display: block;
    margin-top: 5px;
}

.operation-text {
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    color: #7e7e7e;
    transition: all .5s ease-in;
}

.operation-text:hover {
    background-color: #E9EAEC;
}
</style>