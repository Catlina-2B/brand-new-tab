<template>
  <q-page class="papper-page">
    <div class="row no-wrap full-height">
      <!-- 笔记列表侧边栏 -->
      <div class="col-auto sidebar-container">
        <q-card flat class="notes-sidebar">
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6">Note</div>
              <div>
                <q-btn flat round color="primary" icon="add" @click="createNewNote" :disable="isCreating" />
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]">
                  <div class="text-body2">添加新笔记</div>
                </q-tooltip>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none notes-list">
            <q-list separator>
              <q-item v-for="note in filteredNotes" :key="note.id" clickable
                :active="currentNote && currentNote.id === note.id" active-class="bg-primary text-white"
                @click="selectNote(note)">
                <q-item-section>
                  <q-item-label lines="1">
                    {{ getNoteTitle(note) }}
                  </q-item-label>
                  <q-item-label caption lines="1">
                    {{ formatDate(note.updatedAt) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense color="negative" icon="delete" @click.stop="confirmDelete(note)" />
                </q-item-section>
              </q-item>
              <q-item v-if="papperStore.notes.length === 0">
                <q-item-section class="text-center text-grey">
                  没有笔记，点击上方"+"按钮创建
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 笔记编辑区 -->
      <div class="col editor-container">
        <q-card flat class="editor-card">
          <!-- 固定在顶部的更新信息 -->
          <q-card-section class="q-pa-sm q-px-md update-info">
            <div class="row items-center justify-between">
              <div class="text-subtitle2 text-grey">
                {{ currentNote ? `最后更新: ${formatDate(currentNote.updatedAt)}` : '未选择笔记' }}
              </div>
              <q-input v-model="searchText" dense outlined placeholder="搜索笔记..." class="search-input"
                @keyup.enter="searchInCurrentNote">
                <template v-slot:append>
                  <q-icon name="search" class="cursor-pointer" @click="searchInCurrentNote" />
                </template>
              </q-input>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="currentNote" class="q-pa-md editor-section">
            <!-- 使用textarea替代contenteditable div -->
            <q-input ref="editorRef" v-model="editorContent" type="textarea" class="editor" autogrow borderless
              hide-bottom-space @update:model-value="onEditorChange" />
          </q-card-section>

          <q-card-section v-else class="q-pa-md editor-section flex flex-center">
            <div class="text-center">
              <q-icon name="description" size="4rem" />
              <div class="text-h6 q-mt-md">选择或创建一个笔记开始编辑</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除这个笔记吗？此操作不可撤销。</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="删除" color="negative" v-close-popup @click="deleteNote" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { usePapperStore, type Note } from 'src/stores/papper-store';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'papper-component',
});

const $q = useQuasar();
const papperStore = usePapperStore();
const editorRef = ref<any>(null);
const searchText = ref('');
const deleteDialog = ref(false);
const noteToDelete = ref<Note | null>(null);
const isCreating = ref(false);
const debounceTimer = ref<number | null>(null);
const editorContent = ref('');

// 计算属性
const currentNote = computed(() => papperStore.currentNote);

// 监听currentNote变化，更新编辑器内容
watch(currentNote, (newNote, oldNote) => {
  if (newNote) {
    // 如果是同一个笔记的内容更新，且编辑器正在被编辑，不要覆盖用户正在编辑的内容
    if (oldNote && newNote.id === oldNote.id && document.activeElement === editorRef.value?.$el.querySelector('textarea')) {
      // 如果用户正在编辑，不更新编辑器内容
      console.log('用户正在编辑，不更新编辑器内容');
    } else {
      // 否则更新编辑器内容
      editorContent.value = newNote.content;
    }
  } else {
    editorContent.value = '';
  }
}, { immediate: true });

const filteredNotes = computed(() => {
  // 确保notes是数组
  const notes = Array.isArray(papperStore.notes) ? papperStore.notes : [];

  if (!searchText.value) return notes;
  const search = searchText.value.toLowerCase();
  return notes.filter(note =>
    note.content.toLowerCase().includes(search)
  );
});

