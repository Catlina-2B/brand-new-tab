import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModeStore = defineStore('mode', () => {
    // 是否启用笔记本模式
    const isNotebookMode = ref(localStorage.getItem('isNotebookMode') === 'true');

    // 切换笔记本模式
    function toggleNotebookMode() {
        isNotebookMode.value = !isNotebookMode.value;
        localStorage.setItem('isNotebookMode', isNotebookMode.value.toString());
    }

    return {
        isNotebookMode,
        toggleNotebookMode
    };
});
