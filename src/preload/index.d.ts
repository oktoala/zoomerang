import { ElectronAPI } from '@electron-toolkit/preload';
import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    ipcRenderer: IpcRenderer;
  }
}
