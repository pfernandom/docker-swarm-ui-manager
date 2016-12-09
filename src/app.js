// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { DockerService } from './services/DockerService';
import { MainCtrl } from './controllers/MainCtrl';
import Config from 'electron-config';
import env from './env';

import uiRouter from 'angular-ui-router';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log('The author of this app is:', appDir.read('package.json', 'json').author);



document.addEventListener('DOMContentLoaded', function () {
    //shell.echo('hello world');
    //document.getElementById('greet').innerHTML = greet();
    //document.getElementById('platform-info').innerHTML = os.platform();
    //document.getElementById('env-name').innerHTML = env.name;
	//document.getElementById('docker').innerHTML = version;
});


(function () {
    'use strict';
    var _templateBase = './templates';

    angular.module('app', [
        uiRouter,
        'ngMaterial',
        'ngAnimate'
    ])
	.controller('DialogController',['$scope','$mdDialog','DockerService',function($scope,$mdDialog,DockerService){
		this.cancel = function() {
			$mdDialog.cancel();
		};
	}])
	.controller('MainCtrl',MainCtrl)
	.service('DockerService',DockerService)
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('node', {
                url: '/node/:nodeName',
                templateUrl: _templateBase + '/nodeDetails.html' ,
                controller: function ($rootScope,$stateParams, DockerService) {
                    // If we got here from a url of /contacts/42
                    var ctrl = this;
                    DockerService.getNodeDetails($stateParams.nodeName).then(function(node){
                        ctrl.node = node[0];
                    })


                    //$rootScope.$stateParams = $stateParams;
                    //expect($stateParams).toBe({contactId: "42"});
                },
                controllerAs: 'ctrl'
            })
    })
    .run(['$rootScope', '$state','$mdDialog','DockerService', function ($rootScope, $state,$mdDialog, DockerService) {
            const DOCKER_MANAGER_IP_KEY = 'docker.manager.ip';
            const config = new Config();
            if(!config.has(DOCKER_MANAGER_IP_KEY)){
                var confirm = $mdDialog.prompt()
                    .title('What is the IP of your Docker Swarm Manager?')
                    .textContent('We will only ask this once.')
                    .placeholder('127.0.0.7')
                    .ariaLabel('Manager IP')
                    .ok('Save!')
                    .cancel('Cancel');

                const showModal = function(value){
                    confirm.initialValue(value)
                    $mdDialog.show(confirm).then(function(result) {
                        DockerService.testConnection(result).then(function(data){
                            DockerService.setManagerIP(result);
                           //$rootScope.$broadcast('reloadPage');
                            $rootScope.$broadcast("managerIPSet",result);
                        }).catch(function(err){
                            alert(err);
                            showModal(result);
                        }).finally(function(){
                            ctrl.saving = false;
                        })

                    }, function() {
                        $rootScope.$broadcast("managerIPSet",result);
                    });
                }
                showModal("");
            }
            else{
                $rootScope.$broadcast("managerIPSet",true);
            }
            $rootScope.$state = $state;
        }
    ]);
})();
