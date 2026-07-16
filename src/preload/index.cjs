'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const allowedChannels = new Set([
  'agent-status',
  'get-all-apps',
  'open-app',
  'close-app',
  'capture-screen',
  'clipboard-read',
  'clipboard-write',
  'open-external-url',
  'window-minimize',
  'window-toggle-maximize',
  'window-close',
  'secure-get-keys',
  'secure-save-keys'
])

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke(channel, ...args) {
      if (!allowedChannels.has(channel)) {
        return Promise.reject(new Error(`Desktop channel is not allowed: ${channel}`))
      }
      return ipcRenderer.invoke(channel, ...args)
    }
  }
})
