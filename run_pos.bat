@echo off
start /b node server.js
timeout /t 2
start "" "index.html"
exit