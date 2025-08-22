<script setup lang="ts">
import { ref } from 'vue'
import { WebGLImageViewer } from '@chronoframe/webgl-image'
import type { LoadingState, WebGLImageViewerRef } from '@chronoframe/webgl-image'

// 响应式数据
const debugMode = ref(true)
const controlledViewerRef = ref<WebGLImageViewerRef>()

// 事件处理
const handleZoomChange = (originalScale: number, relativeScale: number) => {
  console.log('Zoom changed:', { originalScale, relativeScale })
}

// 控制方法
const zoomIn = () => {
  controlledViewerRef.value?.zoomIn(true)
}

const zoomOut = () => {
  controlledViewerRef.value?.zoomOut(true)
}

const resetView = () => {
  controlledViewerRef.value?.resetView()
}

const handleLoadingStateChange = (
  isLoading: boolean,
  state: LoadingState | undefined,
  quality: "high" | "medium" | "low" | "unknown" | undefined,
): void => {
  console.log('Loading state changed:', { isLoading, state, quality })
}
</script>

<template>
  <div class="webgl-demo-page">
    <div class="container">
      <h1>WebGL Image Viewer Demo</h1>

      <div class="demo-section">
        <h2>基础示例</h2>
        <div class="viewer-wrapper">
          <WebGLImageViewer
            src="https://cdn.lens.bh8.ga/photos/General%203840x2160%20nature%20landscape%20trees%20plants%20mountains%20snowy%20p.png"
            class="demo-viewer"
            :debug="debugMode"
            :initial-scale="1"
            @zoom-change="handleZoomChange"
            @loading-state-change="handleLoadingStateChange"
          />
        </div>
        <div class="viewer-wrapper">
          <WebGLImageViewer
            src="https://cdn.lens.bh8.ga/photos/mmexport1724859755873.jpg"
            class="demo-viewer"
            :debug="debugMode"
            :initial-scale="1"
            :min-scale="1"
            center-on-init
            limit-to-bounds
            smooth
            @loading-state-change="handleLoadingStateChange"
            @zoom-change="handleZoomChange"
          />
        </div>
      </div>

      <div class="demo-section">
        <h2>控制示例</h2>
        <div class="viewer-wrapper">
          <WebGLImageViewer
            ref="controlledViewerRef"
            src="https://cdn.lens.bh8.ga/photos/IMG_3354.jpeg"
            class="demo-viewer"
            debug
            :min-scale="0.2"
            :max-scale="15"
            :wheel="{ step: 0.05 }"
            :double-click="{ mode: 'zoom', step: 1.8, animationTime: 400 }"
            @loading-state-change="handleLoadingStateChange"
          />
        </div>

        <div class="controls">
          <button
            @click="zoomIn"
            class="control-btn"
          >
            放大
          </button>
          <button
            @click="zoomOut"
            class="control-btn"
          >
            缩小
          </button>
          <button
            @click="resetView"
            class="control-btn"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.webgl-demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.viewer-wrapper {
  width: 100%;
  height: 800px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f8f9fa;
}

.demo-viewer {
  width: 100%;
  height: 100%;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.control-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.control-btn:active {
  transform: translateY(0);
}

.zoom-info {
  font-weight: bold;
  color: #667eea;
  background: #f0f4ff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .webgl-demo-page {
    padding: 16px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 24px;
  }

  .demo-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .viewer-wrapper {
    height: 300px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-btn {
    width: 100%;
  }
}
</style>
