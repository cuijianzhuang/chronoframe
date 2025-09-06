export default eventHandler(async (_event) => {
  // 简单的处理器状态检查
  const status = {
    mode: 'background-processing',
    active: true,
    type: 'async-setImmediate',
    blocking: false
  }
  
  return {
    processor: status,
    timestamp: new Date().toISOString(),
    message: 'Background photo processing status'
  }
})
