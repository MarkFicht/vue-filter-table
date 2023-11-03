<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { getAllUsers, getAllPosts, getPostsByAuthor } from '@/service/postsService';
import type { IUser } from '@/interfaces/IUser';
import type { IPosts } from '@/interfaces/IPosts';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const header: Ref<string> = ref('Posts');
const labelAuthors: Ref<string> = ref('Authors:');

const users = ref<IUser[]>([]);
const posts = ref<IPosts[]>([]);

const isLoading = ref<boolean>(false);

const defaultSelected = ref<string>('All');
const selected = ref<Partial<IUser>>({});
const selectOptions = ref<Partial<IUser>[]>([]);

onMounted(async () => {
    isLoading.value = true;
    await getAllUsers()
        .then((res) => (users.value = res))
        .catch((e) => new Error(e.message));
    await getAllPosts()
        .then((res) => (posts.value = res))
        .catch((e) => new Error(e.message));

    console.log('%c ttt -> ', 'background: #222; color: #bada55', await getPostsByAuthor(2));

    selectOptions.value = [
        {
            id: 0,
            name: defaultSelected.value,
            username: defaultSelected.value
        }
    ];
    users.value.forEach(({ id, name, username }) => {
        selectOptions.value.push({ id, name, username });
    });

    selected.value = selectOptions.value[0];

    isLoading.value = false;
});
</script>

<template>
    <main class="container">
        <header class="header">
            <h1>{{ header }}</h1>
        </header>

        <section class="select filter">
            <label for="filter">{{ labelAuthors }}</label>
            <select v-model="selected" id="filter">
                <option v-for="option in selectOptions" :key="option.id" :value="option">
                    {{ option.name }}
                </option>
            </select>
            <div class="select_arrow"></div>
        </section>

        <section class="posts">
            <ul v-if="posts.length > 0">
                <li v-for="post in posts" :key="post.id">
                    <h2 class="postHeader">{{ post.title }}</h2>
                    <p class="postAuthor">
                        by
                        <span>{{
                            selectOptions.find((option) => option.id === post.userId)?.name ||
                            post.id
                        }}</span>
                    </p>
                    <p class="postContent">{{ post.body }}</p>
                </li>
            </ul>
        </section>

        <LoadingSpinner class="loadingContainer" v-if="isLoading" />
    </main>
</template>

<style scoped>
.container {
    position: relative;
    height: var(--height);
    width: var(--width);
    background-color: var(--color-background-container);
    margin: 10px;
    padding: 90px;
    display: grid;
    grid-template-columns: calc(var(--width) / 2) 1fr 400px;
    grid-template-rows: 100px 1fr;
    grid-template-areas:
        'head gap aut '
        'post gap aut ';
}
.loadingContainer {
    position: absolute;
}
.header {
    grid-area: head;
    height: 50px;
    line-height: 50px;
    margin: 0;
    padding: 0;
}
h1 {
    font-size: 3em;
    font-weight: bold;
}

.posts {
    grid-area: post;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}
li {
    margin-top: 70px;
    margin-bottom: 30px;
}

li > h2 {
    font-size: 2.1em;
    font-weight: bold;
    padding-right: 20px;
}
li > h2::first-letter {
    text-transform: uppercase;
}
.postAuthor,
.postContent {
    margin-top: 20px;
    padding-right: 40px;
    font-size: 1.1em;
}

.filter {
    position: relative;
    grid-area: aut;
    width: 100%;
    height: 58px;
    line-height: 58px;
    margin: 0;
    padding: 0;
    font-size: 1em;
    font-weight: bold;
}
.filter > label {
    position: absolute;
    font-size: 1.6em;
    top: -50px;
}
.filter select {
    width: 100%;
    height: 58px;
    display: inline-block;
    cursor: pointer;
    padding: 10px 15px;
    outline: 0;
    border-radius: 0px;
    font-size: 1.6em;
    border: 3px solid var(--color-text);
    color: var(--color-background-container);
    background: var(--color-text);
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}
.filter select::-ms-expand {
    display: none;
}
.filter select:hover,
.filter select:focus {
    transition: 0.3s all;
    background: #666;
}
.filter select:disabled {
    opacity: 0.5;
    pointer-events: none;
}
.select_arrow {
    position: absolute;
    top: 24px;
    right: 15px;
    pointer-events: none;
    border-style: solid;
    border-width: 12px 15px 0px 15px;
    border-color: var(--color-background-container) transparent transparent transparent;
}
.filter select:hover ~ .select_arrow,
.filter select:focus ~ .select_arrow {
    border-top-color: #000000;
}
.filter select:disabled ~ .select_arrow {
    border-top-color: #cccccc;
}
</style>
