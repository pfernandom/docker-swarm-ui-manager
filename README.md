Docker Swarm Manager
==============

A simple client application to provide a visual manager for Docker Swarm. The manager is build in NodeJS Electron.
# TLDR
The only development dependency of this project is [Node.js](https://nodejs.org). So just make sure you have it installed.
Then type few commands known to every Node developer...
```
git clone https://github.com/docker-swarm-ui-manager.git
cd /docker-swarm-ui-manager
npm install
npm start

This will install and run the application in your computer.
```
![](https://pfernandom.github.io/electroswarm/images/img3.png)

![](https://pfernandom.github.io/electroswarm/images/img2.png)
#Setup

### Installation

```
npm install
```
It will also download Electron runtime, and install dependencies for second `package.json` file inside `app` folder.

### Starting the app

```
npm start
```

### Adding npm modules to your app

Remember to add your dependency to `app/package.json` file, so do:
```
cd app
npm install name_of_npm_module --save
```

### Working with modules

Thanks to [rollup](https://github.com/rollup/rollup) you can (and should) use ES6 modules for all code in `src` folder. But because ES6 modules still aren't natively supported you can't use it in the `app` folder.

So for file in `src` folder do this:
```js
import myStuff from './my_lib/my_stuff';
```

But in file in `app` folder the same line must look as follows:
```js
var myStuff = require('./my_lib/my_stuff');
```

# Testing

### Unit tests

Using [electron-mocha](https://github.com/jprichardson/electron-mocha) test runner with the [chai](http://chaijs.com/api/assert/) assertion library. To run the tests go with standard:
```
npm test
```
Test task searches for all files in `src` directory which respect pattern `*.spec.js`.

### End to end tests

Using [mocha](https://mochajs.org/) test runner and [spectron](http://electron.atom.io/spectron/). Run with command:
```
npm run e2e
```
The task searches for all files in `e2e` directory which respect pattern `*.e2e.js`.

### Continuous integration

Electron [can be plugged](https://github.com/atom/electron/blob/master/docs/tutorial/testing-on-headless-ci.md) into CI systems. Here two CIs are preconfigured for you. [Travis CI](https://travis-ci.org/) covers testing on OSX and Linux and [App Veyor](https://www.appveyor.com) on Windows.

# Making a release

To package your app into an installer use command:
```
npm run release
```
It will start the packaging process for operating system you are running this command on. Ready for distribution file will be outputted to `dist` directory.

You can create Windows installer only when running on Windows, the same is true for Linux and OSX. So to generate all three installers you need all three operating systems.

# License

Released under the MIT license.
