# rodroid

## How to install in Ubuntu:

```
apt-get install xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2
xvfb-run -a --server-args="-screen 0 1366x768x24" node index.js
```