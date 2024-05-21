<template>
  <div class="container draw-container">
    <div id="cursor-dot" ref="dot"></div>
    <div class="draw-tools">
      <div class="left-tools">
        <p class="label">背景：</p>
        <div class="flex-left-center">
          <span class="color" :style="{ backgroundColor: data.bgColor }"></span>
          <q-input v-model="data.bgColor" dense outlined>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="data.bgColor" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <p class="label">描边：</p>
        <div class="flex-left-center">
          <span class="color" :style="{ backgroundColor: data.color }"></span>
          <q-input v-model="data.color" dense outlined>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="data.color" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <p class="label">填充：</p>
        <div class="flex-left-center">
          <span
            class="color"
            :style="{ backgroundColor: data.fillColor }"
          ></span>
          <q-input v-model="data.fillColor" dense outlined>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="data.fillColor" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <p class="label">字体大小：</p>
        <div class="flex-left-center">
          <q-input v-model="data.fontSize" dense outlined>
            <template v-slot:after>
              <span
                class="color-before"
                :style="{ fontSize: data.fontSize + 'px' }"
                >px</span
              >
            </template>
          </q-input>
        </div>
        <p class="label">描边宽度：</p>
        <div class="flex-left-center">
          <q-slider v-model="data.strokeWidth" :min="0" :max="10" />
        </div>
        <p class="label">透明度：</p>
        <div class="flex-left-center">
          <q-slider v-model="data.opacity" :min="0" :max="1" :step="0.1" />
        </div>
      </div>
      <div class="top-tools">
        <div class="flex-left-center">
          <span class="wrap-icon" @click="refresh">
            <IconRefresh width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="deleteSelect">
            <IconDelete width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.SELECT)">
            <IconSelect width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.PENCIL)">
            <IconPencil width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.TEXT)">
            <IconText width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.RECT)">
            <IconRect width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.CIRCLE)">
            <IconCircle width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.TRIANGLE)">
            <IconTriangle width="20" height="20" />
          </span>
          <span class="wrap-icon" @click="chooseDrawType(DrawType.ARROW)">
            <IconArrow width="20" height="20" />
          </span>
        </div>
      </div>
    </div>
    <div id="canvas-container">
      <canvas
        id="canvas"
        ref="canvasEle"
        width="2400"
        height="1500"
        :style="canvasStyle"
        @mousemove="changeDotPosition"
        @mouseover="changeDotPosition"
        @mouseleave="mouseLeave"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'draw-online',
});

import { ref, watch } from 'vue';

import IconDelete from 'src/assets/svg/IconDelete.vue';
import IconSelect from 'src/assets/svg/IconSelect.vue';
import IconRect from 'src/assets/svg/IconRect.vue';
import IconArrow from 'src/assets/svg/IconArrow.vue';
import IconRefresh from 'src/assets/svg/IconRefresh.vue';
import IconTriangle from 'src/assets/svg/IconTriangle.vue';
import IconText from 'src/assets/svg/IconText.vue';
import IconPencil from 'src/assets/svg/IconPencil.vue';
import IconCircle from 'src/assets/svg/IconCircle.vue';

import { fabric } from 'fabric';

import { DrawType, DotStyle } from './const';
import { onMounted } from 'vue';

const isDrawing = ref(false);
const drawType = ref<DrawType>(DrawType.PENCIL);

const dot = ref<null | HTMLElement>(null);
const canvasEle = ref<null | HTMLCanvasElement>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fabricCanvas = ref<any | fabric.Canvas>(null);

const data = ref({
  bgColor: '#FFFFFF',
  color: '#000000',
  fillColor: '#FFFFFF',
  strokeWidth: 1,
  opacity: 1,
  fontSize: 16,
});

const canvasStyle = ref({
  cursor: DotStyle[drawType.value],
});

const refresh = () => {
  fabricCanvas.value?.clear();
};

const deleteSelect = () => {
  if (!fabricCanvas.value) return;
  const activeObject = fabricCanvas.value?.getActiveObject();
  if (activeObject) {
    fabricCanvas.value.remove(activeObject);
  }
};

const chooseDrawType = (type: DrawType) => {
  if (!fabricCanvas.value) return;
  drawType.value = type;
  fabricCanvas.value.off('mouse:down');
  fabricCanvas.value.freeDrawingBrush.shadow = null;
  switch (type) {
    case DrawType.PENCIL:
      fabricCanvas.value.isDrawingMode = true;
      fabricCanvas.value.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: 10,
        offsetX: 5,
        offsetY: 5,
        affectStroke: true,
        color: data.value.color,
      });
      freeDraw();
      break;
    case DrawType.RECT:
      fabricCanvas.value.isDrawingMode = false;
      rectDraw();
      break;
    case DrawType.ARROW:
      fabricCanvas.value.isDrawingMode = false;
      arrowDraw();
      break;
    case DrawType.TEXT:
      fabricCanvas.value.isDrawingMode = false;
      textDraw();
      break;
    case DrawType.TRIANGLE:
      fabricCanvas.value.isDrawingMode = false;
      triangleDraw();
      break;
    case DrawType.CIRCLE:
      fabricCanvas.value.isDrawingMode = false;
      circleDraw();
      break;
    case DrawType.SELECT:
      fabricCanvas.value.isDrawingMode = false;
      break;
    default:
      break;
  }
};

