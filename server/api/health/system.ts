export default eventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method === 'GET') {
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    return {
      uptime: uptime,
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal
      },
      processing: {
        active: true,
        queued: 0 // 后台处理不维护队列
      },
      timestamp: new Date().toISOString()
    }
  }
  
  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