// 方法
const loadNotes = async () => {
  try {
    // 添加调试信息
    console.log('加载笔记前，检查Chrome扩展环境：', {
      chrome: typeof chrome !== 'undefined',
      runtime: typeof chrome !== 'undefined' && chrome.runtime ? true : false,
      runtimeId: typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.id : null,
      storage: typeof chrome !== 'undefined' && chrome.storage ? true : false,
      storageLocal: typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ? true : false
    });

    await papperStore.loadNotes();
    if (papperStore.notes.length > 0 && !papperStore.currentNote) {
      // 按更新时间排序，选择最近更新的笔记
      const mostRecentNote = [...papperStore.notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      papperStore.setCurrentNote(mostRecentNote);
    }
  } catch (error) {
    console.error('加载笔记失败:', error);
    $q.notify({
      color: 'negative',
      message: `加载笔记失败: ${error instanceof Error ? error.message : '未知错误'}`,
      icon: 'error',
      position: 'bottom-right',
      timeout: 3000
    });
  }
};

const createNewNote = async () => {
  isCreating.value = true;
  try {
    console.log('开始创建新笔记...');
    const newNote = await papperStore.createNote();
    console.log('新笔记创建成功:', newNote);

    await nextTick();
    if (editorRef.value) {
      console.log('设置编辑器焦点');
      editorRef.value.focus();
    } else {
      console.warn('编辑器引用不可用，无法设置焦点');
    }

    // 显示成功通知
    $q.notify({
      color: 'positive',
      message: '新笔记创建成功',
      icon: 'check',
      position: 'bottom-right',
      timeout: 2000
    });
  } catch (error) {
    console.error('创建笔记失败:', error);

    // 显示错误通知
    $q.notify({
      color: 'negative',
      message: `创建笔记失败: ${error instanceof Error ? error.message : '未知错误'}`,
      icon: 'error',
      position: 'bottom-right',
      timeout: 3000
    });
  } finally {
    isCreating.value = false;
  }
};

const selectNote = (note: Note) => {
  papperStore.setCurrentNote(note);
  // 如果有搜索文本，选择笔记后自动定位到搜索内容
  if (searchText.value) {
    nextTick(() => {
      searchInCurrentNote();
    });
  }
};

const onEditorChange = (value: string | number | null) => {
  if (!currentNote.value) return;

  // 使用防抖来减少存储操作
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }

  debounceTimer.value = window.setTimeout(() => {
    if (!currentNote.value) return;
    // 确保value是字符串
    const content = value !== null ? String(value) : '';
    papperStore.updateNote(currentNote.value.id, content);
  }, 500);
};

// 在当前笔记中搜索并定位到搜索内容
const searchInCurrentNote = () => {
  if (!currentNote.value || !searchText.value || !editorRef.value) {
    // 如果没有当前笔记或搜索文本为空，显示提示
    if (!currentNote.value) {
      $q.notify({
        color: 'warning',
        message: '请先选择一个笔记',
        icon: 'info',
        position: 'bottom-right',
        timeout: 2000
      });
    } else if (!searchText.value) {
      $q.notify({
        color: 'warning',
        message: '请输入搜索内容',
        icon: 'info',
        position: 'bottom-right',
        timeout: 2000
      });
    }
    return;
  }

  const textarea = editorRef.value.$el.querySelector('textarea');
  if (!textarea) return;

  const content = editorContent.value.toLowerCase();
  const searchTerm = searchText.value.toLowerCase();
  const position = content.indexOf(searchTerm);

  if (position !== -1) {
    // 设置选择范围，定位到搜索内容
    textarea.focus();
    textarea.setSelectionRange(position, position + searchTerm.length);

    // 确保搜索内容在可视区域内
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const linesBeforeMatch = editorContent.value.substring(0, position).split('\n').length - 1;
    const scrollTop = linesBeforeMatch * lineHeight;
    textarea.scrollTop = scrollTop;

    // 显示成功通知
    $q.notify({
      color: 'positive',
      message: `找到匹配内容`,
      icon: 'search',
      position: 'bottom-right',
      timeout: 1000
    });
  } else {
    // 显示未找到通知
    $q.notify({
      color: 'negative',
      message: `未找到匹配内容`,
      icon: 'search_off',
      position: 'bottom-right',
      timeout: 1000
    });
  }
};

const confirmDelete = (note: Note) => {
  noteToDelete.value = note;
  deleteDialog.value = true;
};

const deleteNote = async () => {
  if (noteToDelete.value) {
    try {
      // 添加调试信息
      console.log('删除笔记前，检查Chrome扩展环境：', {
        chrome: typeof chrome !== 'undefined',
        runtime: typeof chrome !== 'undefined' && chrome.runtime ? true : false,
        runtimeId: typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.id : null,
        storage: typeof chrome !== 'undefined' && chrome.storage ? true : false,
        storageLocal: typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ? true : false
      });

      await papperStore.deleteNote(noteToDelete.value.id);
      noteToDelete.value = null;
      $q.notify({
        color: 'positive',
        message: '笔记已删除',
        icon: 'check'
      });
    } catch (error) {
      console.error('删除笔记失败:', error);
      $q.notify({
        color: 'negative',
        message: `删除笔记失败: ${error instanceof Error ? error.message : '未知错误'}`,
        icon: 'error',
        position: 'bottom-right',
        timeout: 3000
      });
    }
  }
};

