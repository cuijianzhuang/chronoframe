<script setup lang="ts"></script>

<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">ChronoFrame</h1>
        <p class="hero-subtitle">高性能 WebGL 图片查看器</p>
        <p class="hero-description">
          基于 WebGL 的硬件加速图片渲染组件，为 Nuxt 4
          项目提供流畅的缩放、平移体验。
        </p>
        <div class="hero-actions">
          <NuxtLink
            to="/webgl/demo"
            class="btn btn-primary"
          >
            查看演示
          </NuxtLink>
          <a
            href="https://github.com/your-repo/chrono-frame"
            class="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">核心特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>硬件加速</h3>
            <p>基于 WebGL 的 GPU 渲染，提供极致性能表现</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🖼️</div>
            <h3>高分辨率支持</h3>
            <p>支持任意尺寸图片，智能纹理管理</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>跨平台兼容</h3>
            <p>支持桌面和移动设备的鼠标、触摸操作</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>平滑动画</h3>
            <p>物理感的缓动动画，流畅的用户体验</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>性能优化</h3>
            <p>渲染节流、防抖更新、内存管理</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <h3>高度可配置</h3>
            <p>丰富的配置选项和回调函数</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f7fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.features-section {
  padding: 80px 20px;
  background: #f7fafc;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 200px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
