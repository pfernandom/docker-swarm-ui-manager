import { dialog, app, BrowserWindow } from 'electron';

export var settingsMenuTemplate = {
    label: 'Settings',
    submenu: [{
        label: 'Settings',
        click: function () {
            console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}))
        }
    }]
};


//console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}))