const changeDotPosition = (e: MouseEvent) => {
  if (dot.value) {
    if (drawType.value == DrawType.PENCIL) {
      if (dot.value instanceof HTMLElement) {
        dot.value.style.display = 'block';
        dot.value.style.width = '8px';
        dot.value.style.height = '8px';
        dot.value.style.left = e.clientX - 8 + 'px';
        dot.value.style.top = e.clientY - 8 + 'px';
        dot.value.style.backgroundColor = data.value.color;
        dot.value.style.borderRadius = '50%';
      }
    }
  }
};

const mouseLeave = () => {
  if (dot.value) {
    if (dot.value instanceof HTMLElement) {
      dot.value.style.display = 'none';
    }
  }
};

const updateBrush = () => {
  if (fabricCanvas.value) {
    fabricCanvas.value.freeDrawingBrush.color = data.value.color;
    fabricCanvas.value.freeDrawingBrush.width = data.value.strokeWidth;
    fabricCanvas.value.backgroundColor = data.value.bgColor;
  }
};

const freeDraw = () => {
  if (!fabricCanvas.value) return;
  if (!isDrawing.value) {
    isDrawing.value = true;
    fabricCanvas.value.freeDrawingBrush.color = data.value.color;
    fabricCanvas.value.freeDrawingBrush.width = data.value.strokeWidth;
  } else {
    isDrawing.value = false;
  }
  console.log(fabricCanvas);
};

const rectDraw = () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.on('mouse:down', (e: fabric.IEvent) => {
    // 如果是拖拽事件，不触发
    if (e.target) return;
    const pointer = fabricCanvas.value.getPointer(e.e) as fabric.Point;
    const rect = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      fill: data.value.fillColor,
      stroke: data.value.color,
      strokeWidth: data.value.strokeWidth,
      opacity: data.value.opacity,
      width: 0,
      height: 0,
    }) as fabric.Rect;
    fabricCanvas.value.add(rect);
    fabricCanvas.value.on('mouse:move', (o: fabric.IEvent) => {
      const pointer = fabricCanvas.value.getPointer(o.e);
      rect.set({
        width: pointer.x - (rect.left as number),
        height: pointer.y - (rect.top as number),
      });
      fabricCanvas.value.renderAll();
    });
    fabricCanvas.value.on('mouse:up', () => {
      isDrawing.value = false;
      fabricCanvas.value.off('mouse:move');
      fabricCanvas.value.off('mouse:up');
    });
  });
};

const arrowDraw = () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.on('mouse:down', (e: fabric.IEvent) => {
    // 如果是拖拽事件，不触发
    if (e.target) return;
    const pointer = fabricCanvas.value.getPointer(e);
    const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    const line = new fabric.Line(points, {
      stroke: data.value.color,
      strokeWidth: data.value.strokeWidth,
      opacity: data.value.opacity,
    }) as fabric.Line;

    const arrowHead = new fabric.Triangle({
      width: 10,
      height: 10,
      fill: data.value.color,
      left: pointer.x,
      top: pointer.y,
      angle: 45,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvas.value.add(line);
    fabricCanvas.value.add(arrowHead);
    fabricCanvas.value.on('mouse:move', (o: fabric.IEvent) => {
      const pointer = fabricCanvas.value.getPointer(o.e);
      line.set({ x2: pointer.x, y2: pointer.y });
      const angle =
        (Math.atan2(
          (line.y2 as number) - (line.y1 as number),
          (line.x2 as number) - (line.x1 as number)
        ) *
          180) /
        Math.PI;
      arrowHead.set({
        left: line.x2,
        top: line.y2,
        angle: angle + 90,
      });
      fabricCanvas.value.renderAll();
    });
    fabricCanvas.value.on('mouse:up', () => {
      isDrawing.value = false;
      fabricCanvas.value.off('mouse:move');
      fabricCanvas.value.off('mouse:up');
      chooseDrawType(DrawType.SELECT);
    });
  });
};

const textDraw = () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.on('mouse:down', (e: fabric.IEvent) => {
    console.log(e);
    if (e.target) return;
    const pointer = fabricCanvas.value.getPointer(e);
    const text = new fabric.IText('双击输入文字', {
      left: pointer.x,
      top: pointer.y,
      fill: data.value.color,
      stroke: data.value.color,
      strokeWidth: data.value.strokeWidth,
      opacity: data.value.opacity,
      fontSize: data.value.fontSize,
      editable: true,
    });
    fabricCanvas.value.add(text);
    fabricCanvas.value.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    chooseDrawType(DrawType.SELECT);
  });
  fabricCanvas.value.on('mouse:dblclick', (e: fabric.IEvent) => {
    const target = e.target;
    console.log(e);
    if (target instanceof fabric.IText) {
      target.enterEditing();
    }
  });
};

