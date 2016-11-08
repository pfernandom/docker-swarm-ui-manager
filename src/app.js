// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';
import shell from 'shelljs';
import SSH from 'simple-ssh';

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
    
    var _templateBase = './scripts';
    
    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate'
    ])
	.controller('DialogController',['$scope','$mdDialog','DockerService',function($scope,$mdDialog,DockerService){
		console.log($scope);
		this.cancel = function() {
			$mdDialog.cancel();
		};
	}])
	.controller('MainCtrl',['$scope','$mdDialog','DockerService',function($scope,$mdDialog,DockerService){
		var ctrl = this;
		ctrl.nodeTitle = "Nodes";

		ctrl.currentNavItem = "services"
		ctrl.loadNodes = function(){
			DockerService.getNodes().then(function(data){
				ctrl.nodes = [];
				for(var i in data){
					DockerService.getNodeDetails(data[i]).then(function(node){
						ctrl.nodes.push(node[0]);
					}).catch(function(){console.error(":(");});
				}
			});
		}
		ctrl.loadNodes();
		ctrl.showManager = function(ev,node) {
			ctrl.loadNodes();
			ctrl.openNode = node;
			$mdDialog.show({
				contentElement: '#myStaticDialog',
				parent: angular.element(document.body),
				fullScreen:true
			})
		};

		ctrl.closeModal = function(){
			$mdDialog.cancel();
		}

		DockerService.getServices().then(function(data){
			ctrl.services = data;
		});
		ctrl.openService = function(service){
			DockerService.getService(service).then(function(data){
				ctrl.opService = data[0];
			});
		}
		 
	}])
	.service('DockerService',['$q',function($q){
		var getSSH = function(){
			var ssh = new SSH({
				host: '192.168.99.118',
				user: 'docker',
				pass: 'tcuser'
			});
			ssh.on('error', function(err) {
				console.log('Oops, something went wrong.');
				console.log(err);
				ssh.end();
			});
			return ssh;
		}
		return {
			getServices:function(){
				var ssh = getSSH();
				var defered = $q.defer();
				//192.168.99.118
				var data = "";
				ssh.exec("docker service ls | awk 'NR>1{ print $1,$2,$3,$4}'", {
					out: function(stdout) {
						data = data + stdout;
					},
					exit:function(){
						var services = [];
						data = data.replace(/\n$/, "")
						for(var i in data.split("\n")){
							var service = {};
							service.id = data.split("\n")[i].split(" ")[0];
							service.name = data.split("\n")[i].split(" ")[1];
							service.replicas = data.split("\n")[i].split(" ")[2];
							service.image = data.split("\n")[i].split(" ")[3];
							services.push(service);
						}
						console.log("Exit",services);
						defered.resolve(services);

					}
				}).start();
				return defered.promise;
			},
			getService:function(service){
				var ssh = getSSH();
				var defered = $q.defer();
				//192.168.99.118
				var data = "";
				ssh.exec("docker service inspect "+service, {
					out: function(node) {
						data = data + node;
					},
					exit:function(){
						data = data.replace(/\n$/, "")
						defered.resolve(JSON.parse(data));
					}
				}).start();
				return defered.promise;
			},
			getNodes(){
				var ssh = getSSH();
				var defered = $q.defer();
				var nodes = [];
				var data = "";
				ssh.exec("docker node ls | tr '*' ' ' | awk 'NR>1{print $2}'", {
					out: function(stdout) {
						data = data + stdout;
					},
					exit:function(){
						data = data.replace(/\n$/, "")
						console.log("Exit",data.split("\n"));
						defered.resolve(data.split("\n"));
					}
				}).start();
				return defered.promise;
			},
			getNodeDetails: function(name){
				var ssh = getSSH();
				var defered = $q.defer();
				var data = "";
				ssh.exec("docker node inspect "+name, {
					out: function(node) {
						data = data + node;
					},
					exit:function(){
						data = data.replace(/\n$/, "")
						defered.resolve(JSON.parse(data));
					}
				}).start();
				return defered.promise;
			}

		}
		
	}])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: _templateBase + '/customer/customer.html' ,
                controller: 'customerController',
                controllerAs: '_ctrl'
            });
            $routeProvider.otherwise({ redirectTo: '/' });
        }
    ]);

})();