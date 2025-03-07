import { defineStore } from 'pinia';

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export const usePapperStore = defineStore('papper', {
  state: () => ({
    notes: [] as Note[],
    currentNote: null as Note | null,
    isLocalUpdate: false,
  }),

  getters: {
    getNoteById: (state) => (id: string) => {
      // 确保notes是一个有效的数组
      if (!Array.isArray(state.notes)) {
        console.warn('getNoteById: notes不是一个数组');
        return null;
      }
      return state.notes.find(note => note.id === id) || null;
    },
  },

  actions: {
    // 清理存储，确保数据格式一致
    async cleanStorage() {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          console.log('尝试清理存储...');
          // 获取当前存储的数据
          const result = await new Promise<{ papper_notes?: any }>((resolve, reject) => {
            chrome.storage.local.get('papper_notes', (items) => {
              if (chrome.runtime.lastError) {
                reject(new Error(`获取笔记失败: ${chrome.runtime.lastError.message}`));
              } else {
                resolve(items);
              }
            });
          });

          // 如果数据不是数组格式，进行转换并重新保存
          if (result.papper_notes && !Array.isArray(result.papper_notes) && typeof result.papper_notes === 'object') {
            const notesArray = Object.values(result.papper_notes) as Note[];
            console.log('将对象格式转换为数组格式:', notesArray);

            await new Promise<void>((resolve, reject) => {
              chrome.storage.local.set({ papper_notes: notesArray }, () => {
                if (chrome.runtime.lastError) {
                  reject(new Error(`重新保存笔记失败: ${chrome.runtime.lastError.message}`));
                } else {
                  resolve();
                }
              });
            });

            console.log('存储清理完成');
          }
        } catch (error) {
          console.error('清理存储失败:', error);
        }
      }
    },

    initStorageChangeListener(onExternalUpdate?: (type: 'update' | 'delete' | 'create') => void) {
      // 检查是否在Chrome扩展环境中
      const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

      if (!isChromeExtension) {
        console.warn('不在Chrome扩展环境中，无法监听存储变化');
        return;
      }

      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;

        if (changes.papper_notes && !this.isLocalUpdate) {
          // 确保newNotes和oldNotes是有效的数组
          const newValue = changes.papper_notes.newValue;
          const oldValue = changes.papper_notes.oldValue;

          const newNotes = Array.isArray(newValue) ? newValue : [];
          const oldNotes = Array.isArray(oldValue) ? oldValue : [];

          let changeType: 'update' | 'delete' | 'create' = 'update';
          if (newNotes.length > oldNotes.length) {
            changeType = 'create';
          } else if (newNotes.length < oldNotes.length) {
            changeType = 'delete';
          }

          this.notes = newNotes;

          if (this.currentNote) {
            const updatedCurrentNote = this.getNoteById(this.currentNote.id);

            if (updatedCurrentNote) {
              this.currentNote = updatedCurrentNote;
            }
            else if (this.notes.length > 0) {
              const mostRecentNote = [...this.notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
              this.currentNote = mostRecentNote;
            }
            else {
              this.currentNote = null;
            }
          }

          if (onExternalUpdate) {
            onExternalUpdate(changeType);
          }
        }
      });
    },

    async loadNotes() {
      try {
        console.log('开始加载笔记...');

        // 检查是否在Chrome扩展环境中
        const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
        console.log('Chrome扩展环境检查:', isChromeExtension);

        // 先清理存储，确保数据格式一致
        await this.cleanStorage();

        if (!isChromeExtension) {
          console.warn('不在Chrome扩展环境中，尝试从localStorage加载');
          // 从localStorage加载笔记
          const notesJson = localStorage.getItem('papper_notes');
          if (notesJson) {
            try {
              const parsedNotes = JSON.parse(notesJson);
              if (Array.isArray(parsedNotes)) {
                this.notes = parsedNotes;
                console.log('从localStorage加载笔记成功，数量:', this.notes.length);
                return;
              }
            } catch (e) {
              console.error('解析localStorage中的笔记失败:', e);
            }
          }
          this.notes = [];
          return;
        }

        // 使用Promise包装chrome.storage.local.get调用
        console.log('尝试从chrome.storage.local加载笔记...');
        try {
          const result = await new Promise<{ papper_notes?: any }>((resolve, reject) => {
            chrome.storage.local.get('papper_notes', (items) => {
              if (chrome.runtime.lastError) {
                reject(new Error(`加载笔记失败: ${chrome.runtime.lastError.message}`));
              } else {
                resolve(items);
              }
            });
          });

          console.log('chrome.storage.local.get结果:', result);

          // 处理数据结构，可能是数组或对象
          if (result.papper_notes) {
            if (Array.isArray(result.papper_notes)) {
              // 如果是数组，直接使用
              this.notes = result.papper_notes;
              console.log('笔记加载成功（数组格式），数量:', this.notes.length);
            } else if (typeof result.papper_notes === 'object') {
              // 如果是对象，转换为数组
              try {
                const notesArray = Object.values(result.papper_notes) as Note[];
                if (notesArray.length > 0) {
                  this.notes = notesArray;
                  console.log('笔记加载成功（对象转数组格式），数量:', this.notes.length);
                } else {
                  console.log('笔记对象为空，初始化为空数组');
                  this.notes = [];
                }
              } catch (e) {
                console.error('转换笔记对象为数组失败:', e);
                this.notes = [];
              }
            } else {
              console.log('笔记数据格式不正确，初始化为空数组');
              this.notes = [];
            }
          } else {
            console.log('没有找到已保存的笔记，初始化为空数组');
            this.notes = [];
          }
        } catch (storageError) {
          console.error('从chrome.storage.local加载笔记失败:', storageError);
          // 尝试从localStorage加载作为备用
          console.warn('尝试从localStorage加载作为备用...');
          const notesJson = localStorage.getItem('papper_notes');
          if (notesJson) {
            try {
              const parsedNotes = JSON.parse(notesJson);
              if (Array.isArray(parsedNotes)) {
                this.notes = parsedNotes;
                console.log('从localStorage备用加载笔记成功，数量:', this.notes.length);
                return;
              }
            } catch (e) {
              console.error('解析localStorage中的笔记失败:', e);
            }
          }
          this.notes = [];
        }
      } catch (error) {
        console.error('加载笔记失败:', error);
        // 初始化为空数组，以便用户可以创建新笔记
        this.notes = [];
        throw error; // 重新抛出错误，以便调用者可以处理
      }
    },

    async saveNotes() {
      try {
        this.isLocalUpdate = true;
        console.log('准备保存笔记到存储:', this.notes);

        // 检查是否在Chrome扩展环境中
        const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
        console.log('Chrome扩展环境检查:', isChromeExtension);

        if (!isChromeExtension) {
          console.warn('不在Chrome扩展环境中，使用localStorage保存');
          // 使用localStorage保存笔记
          localStorage.setItem('papper_notes', JSON.stringify(this.notes));
          console.log('笔记保存到localStorage成功');

          // 延迟重置isLocalUpdate标志
          setTimeout(() => {
            this.isLocalUpdate = false;
          }, 100);
          return;
        }

        // 使用Promise包装chrome.storage.local.set调用
        console.log('尝试保存笔记到chrome.storage.local...');
        try {
          // 确保保存的是数组格式
          console.log('保存的笔记数据:', this.notes);

          await new Promise<void>((resolve, reject) => {
            chrome.storage.local.set({ papper_notes: [...this.notes] }, () => {
              if (chrome.runtime.lastError) {
                reject(new Error(`保存笔记失败: ${chrome.runtime.lastError.message}`));
              } else {
                resolve();
              }
            });
          });

          console.log('笔记保存到chrome.storage.local成功');
        } catch (storageError) {
          console.error('保存到chrome.storage.local失败:', storageError);
          // 尝试使用localStorage作为备用
          console.warn('尝试使用localStorage作为备用...');
          localStorage.setItem('papper_notes', JSON.stringify(this.notes));
          console.log('笔记保存到localStorage备用成功');
        }

        // 延迟重置isLocalUpdate标志
        setTimeout(() => {
          this.isLocalUpdate = false;
        }, 100);
      } catch (error) {
        console.error('保存笔记失败:', error);
        this.isLocalUpdate = false;
        throw error; // 重新抛出错误，以便调用者可以处理
      }
    },

    async createNote() {
      try {
        const newNote: Note = {
          id: Date.now().toString(),
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // 确保notes是一个有效的数组
        if (!Array.isArray(this.notes)) {
          console.warn('notes不是一个数组，初始化为空数组');
          this.notes = [];
        }

        this.notes.push(newNote);
        this.currentNote = newNote;

        console.log('创建新笔记:', newNote);

        await this.saveNotes();

        console.log('笔记保存成功，当前笔记列表:', this.notes);

        return newNote;
      } catch (error) {
        console.error('创建笔记失败:', error);
        throw error;
      }
    },

    async updateNote(id: string, content: string) {
      // 确保notes是一个有效的数组
      if (!Array.isArray(this.notes)) {
        console.warn('updateNote: notes不是一个数组，初始化为空数组');
        this.notes = [];
        return;
      }

      const note = this.getNoteById(id);
      if (note) {
        note.content = content;
        note.updatedAt = Date.now();
        await this.saveNotes();
      }
    },

    async deleteNote(id: string) {
      // 确保notes是一个有效的数组
      if (!Array.isArray(this.notes)) {
        console.warn('deleteNote: notes不是一个数组，初始化为空数组');
        this.notes = [];
        return;
      }

      const index = this.notes.findIndex(note => note.id === id);
      if (index !== -1) {
        this.notes.splice(index, 1);
        if (this.currentNote && this.currentNote.id === id) {
          if (this.notes.length > 0) {
            const mostRecentNote = [...this.notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];
            this.currentNote = mostRecentNote;
          } else {
            this.currentNote = null;
          }
        }
        await this.saveNotes();
      }
    },

    setCurrentNote(note: Note | null) {
      this.currentNote = note;
    },
  },
});
