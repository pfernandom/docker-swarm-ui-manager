import { dialog, app, BrowserWindow } from 'electron';

export var settingsMenuTemplate = {
    label: 'Settings',
    submenu: [{
        label: 'Manager IP',
        click: function () {
            BrowserWindow.getFocusedWindow().toggleDevTools();
            //console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}))
        }
    }]
};


//console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}))
