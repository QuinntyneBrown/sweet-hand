/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { LaunchApp } from './app/app';

bootstrapApplication(LaunchApp, appConfig).catch((err) => console.error(err));
