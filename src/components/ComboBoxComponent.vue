<template>
    <div class="comboBoxContainer">
        <label class="comboBoxLabel" for="filter">{{ label }}</label>
        <div :class="['selectArrow', optionsVisible && 'reverseSelectArrow']"></div>
        <div
            id="filter"
            :class="['comboBoxStyled', optionsVisible && 'isSelectedOption']"
            @click="toggleOptions"
            @keydown.enter="toggleOptions"
            @keydown.space="toggleOptions"
            :aria-expanded="optionsVisible"
            tabindex="0"
        >
            {{ selectedOption.name }}
        </div>
        <ul
            class="selectOptions"
            v-show="optionsVisible"
            @blur="closeOptions"
            @keydown.tab="closeOptions"
            @click="(e) => e.stopPropagation()"
        >
            <li
                v-for="option in options"
                :key="option.id"
                @click="selectOption(option)"
                @keydown.enter="selectOption(option, true)"
                @keydown.space="selectOption(option, true)"
                @keydown.up="navigateOptions('up')"
                @keydown.down="navigateOptions('down')"
                :class="{ isSelectedOption: option.id === focusedOptionIndex }"
                role="option"
                :aria-label="`${option.name}`"
                :aria-selected="option.id === selectedOption.id"
                :tabindex="option.id === selectedOption.id ? 0 : -1"
            >
                {{ option.name }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { IUser } from '@/interfaces/IUser';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
    options: Partial<IUser>[];
    selected?: Partial<IUser>;
    label: string;
}>();
const emit = defineEmits(['set-selected']);

const selectedOption = ref(props.selected || props.options[0]);
const focusedOptionIndex = ref(0);
const optionsVisible = ref<boolean>(false);

const toggleOptions = () => {
    optionsVisible.value = !optionsVisible.value;

    if (optionsVisible.value) {
        focusedOptionIndex.value = props.options.findIndex(
            (option) => option.id === selectedOption.value.id
        );
    }
};

const selectOption = (option: Partial<IUser>, keyboardClick?: boolean) => {
    if (keyboardClick) selectedOption.value = props.options[focusedOptionIndex.value];
    else selectedOption.value = option;

    emit('set-selected', selectedOption.value);
    optionsVisible.value = false;
};

const navigateOptions = (direction: string) => {
    if (optionsVisible.value) {
        if (direction === 'up' && focusedOptionIndex.value > 0) {
            focusedOptionIndex.value -= 1;
        } else if (direction === 'down' && focusedOptionIndex.value < props.options.length - 1) {
            focusedOptionIndex.value += 1;
        }
    }

    const newSelectedOption = props.options[focusedOptionIndex.value];
    if (newSelectedOption) {
        selectedOption.value = newSelectedOption;
    }
};

const closeOptions = () => {
    optionsVisible.value = false;
};

const closeOptionsOnClickAround = (e: any) => {
    if (optionsVisible.value && e.target?.className.indexOf('comboBoxStyled') === -1) {
        optionsVisible.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', closeOptionsOnClickAround);
});

onUnmounted(() => {
    document.removeEventListener('click', closeOptionsOnClickAround);
});
</script>

<style scoped>
.comboBoxContainer {
    position: relative;
    width: 100%;
    height: 100%;
}

.comboBoxLabel {
    position: absolute;
    font-size: 1.6em;
    top: -40px;
}

.selectArrow {
    position: absolute;
    top: 24px;
    right: 15px;
    pointer-events: none;
    border-style: solid;
    border-width: 12px 15px 0px 15px;
    border-color: var(--color-text) transparent transparent transparent;
    transition: 0.3s all;
}

.reverseSelectArrow {
    border-top-color: var(--color-background-container);
    transform: rotate(180deg);
}

.comboBoxStyled {
    width: 100%;
    height: 58px;
    line-height: 54px;
    display: inline-block;
    cursor: pointer;
    padding: 0 15px;
    outline: 0;
    border-radius: 0px;
    font-size: 1.6em;
    font-weight: bold;
    border: 3px solid var(--color-text);
    color: var(--color-text);
    background: var(--color-background-container);
    transition: 0.3s all;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}
.comboBoxStyled:focus-visible {
    border: 3px solid tomato;
}

.comboBoxStyled::-ms-expand {
    display: none;
}

.selectOptions {
    list-style: none;
    padding: 0;
    margin: 0;
    background: var(--color-background-container);
}

.selectOptions li {
    position: relative;
    width: 100%;
    height: 58px;
    line-height: 54px;
    display: inline-block;
    cursor: pointer;
    padding: 0 15px;
    outline: 0;
    border-radius: 0px;
    font-size: 1.6em;
    font-weight: bold;
    border: 3px solid var(--color-text);
    border-top: none;
    transition: 0.3s all;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}
.selectOptions li:first-child {
    margin-top: 20px;
    border-top: 3px solid var(--color-text);
}
.selectOptions li:focus-visible::before {
    position: absolute;
    content: '';
    width: calc(100%);
    height: calc(100%);
    display: block;
    top: 0;
    left: 0;
    border: 3px solid tomato;
}
.isSelectedOption {
    color: var(--color-background-container);
    background: var(--color-text);
}

@media (max-width: 1460px) {
    .comboBoxLabel {
        position: absolute;
        font-size: 1.4em;
        top: -30px;
    }
    .selectArrow {
        top: 18px;
        right: 18px;
        border-width: 10px 12px 0px 12px;
    }

    /* --- --- */
    .comboBoxStyled {
        height: 46px;
        line-height: 42px;
        font-size: 1.3em;
    }
    .selectOptions li {
        height: 46px;
        line-height: 42px;
        font-size: 1.4em;
    }
    .selectOptions li:first-child {
        margin-top: 15px;
    }
}

@media (max-width: 1044px) {
    .comboBoxLabel {
        position: absolute;
        font-size: 1.1em;
        top: -17px;
    }
    .selectArrow {
        top: 21px;
        right: 12px;
        border-width: 8px 10px 0px 10px;
    }

    /* --- --- */
    .comboBoxStyled {
        height: 40px;
        margin-top: 5px;
        padding: 0 10px;
        line-height: 38px;
        font-size: 1em;
    }
    .selectOptions li {
        height: 40px;
        line-height: 36px;
        font-size: 1em;
    }
    .selectOptions li:first-child {
        margin-top: 12px;
    }
}

@media (max-width: 680px) {
    .comboBoxLabel {
        display: none;
    }
    .selectArrow {
        top: 21px;
        right: 52px;
        border-width: 8px 10px 0px 10px;
    }

    /* --- --- */
    .comboBoxStyled {
        height: 36px;
        width: calc(100% - 40px);
        padding: 0 10px;
        line-height: 32px;
        font-size: 1em;
    }
    .selectOptions {
        width: calc(100% - 40px);
    }
    .selectOptions li {
        height: 36px;
        line-height: 32px;
        font-size: 1em;
    }
    .selectOptions li:first-child {
        margin-top: 12px;
    }
}

@media (max-width: 600px) {
    .selectArrow {
        top: 17px;
        right: 8px;
        border-width: 6px 8px 0px 8px;
    }

    /* --- --- */
    .comboBoxStyled {
        width: calc(100%);
        padding: 0 8px;
        font-size: 0.9em;
        height: 30px;
        line-height: 26px;
    }
    .selectOptions {
        width: calc(100%);
    }
    .selectOptions li {
        height: 30px;
        width: calc(100%);
        line-height: 28px;
        font-size: 0.9em;
        padding: 0 8px;
    }
    .selectOptions li:first-child {
        margin-top: 12px;
    }
}
</style>
