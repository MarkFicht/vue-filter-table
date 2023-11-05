<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue';
import { getAllUsers, getAllPosts, getPostsByAuthor } from '@/service/postsService';
import type { IUser } from '@/interfaces/IUser';
import type { IPosts } from '@/interfaces/IPosts';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ComboBoxComponent from '@/components/ComboBoxComponent.vue';

const header: Ref<string> = ref('Posts');
const labelAuthors: Ref<string> = ref('Authors:');
const labelButtonClose: Ref<string> = ref('Close');
const infoPopup: Ref<string> = ref('Info popup');

const select = ref(null);

const users = ref<IUser[]>([]);
const posts = ref<IPosts[]>([]);

const isLoading = ref<boolean>(false);
const showPopup = ref<boolean>(false);

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

    // ---
    const selectTag = document.getElementById('filter');
    console.log('%c selectTag -> ', 'background: #222; color: #bada55', selectTag?.children);
    // $('select').each(function(){
    //     var $this = $(this), numberOfOptions = $(this).children('option').length;

    //     $this.addClass('select-hidden');
    //     $this.wrap('<div class="select"></div>');
    //     $this.after('<div class="select-styled"></div>');

    //     var $styledSelect = $this.next('div.select-styled');
    //     $styledSelect.text($this.children('option').eq(0).text());

    //     var $list = $('<ul />', {
    //         'class': 'select-options'
    //     }).insertAfter($styledSelect);

    //     for (var i = 0; i < numberOfOptions; i++) {
    //         $('<li />', {
    //             text: $this.children('option').eq(i).text(),
    //             rel: $this.children('option').eq(i).val()
    //         }).appendTo($list);
    //         if ($this.children('option').eq(i).is(':selected')){
    //           $('li[rel="' + $this.children('option').eq(i).val() + '"]').addClass('is-selected')
    //         }
    //     }

    //     var $listItems = $list.children('li');

    //     $styledSelect.click(function(e) {
    //         e.stopPropagation();
    //         $('div.select-styled.active').not(this).each(function(){
    //             $(this).removeClass('active').next('ul.select-options').hide();
    //         });
    //         $(this).toggleClass('active').next('ul.select-options').toggle();
    //     });

    //     $listItems.click(function(e) {
    //         e.stopPropagation();
    //         $styledSelect.text($(this).text()).removeClass('active');
    //         $this.val($(this).attr('rel'));
    //       $list.find('li.is-selected').removeClass('is-selected');
    //       $list.find('li[rel="' + $(this).attr('rel') + '"]').addClass('is-selected');
    //         $list.hide();
    //         //console.log($this.val());
    //     });

    //     $(document).click(function() {
    //         $styledSelect.removeClass('active');
    //         $list.hide();
    //     });

    // });
    // ---

    isLoading.value = false;
});

watch(
    () => selected.value,
    async (newVal: Partial<IUser>) => {
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
</script>

<template>
    <main class="container">
        <header class="header">
            <h1>{{ header }}</h1>
        </header>

        <section class="select filter">
            <ComboBoxComponent
                v-if="selectOptions.length > 0"
                :options="selectOptions"
                :selected="selectOptions[0]"
                :label="labelAuthors"
            />

            <!-- <label for="filter">{{ labelAuthors }}</label>
            <select v-model="selected" ref="select" id="filter">
                <option
                    v-for="option in selectOptions"
                    :key="option.id"
                    :value="option"
                    :class="[option.id === selected.id && 'selectedOption']"
                >
                    {{ option.name }}
                </option>
            </select>
            <div class="selectArrow"></div> -->
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

        <section class="infoButton">
            <button @click="() => (showPopup = true)">I</button>
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
    font-size: 1.1em;
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
    border: 3px solid var(--color-text);
    outline: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
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
}
</style>
