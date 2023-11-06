<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue';
import { getAllUsers, getAllPosts, getPostsByAuthor } from '@/service/postsService';
import type { IUser } from '@/interfaces/IUser';
import type { IPosts } from '@/interfaces/IPosts';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ComboBoxComponent from '@/components/ComboBoxComponent.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const header: Ref<string> = ref('Posts');
const labelAuthors: Ref<string> = ref('Authors:');
const labelButtonClose: Ref<string> = ref('Close');
const infoPopup: Ref<string> = ref('Info popup');

const users = ref<IUser[]>([]);
const posts = ref<IPosts[]>([]);

const isLoading = ref<boolean>(false);
const showPopup = ref<boolean>(false);

const labelSelectAll = ref<string>('All');
const selected = ref<Partial<IUser>>({});
const selectOptions = ref<Partial<IUser>[]>([]);

const firstLoad = ref<boolean>(true);

onMounted(async () => {
    isLoading.value = true;
    await getAllUsers()
        .then((res) => (users.value = res))
        .catch((e) => new Error(e.message));

    const id = Number(route.params.id);
    if (!isNaN(id) && id > 0) {
        await getPostsByAuthor(id)
            .then(async (res) => {
                if (res?.length === 0) {
                    await getAllPosts()
                        .then((res) => (posts.value = res))
                        .catch((e) => new Error(e.message));
                } else posts.value = res;
            })
            .catch(async (e) => {
                await getAllPosts()
                    .then((res) => (posts.value = res))
                    .catch((e) => new Error(e.message));
            });
    } else {
        await getAllPosts()
            .then((res) => (posts.value = res))
            .catch((e) => new Error(e.message));
    }

    selectOptions.value = [
        {
            id: 0,
            name: labelSelectAll.value,
            username: labelSelectAll.value
        }
    ];
    users.value.forEach(({ id, name, username }) => {
        selectOptions.value.push({ id, name, username });
    });

    selected.value = selectOptions.value[0];

    isLoading.value = false;
});

watch(
    () => selected.value,
    async (newVal: Partial<IUser>) => {
        if (firstLoad.value) {
            firstLoad.value = false;
            return;
        }

        isLoading.value = true;

        if (newVal.id === 0)
            await getAllPosts()
                .then((res) => (posts.value = res))
                .catch((e) => new Error(e.message));
        else if (newVal.id)
            await getPostsByAuthor(newVal.id)
                .then((res) => (posts.value = res))
                .catch((e) => new Error(e.message));

        isLoading.value = false;
    }
);

function setSelected(option: Partial<IUser>): void {
    (option.id || option.id === 0) && (selected.value = option);
}
</script>

<template>
    <main class="container">
        <header class="header">
            <h1>{{ header }}</h1>
        </header>

        <section class="filter">
            <ComboBoxComponent
                v-if="selectOptions.length > 0"
                :options="selectOptions"
                :selected="selected"
                :label="labelAuthors"
                @set-selected="setSelected"
            />
        </section>

        <section class="posts">
            <ul v-if="posts.length > 0">
                <li v-for="post in posts" :key="post.id">
                    <h2 class="postHeader">{{ post.title }}</h2>
                    <p class="postAuthor">
                        {{ 'by' }}
                        <span>{{
                            selectOptions.find((option) => option.id === post.userId)?.name ||
                            post.id
                        }}</span>
                    </p>
                    <p class="postContent">{{ post.body }}</p>
                </li>
            </ul>
        </section>

        <section class="infoButton">
            <button @click="() => (showPopup = true)">
                <ion-icon name="information-outline"></ion-icon>
            </button>
        </section>

        <section v-if="showPopup" class="infoPopupContainer">
            <section class="popupContent">
                <img class="popupImg" src="../assets/bg-min.jpg" alt="Mountain background" />
                <p class="popupDesc">{{ infoPopup }}</p>
                <button class="popupButton" @click="() => (showPopup = false)">
                    {{ labelButtonClose }}
                </button>
            </section>
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
/* --- Loading --- */
.loadingContainer {
    position: absolute;
}

/* --- Header of view --- */
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

/* --- Posts --- */
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
    font-size: 1.2em;
}
.postAuthor > span {
    font-weight: 700;
}
.postContent {
    margin-top: 30px;
}

/* --- Select-box --- */
.filter {
    grid-area: aut;
}

/* --- Info button --- */
.infoButton {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    bottom: 30px;
    right: 30px;
}
.infoButton > button {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 30px;
    border: 3px solid var(--color-text);
    outline: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.3s all;
}
.infoButton > button:focus-visible {
    border: 3px solid tomato;
}

