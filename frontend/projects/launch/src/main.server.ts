/// <reference types="@angular/localize" />

import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { LaunchApp } from './app/app';
import { serverConfig } from './app/app.config.server';

/** Build-time bootstrap only: the builder prerenders with it, and no Node server is deployed (L2-105.1). */
const bootstrap = (context: BootstrapContext) => bootstrapApplication(LaunchApp, serverConfig, context);

export default bootstrap;
