/**
 * Created by pedro.f.marquez.soto on 11/28/2016.
 */

import Config from 'electron-config';

export var MainCtrl = ['$scope','$rootScope','$mdDialog','DockerService','$timeout','$state',function($scope,$rootScope,$mdDialog,DockerService,$timeout,$state){
	var ctrl = this;
	const REFRESH_TIME_KEY = "manager.data.refreshRate"
	const config = new Config();
	if(!config.has(REFRESH_TIME_KEY)){
		config.set(REFRESH_TIME_KEY,1000);
	}

	ctrl.nodeTitle = "Nodes";
	ctrl.currentNavItem = "services"

	ctrl.errors = {}

    ctrl.nodesLoading = true;

	var isConnected = true;

    $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams) {
            $state.current = toState;
            if($state.current.name == 'node'){
                ctrl.currentNavItem = 'node';
                ctrl.nodeName = toParams.nodeName;
            }
        }
    )

    ctrl.nodeDetails = function(nodeName, nodeList=[]){
        DockerService.getNodeDetails(nodeName).then(function(node){
            nodeList.push(node[0]);
        }).catch(e => {
            console.error(e.message)
            //node.Description.Hostname
            $timeout(()=>ctrl.nodeDetails(nodeName, nodeList), config.get(REFRESH_TIME_KEY));

            //ctrl.nodes.push({Description:{Hostname:e.serviceName}});
        })
    }

	ctrl.loadNodes = function(){
        ctrl.nodesLoading = true;
		DockerService.getNodes().then(function(data){
			isConnected = true;
			ctrl.nodes = [];
			for(var i in data){
                ctrl.nodeDetails(data[i], ctrl.nodes)
			}
            ctrl.nodesLoading = false;
		}).catch(function(err){
			isConnected = false;
			console.error(err)

            $timeout(ctrl.loadNodes, config.get(REFRESH_TIME_KEY));
		});;
	};

	ctrl.loadServices = function(){
		DockerService.getServices().then(function(data){
			isConnected = true;
			ctrl.services = data;
		}).catch(function(err){
			isConnected = false;
			console.error(err);
		});
	}


	ctrl.reload = function(){
		ctrl.loadNodes();
		ctrl.loadServices();
        (function tick() {
            if(isConnected){
                ctrl.loadServices();
                $timeout(tick, config.get(REFRESH_TIME_KEY));
            }
            else{
                alert("Could not connect")
                ctrl.services = [];
                ctrl.nodes = [];
            }
        })();
	}

    $scope.$on("managerIPSet",(result)=>{
        ctrl.reload();
    });

    if( DockerService.getManagerIP()){
        ctrl.reload();
    }
	$scope.$on('reloadPage', ctrl.reload);

	ctrl.showManager = function(ev,node) {
		DockerService.getNodeDetails(node.Description.Hostname).then(function(node){
			ctrl.openNode = node[0];
			$mdDialog.show({
				contentElement: '#myStaticDialog',
				parent: angular.element(document.body),
				fullScreen:true
			})
		})

	};

	ctrl.closeModal = function(){
		$mdDialog.cancel();
	}


	ctrl.openService = function(service){
		DockerService.getService(service).then(function(data){
			ctrl.opService = data[0];
		}).catch(function(err){
			ctrl.errors.openService = true;
			delete ctrl.opService;
		});
	}

	ctrl.managerIP = DockerService.getManagerIP();

	ctrl.saveManagerIP = function(){
		ctrl.saving = true;
		DockerService.testConnection(ctrl.managerIP).then(function(data){
			DockerService.setManagerIP(ctrl.managerIP);
			ctrl.configForm.$setPristine();
			$rootScope.$broadcast('reloadPage');
			delete ctrl.errors.connection;
		}).catch(function(err){
			ctrl.errors.connection = true;
		}).finally(function(){
			ctrl.saving = false;
		})

	}

	ctrl.sendCommand = function(command){
		ctrl.executing = true;
		DockerService.exec(command).then(function(data){
			ctrl.commandResult = data;
		}).catch(function(err){
			ctrl.commandResult = err;
			ctrl.errors.command = true;
		}).finally(function(){
			ctrl.executing = false;
		})
	}

	ctrl.setReplica = function(serviceName, replicas){
		DockerService.scaleService(serviceName,replicas).then(data => {
            ctrl.loadServices();
        });
	}

	ctrl.deleteService = function(serviceName){
		DockerService.deleteService(serviceName).then(data => console.log("Delete successful"));
	}

    ctrl.updateService = function(serviceName){
        DockerService.updateService(serviceName).then(data => console.log("Update successful"));
    }
}];