/* --- Popup --- */
.infoPopupContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
}
.popupContent {
    width: 60%;
    height: 60%;
    border: 3px solid var(--color-text);
    background-color: var(--color-background-container);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.popupImg {
    width: 65%;
    height: 50%;
    background-repeat: no-repeat;
    background-size: cover;
}
.popupDesc {
    height: 100px;
    line-height: 100px;
    font-size: 1.5em;
    font-weight: bold;
    width: 100%;
    text-align: center;
    color: var(--color-text);
}
.popupButton {
    outline: none;
    border: 3px solid var(--color-text);
    background-color: var(--color-background-container);
    color: var(--color-text);
    height: 60px;
    line-height: 55px;
    width: 50%;
    font-size: 1.5em;
    font-weight: bold;
    color: var(--color-text);
    cursor: pointer;
    margin-bottom: 20px;
    transition: 0.3s all;
}
.popupButton:focus-visible {
    border: 3px solid tomato;
}

@media (max-width: 1460px) {
    .container {
        --width: 1024px;
        --height: 720px;
        padding: 60px;
        grid-template-columns: calc(var(--width) / 2) 1fr 300px;
        grid-template-rows: 100px 1fr;
    }

    /* --- --- */
    .header {
        height: 40px;
        line-height: 40px;
    }
    h1 {
        font-size: 2.6em;
    }

    /* --- --- */
    li {
        margin-top: 50px;
        margin-bottom: 20px;
    }
    li > h2 {
        font-size: 1.9em;
        padding-right: 20px;
    }
    .postAuthor,
    .postContent {
        margin-top: 20px;
        font-size: 1.1em;
    }
    .postContent {
        margin-top: 30px;
    }
    /* --- --- */
    .infoButton {
        width: 40px;
        height: 40px;
    }
    .infoButton > button {
        width: 40px;
        height: 40px;
        font-size: 24px;
    }
    /* --- --- */
    .popupDesc {
        height: 60px;
        line-height: 60px;
        font-size: 1.3em;
    }
    .popupButton {
        height: 50px;
        line-height: 45px;
        font-size: 1.4em;
        margin-bottom: 15px;
    }
}
@media (max-width: 1044px) {
    .container {
        --width: 720px;
        --height: 600px;
        padding: 30px;
        margin: 10px;
        grid-template-columns: calc(var(--width) / 2) 1fr 240px;
        grid-template-rows: 70px 1fr;
    }

    /* --- --- */
    .header {
        height: 30px;
        line-height: 30px;
    }
    h1 {
        padding-top: 10px;
        font-size: 2.2em;
    }

    /* --- --- */
    li {
        margin-top: 35px;
        margin-bottom: 20px;
    }
    li > h2 {
        font-size: 1.8em;
    }
    .postAuthor,
    .postContent {
        margin-top: 15px;
        font-size: 1.1em;
    }
    .postContent {
        margin-top: 20px;
    }
    /* --- --- */
    .infoButton {
        width: 36px;
        height: 36px;
    }
    .infoButton > button {
        width: 36px;
        height: 36px;
        font-size: 24px;
    }
    /* --- --- */
    .popupDesc {
        height: 50px;
        line-height: 50px;
        font-size: 1.1em;
    }
    .popupButton {
        height: 40px;
        line-height: 35px;
        font-size: 1.3em;
        margin-bottom: 5px;
    }
}

@media (max-width: 680px) {
    .container {
        --width: 560px;
        --height: 600px;
        padding: 20px;
        margin: 10px;
        grid-template-columns: var(--width);
        grid-template-rows: 40px 40px 1fr;
        grid-template-areas:
            'head'
            'aut '
            'post';
    }

    /* --- --- */
    .header {
        height: 30px;
        line-height: 30px;
        width: calc(100% - 40px);
    }
    h1 {
        padding-top: 0;
        font-size: 1.9em;
        width: calc(100% - 40px);
    }

    /* --- --- */
    .posts {
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        margin-top: 20px;
        margin-bottom: 20px;
    }
    li {
        margin-top: 30px;
        margin-bottom: 20px;
    }
    li > h2 {
        font-size: 1.5em;
    }
    .postAuthor,
    .postContent {
        margin-top: 10px;
        font-size: 1em;
    }
    .postContent {
        margin-top: 15px;
    }
    /* --- --- */
    .infoButton {
        width: 30px;
        height: 30px;
        bottom: 20px;
        right: 20px;
    }
    .infoButton > button {
        width: 30px;
        height: 30px;
        font-size: 20px;
    }
    /* --- --- */
    .popupContent {
        width: 80%;
        height: 65%;
    }
    .popupImg {
        width: 70%;
        height: 55%;
    }
    .popupDesc {
        height: 40px;
        line-height: 40px;
        font-size: 1.1em;
    }
}

@media (max-width: 600px) {
    .container {
        padding: 20px;
        margin: 10px;
        grid-template-columns: 1fr;
        grid-template-rows: 40px 40px 1fr;
        max-width: calc(100% - 40px);
        max-height: calc(100vh - 20px);
    }

    /* --- --- */
    .header {
        width: 100%;
    }
    h1 {
        font-size: 1.8em;
        width: 100%;
    }

    /* --- --- */
    .posts {
        width: calc(100%);
    }
    li {
        width: calc(100%);
    }
    li > h2 {
        width: calc(100%);
        font-size: 1.4em;
    }
    .postAuthor,
    .postContent {
        width: calc(100%);
        font-size: 0.9em;
    }
    /* --- --- */
    .infoButton {
        width: 24px;
        height: 24px;
        bottom: 10px;
        right: 10px;
    }
    .infoButton > button {
        width: 24px;
        height: 24px;
        font-size: 16px;
    }
    /* --- --- */
    .popupContent {
        width: 80%;
        height: 65%;
    }
    .popupImg {
        width: 70%;
        height: 55%;
    }
    .popupDesc {
        height: 40px;
        line-height: 40px;
        font-size: 1em;
    }
}
</style>
