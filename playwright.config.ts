import {defineConfig} from '@playwright/test';
// Own the test server so an unrelated developer session cannot die midway
// through the complete campaign's reload/continue checks.
export default defineConfig({testDir:'tests/e2e',globalSetup:'./tests/e2e/server.setup.ts',timeout:240000,expect:{timeout:10000},workers:1,reporter:[['list'],['html',{open:'never'}]],use:{actionTimeout:10000,baseURL:'http://127.0.0.1:5174',viewport:{width:1280,height:720},trace:'off',screenshot:'only-on-failure',launchOptions:{channel:'msedge'}}});