const getNoteTitle = (note: Note): string => {
  // 从笔记内容中提取第一行作为标题
  const firstLine = note.content.split('\n')[0].trim();
  if (firstLine) {
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
  }
  return '无标题笔记';
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 刷新笔记列表并选择最近更新的笔记
const refreshNotes = async () => {
  await papperStore.loadNotes();
  if (papperStore.notes.length > 0) {
    // 按更新时间排序，选择最近更新的笔记
    const mostRecentNote = [...papperStore.notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    papperStore.setCurrentNote(mostRecentNote);
    $q.notify({
      color: 'positive',
      message: '已刷新笔记列表并打开最近更新的笔记',
      icon: 'refresh',
      position: 'bottom-right',
      timeout: 2000
    });
  }
};

// 清理存储
const cleanStorage = async () => {
  try {
    await papperStore.cleanStorage();
    await refreshNotes();
    $q.notify({
      color: 'positive',
      message: '存储已修复',
      icon: 'check',
      position: 'bottom-right',
      timeout: 2000
    });
  } catch (error) {
    console.error('清理存储失败:', error);
    $q.notify({
      color: 'negative',
      message: `清理存储失败: ${error instanceof Error ? error.message : '未知错误'}`,
      icon: 'error',
      position: 'bottom-right',
      timeout: 3000
    });
  }
};

// 生命周期钩子
onMounted(async () => {
  try {
    // 初始化存储变化监听器，实现多标签页数据同步
    papperStore.initStorageChangeListener((changeType) => {
      // 根据变化类型显示不同的通知
      let message = '';
      let icon = '';

      switch (changeType) {
        case 'create':
          message = '其他标签页创建了新笔记';
          icon = 'add';
          break;
        case 'delete':
          message = '其他标签页删除了笔记';
          icon = 'delete';
          break;
        case 'update':
          message = '笔记内容已在其他标签页更新';
          icon = 'update';
          break;
      }

      // 显示通知
      $q.notify({
        color: 'info',
        message,
        icon,
        position: 'bottom-right',
        timeout: 3000
      });
    });

    await loadNotes();
  } catch (error) {
    console.error('初始化笔记功能失败:', error);
    $q.notify({
      color: 'negative',
      message: `初始化笔记功能失败: ${error instanceof Error ? error.message : '未知错误'}`,
      icon: 'error',
      position: 'bottom-right',
      timeout: 3000
    });
  }
});
</script>

<style scoped lang="scss">
.papper-page {
  padding: 0 !important;
  height: 100vh;
  overflow: hidden;
  background-color: #f8f9fa;
}

.sidebar-container {
  width: 300px;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 250px;
  }

  @media (max-width: 576px) {
    width: 100%;
  }
}

.editor-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notes-sidebar {
  height: 100vh;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.05);
  background-color: #f7f5f8;
  border-radius: 0;
}

.notes-list {
  height: calc(100vh - 120px);
  overflow-y: auto;

  :deep(.q-item) {
    transition: background-color 0.2s ease;

    &:hover:not(.q-item--active) {
      background-color: rgba(0, 0, 0, 0.03);
    }
  }
}

.editor-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -1px 0 5px rgba(0, 0, 0, 0.05);
  border-radius: 0;
  background-color: #ffffff;
}

.update-info {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.editor-section {
  height: calc(100vh - 60px);
  padding-bottom: 0;
  overflow-y: auto;
  background-color: #ffffff;
}

.editor {
  height: 100%;
  font-size: 1rem;
  line-height: 1.6;
  background-color: #ffffff;

  :deep(.q-field__control) {
    padding: 0;
    box-shadow: none !important;
  }

  :deep(.q-field__native) {
    height: 100%;
    padding: 1rem;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    resize: none;
    overflow-y: auto;
    background-color: #ffffff;
  }
}

.search-input {
  width: 250px;

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 576px) {
    width: 100%;
    margin-top: 8px;
  }
}

// 响应式布局
@media (max-width: 576px) {
  .row.no-wrap {
    flex-wrap: wrap !important;
  }

  .update-info .row {
    flex-direction: column;
    align-items: flex-start;
  }

  .sidebar-container,
  .editor-container {
    height: 50vh;
  }

  .notes-sidebar,
  .editor-card {
    height: 50vh;
  }

  .notes-list {
    height: calc(50vh - 120px);
  }

  .editor-section {
    height: calc(50vh - 60px);
  }
}
</style>