const triangleDraw = () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.on('mouse:down', (e: fabric.IEvent) => {
    // 如果是拖拽事件，不触发
    if (e.target) return;
    const pointer = fabricCanvas.value.getPointer(e);
    const triangle = new fabric.Triangle({
      left: pointer.x,
      top: pointer.y,
      fill: data.value.fillColor,
      stroke: data.value.color,
      strokeWidth: data.value.strokeWidth,
      opacity: data.value.opacity,
      width: 0,
      height: 0,
    });
    fabricCanvas.value.add(triangle);
    fabricCanvas.value.on('mouse:move', (o: fabric.IEvent) => {
      const pointer = fabricCanvas.value.getPointer(o.e);
      triangle.set({
        width: pointer.x - (triangle.left as number),
        height: pointer.y - (triangle.top as number),
      });
      fabricCanvas.value.renderAll();
    });
    fabricCanvas.value.on('mouse:up', () => {
      isDrawing.value = false;
      fabricCanvas.value.off('mouse:move');
      fabricCanvas.value.off('mouse:up');
    });
  });
};

const circleDraw = () => {
  if (!fabricCanvas.value) return;
  fabricCanvas.value.on('mouse:down', (e: fabric.IEvent) => {
    // 如果是拖拽事件，不触发
    if (e.target) return;
    const pointer = fabricCanvas.value.getPointer(e);
    const circle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      fill: data.value.fillColor,
      stroke: data.value.color,
      strokeWidth: data.value.strokeWidth,
      opacity: data.value.opacity,
      radius: 0,
    });
    fabricCanvas.value.add(circle);
    fabricCanvas.value.on('mouse:move', (o: fabric.IEvent) => {
      const pointer = fabricCanvas.value.getPointer(o.e);
      const radius = Math.abs(pointer.x - (circle.left as number));
      circle.set({ radius });
      fabricCanvas.value.renderAll();
    });
    fabricCanvas.value.on('mouse:up', () => {
      isDrawing.value = false;
      fabricCanvas.value.off('mouse:move');
      fabricCanvas.value.off('mouse:up');
    });
  });
};

onMounted(() => {
  setTimeout(() => {
    fabricCanvas.value = new fabric.Canvas(canvasEle.value, {
      isDrawingMode: true,
    });
    fabricCanvas.value.isDrawingMode = true;
    fabricCanvas.value.freeDrawingBrush.color = data.value.color;
    fabricCanvas.value.freeDrawingBrush.width = data.value.strokeWidth;
    fabricCanvas.value.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 10,
      offsetX: 5,
      offsetY: 5,
      affectStroke: true,
      color: data.value.color,
    });
    fabricCanvas.value.backgroundColor = data.value.bgColor;
    fabricCanvas.value.width = canvasEle.value?.offsetWidth || 1200;
    fabricCanvas.value.height = canvasEle.value?.offsetHeight || 800;
  });
});

watch(
  () => canvasEle.value,
  () => {
    if (!canvasEle.value || !fabricCanvas.value) return;
    fabricCanvas.value.width = canvasEle.value?.offsetWidth || 1200;
    fabricCanvas.value.height = canvasEle.value?.offsetHeight || 800;
  }
);

watch(
  () => data.value,
  () => {
    updateBrush();
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  () => drawType.value,
  (val) => {
    canvasStyle.value = Object.assign({}, canvasStyle.value, {
      cursor: DotStyle[val],
    });
  }
);
</script>

<style lang="scss" scoped>
@import '../index.scss';

.draw-container {
  max-width: calc(100vw - 395px);
  height: calc(100vh - 135px);
  overflow: hidden;
  position: relative;
  .left-tools {
    width: 200px;
    position: absolute;
    left: 0;
    top: 20px;
    background-color: var(--q-background);
    border-radius: 5px;
    box-shadow: 0 0 5px var(--q-border);
    padding: 20px;
    z-index: 9;
  }
  .top-tools {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 20px;
    background-color: var(--q-background);
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 5px var(--q-border);
    z-index: 9;
  }
}

#canvas {
  width: 100%;
  height: 100%;
  cursor: none;
}

#cursor-dot {
  position: fixed;
  z-index: 9;
  cursor: none;
}

.label {
  margin-top: 10px;
  margin-bottom: 4px;
}

.color {
  display: block;
  width: 30px;
  height: 30px;
  border: 1px solid var(--q-border);
  border-radius: 5px;
  flex-shrink: 0;
  margin-right: 10px;
}

.cursor-pointer {
  display: block;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 150%;
  font-size: 20px;
}
</style>

<style lang="scss">
.q-field--dense .q-field__before,
.q-field--dense .q-field__prepend {
  padding: 0;
}
</style>
