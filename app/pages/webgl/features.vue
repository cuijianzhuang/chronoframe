<script setup lang="ts">
import { ref, computed } from 'vue'
import { WebGLImageViewer } from '@chronoframe/webgl-image'

const imageUrl = ref('https://cdn.lens.bh8.ga/photos/mmexport1724859755873.jpg')

const useCustomSize = ref(false)
const customWidth = ref(600)
const customHeight = ref(400)

const config = ref({
  debug: true,
  limitToBounds: true,
  smooth: true,
  centerOnInit: true,
  minScale: 0.1,
  maxScale: 10,
})

const wheelConfig = computed(() => ({
  step: 0.2,
  wheelDisabled: false,
  touchPadDisabled: false,
}))

const pinchConfig = computed(() => ({
  step: 0.2,
  disabled: false,
}))

const doubleClickConfig = computed(() => ({
  step: 0.7,
  disabled: false,
  mode: 'toggle' as const,
  animationTime: 300,
}))

const panningConfig = computed(() => ({
  disabled: false,
  velocityDisabled: false,
}))

const alignmentAnimationConfig = computed(() => ({
  duration: 300,
  easing: (t: number) => 1 - Math.pow(1 - t, 3),
}))

const velocityAnimationConfig = computed(() => ({
  duration: 500,
  easing: (t: number) => 1 - Math.pow(1 - t, 3),
}))

const viewerRef = ref()
const currentScale = ref(1)
const isLoading = ref(false)
const lastZoomChange = ref<{ original: number; relative: number } | null>(null)

const handleZoomIn = () => {
  viewerRef.value?.zoomIn(false)
}

const handleZoomInAnimated = () => {
  viewerRef.value?.zoomIn(true)
}

const handleZoomOut = () => {
  viewerRef.value?.zoomOut(false)
}

const handleZoomOutAnimated = () => {
  viewerRef.value?.zoomOut(true)
}

const handleReset = () => {
  viewerRef.value?.resetView()
}

const handleZoomChange = (originalScale: number, relativeScale: number) => {
  currentScale.value = originalScale
  lastZoomChange.value = { original: originalScale, relative: relativeScale }
}

const handleImageCopied = () => {
  console.log('图片已复制到剪贴板')
}

const handleLoadingStateChange = (loading: boolean) => {
  isLoading.value = loading
}
</script>

<template>
  <div class="demo-container">
    <h1>WebGL Image Viewer - 完整功能测试</h1>

    <div class="controls">
      <div class="control-group">
        <label>图片URL:</label>
        <input
          v-model="imageUrl"
          type="url"
          placeholder="请输入图片URL"
          class="url-input"
        />
      </div>

      <div class="control-group">
        <label>尺寸控制:</label>
        <div class="size-controls">
          <label>
            <input
              v-model="useCustomSize"
              type="checkbox"
            />
            自定义尺寸
          </label>
          <template v-if="useCustomSize">
            <input
              v-model.number="customWidth"
              type="number"
              placeholder="宽度"
              min="200"
              max="1000"
            />
            x
            <input
              v-model.number="customHeight"
              type="number"
              placeholder="高度"
              min="200"
              max="800"
            />
          </template>
        </div>
      </div>

      <div class="control-group">
        <label>配置选项:</label>
        <div class="config-controls">
          <label>
            <input
              v-model="config.debug"
              type="checkbox"
            />
            调试模式
          </label>
          <label>
            <input
              v-model="config.limitToBounds"
              type="checkbox"
            />
            限制边界
          </label>
          <label>
            <input
              v-model="config.smooth"
              type="checkbox"
            />
            平滑处理
          </label>
          <label>
            <input
              v-model="config.centerOnInit"
              type="checkbox"
            />
            初始居中
          </label>
        </div>
      </div>

      <div class="control-group">
        <label>缩放控制:</label>
        <div class="scale-controls">
          <input
            v-model.number="config.minScale"
            type="number"
            step="0.1"
            min="0.1"
            max="1"
            placeholder="最小缩放"
          />
          <span>到</span>
          <input
            v-model.number="config.maxScale"
            type="number"
            step="1"
            min="1"
            max="20"
            placeholder="最大缩放"
          />
        </div>
      </div>

      <div class="button-group">
        <button
          class="btn"
          @click="handleZoomIn"
        >
          放大 (无动画)
        </button>
        <button
          class="btn"
          @click="handleZoomInAnimated"
        >
          放大 (动画)
        </button>
        <button
          class="btn"
          @click="handleZoomOut"
        >
          缩小 (无动画)
        </button>
        <button
          class="btn"
          @click="handleZoomOutAnimated"
        >
          缩小 (动画)
        </button>
        <button
          class="btn"
          @click="handleReset"
        >
          重置
        </button>
      </div>
    </div>

    <div class="viewer-container">
      <WebGLImageViewer
        ref="viewerRef"
        :src="imageUrl"
        :width="useCustomSize ? customWidth : undefined"
        :height="useCustomSize ? customHeight : undefined"
        :debug="config.debug"
        :limit-to-bounds="config.limitToBounds"
        :smooth="config.smooth"
        :center-on-init="config.centerOnInit"
        :min-scale="config.minScale"
        :max-scale="config.maxScale"
        :wheel="wheelConfig"
        :pinch="pinchConfig"
        :double-click="doubleClickConfig"
        :panning="panningConfig"
        :alignment-animation="alignmentAnimationConfig"
        :velocity-animation="velocityAnimationConfig"
        @zoom-change="handleZoomChange"
        @image-copied="handleImageCopied"
        @loading-state-change="handleLoadingStateChange"
      />
    </div>

    <div class="status">
      <p>当前缩放: {{ currentScale.toFixed(2) }}</p>
      <p>加载状态: {{ isLoading ? '加载中...' : '已加载' }}</p>
      <p v-if="lastZoomChange">
        最后缩放变化: 原始={{ lastZoomChange.original.toFixed(2) }}, 相对={{
          lastZoomChange.relative.toFixed(2)
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.controls {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 11px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.url-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.size-controls,
.config-controls,
.scale-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.size-controls input[type='number'] {
  width: 80px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.scale-controls input {
  width: 100px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.config-controls label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  margin-bottom: 0;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #0056b3;
}

.viewer-container {
  background: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.viewer {
  width: 100%;
  height: 650px;
}

.status {
  background: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
}

.status p {
  margin: 5px 0;
}
</style>
