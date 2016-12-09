/**
 * Created by pedro.f.marquez.soto on 11/28/2016.
 */
import SSH from 'simple-ssh';
import Config from 'electron-config';

const docker = {
    ping: () => "docker service ls",
    services: ()=>"docker service ls | awk 'NR>1{ print $1,$2,$3,$4}'",
    service: (service)=>"docker service inspect "+service,
    nodes: ()=> "docker node ls | tr '*' ' ' | awk 'NR>1{print $2}'",
    node:(node)=>"docker node inspect "+node,
    scale:(service,replicas)=>"docker service scale "+service+"="+replicas,
    serviceDelete:(service)=>"docker service rm "+service,
    serviceUpdate:(service)=>"docker service update "+service
}


function toJSON(data){
    var result;
    try{
        result = JSON.parse(data)
    }
    catch(e){
        console.error("Error converting to JSON",data)
    }
    return result;
}

export var DockerService = ['$q',function($q){
	const config = new Config();

	//var managerIP = '192.168.99.101';
	var managerIP = config.get('docker.manager.ip');

	var getSSH = function(manIP, defered){
		var ssh = new SSH({
			host: manIP,
			user: 'docker',
			pass: 'tcuser'
		});
		ssh.on('error', function(err) {
			console.log('Oops, something went wrong.');
			console.log(err);
			defered.reject(err);
			ssh.end();
		});
		return ssh;
	}
	return {
		setManagerIP:function(newManagerIP){
			managerIP = newManagerIP;
			config.set('docker.manager.ip',newManagerIP);
		},
		getManagerIP:function(){
			managerIP = config.get('docker.manager.ip');
			return managerIP;
		},
		testConnection:function(ip){
			var ipToTest = ip ? ip :managerIP;

			var defered = $q.defer();
			var ssh = getSSH(ipToTest, defered);
			var data = "";
			ssh.exec(docker.ping(), {
				out: function(stdout) {
					data = data + stdout;
				},
                err: function(stderr) {
                    defered.reject(stderr);
                },
				exit:function(){
					defered.resolve(data);
				}
			}).start();
			return defered.promise;
		},
		exec:function(command){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			var data = "";

			ssh.exec(command, {
				out: function(stdout) {
					data = data + stdout;
				},
				err: function(stderr) {
					defered.reject(stderr);
				},
				exit:function(stdout){
					if(stdout == 127){
						defered.reject("not found");
					}
					defered.resolve(data);
				}
			}).start();
			return defered.promise;
		},
		getServices:function(){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			//192.168.99.118
			var data = "";
			ssh.exec(docker.services(), {
				out: function(stdout) {
					data = data + stdout;
				},
                err: function(stderr) {
                    defered.reject(stderr);
                },
				exit:function(code, stdout, stderr){
					var services = [];
					data = data.replace(/\n$/, "")
					for(var i in data.split("\n")){
						var service = {};
                        try{
						service.id = data.split("\n")[i].split(" ")[0];
						service.name = data.split("\n")[i].split(" ")[1];
						service.replicas = data.split("\n")[i].split(" ")[2];
						service.totalReplicas = parseInt(data.split("\n")[i].split(" ")[2].split("/")[1]);
						service.image = data.split("\n")[i].split(" ")[3];
                        }
                        catch(e){
                            console.log("Error",e)
                        }
						services.push(service);
					}
					defered.resolve(services);

				}
			}).start();
			return defered.promise;
		},
		getService:function(service){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			//192.168.99.118

            if(!service || service==''){
                defered.reject("No name supplied to getService")
                return defered.promise;
            }

			var data = "";
			ssh.exec(docker.service(service), {
				out: function(node) {
					data = data + node;
				},
                err: function(stderr) {
                    defered.reject(stderr);
                },
				exit:function(code, stdout, stderr ){
					data = data.replace(/\n$/, "")
					defered.resolve(toJSON(data));
				}
			}).start();
			return defered.promise;
		},
		getNodes(){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			var nodes = [];
			var data = "";
			ssh.exec(docker.nodes(), {
				out: function(stdout) {
					data = data + stdout;
				},
                err: function(stderr) {
                    console.error("stderr",stderr)
                    defered.reject(stderr);
                },
				exit:function(code, stdout, stderr ){

                    if(!data || data==""){
                        defered.reject("The manager didn't return any data about the nodes");
                    }

					data = data.replace(/\n$/, "")
					defered.resolve(data.split("\n"));
				}
			}).start();
			return defered.promise;
		},
		getNodeDetails: function(name){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			var data = "";

            if(!name || name==''){
                defered.reject("No name supplied to getNodeDetails")
                return defered.promise;
            }

			ssh.exec(docker.node(name), {
				out: function(node) {
					data = data + node;
				},
                err: function(stderr) {
                    defered.reject(stderr);
                },
				exit:function(code, stdout, stderr ){
					data = data.replace(/\n$/, "")
                    if(!data){
                        defered.reject({message:"No data returned for service '"+name+"'",serviceName:name});
                    }
					defered.resolve(toJSON(data));
				}
			}).start();
			return defered.promise;
		},
		scaleService:function(service, instances){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			var data = "";

			ssh.exec(docker.scale(service, instances), {
				out: function(stdout) {
					data = data + stdout;
				},
				err: function(stderr) {
					defered.reject(stderr);
				},
				exit:function(code, stdout, stderr ){
					if(stdout == 127){
						defered.reject("not found");
					}
					defered.resolve(data);
				}
			}).start();
			return defered.promise;
		},
		deleteService:function(service){
			var defered = $q.defer();
			var ssh = getSSH(managerIP, defered);
			var data = "";

			ssh.exec(docker.serviceDelete(service), {
				out: function(stdout) {
					data = data + stdout;
				},
				err: function(stderr) {
					defered.reject(stderr);
				},
				exit:function(stdout){
					if(stdout == 127){
						defered.reject("not found");
					}
					defered.resolve(data);
				}
			}).start();
			return defered.promise;
		},
        updateService:function(service){
            var defered = $q.defer();
            var ssh = getSSH(managerIP, defered);
            var data = "";

            ssh.exec(docker.serviceUpdate(service), {
                out: function(stdout) {
                    data = data + stdout;
                },
                err: function(stderr) {
                    defered.reject(stderr);
                },
                exit:function(stdout){
                    if(stdout == 127){
                        defered.reject("not found");
                    }
                    defered.resolve(data);
                }
            }).start();
            return defered.promise;
        }

	}

}];
