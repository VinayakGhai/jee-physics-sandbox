const { contextBridge } = require('electron');

// Expose safe desktop API bridge
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true
});
