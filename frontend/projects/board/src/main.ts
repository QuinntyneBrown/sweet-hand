import { bootstrapApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { BoardApp } from './app/board-app';

bootstrapApplication(BoardApp, { providers: [provideBrowserGlobalErrorListeners()] }).catch((err) => console.error(err));
