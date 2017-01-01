(function() {
	var app = angular.module('sessionTester', ['tagService', 'sessionService','primeService','ui.bootstrap']);

	app.controller("sessionController", function($scope, $timeout, $interval,
		SessionService, TagService, PrimeService) {

		var sessionBean;
		$scope.currentPrime = undefined;
		$scope.running = false; 
		$scope.pause = false;
		$scope.done = false;
		$scope.generatedXml = false;
		$scope.minutesNiceName = '0';
		$scope.secondsNiceName = '00'; 	
		$scope.version = "0.7 | (Beta)";
		$scope.angularVersion = angular.version;
		$scope.animations = {on : true};
		var self = this;

		//Function to grab JSON from tagService
		var promise = TagService.getTag();
		promise.then(function (data)
		{
			$scope.tags = data.data[0].tags;
			console.log($scope.tags);
	
			
		});
		//Function to grab JSON from primeService
		var promise = PrimeService.getPrimes();
		promise.then(function (data)
		{
			$scope.primes = data.data[0].primes;
		});

		
		// Calls with "ng-init" on page load.
		this.init = function() {
			this.findOldSession();
			
			
		}

		
		//Option Bar
		
		this.save = function () {
			saveToFile();

		};
		
		this.load = function () {
			loadFromFile();


		};

		this.preferences = function () {
		};
		this.generateWebReport = function () {
		alert("GenerateWebReport (not implemented)");
		};
		this.cheatSheet = function () {
		};
		this.help = function () {
		alert("Help (not implemented)");
		};
		this.about = function () {
		};
		//Option Bar

		this.getTags = function() {		
			return TagService.tags;
		};
		this.getAbout = function() {		
			//return TagService.aboutDummy;
			return TagService.about;
		};
		this.getContacts = function() {		
			return TagService.contacts;
		};
		this.getLinks = function() {		
			return TagService.links;
		};

		this.findOldSession = function() {
		
			if(localStorage.length > 0) {
				console.log("local storage exists = ", localStorage);
				
				try {
				sessionBean = JSON.parse(localStorage.getItem("sessionBean"));
				} catch(err) {
					return getEmptySession();
				} 
				
				// if it's done. Return a new one 
				if(sessionBean.done === true && sessionBean.generatedXml === true) {
					getEmptySession();	
				} 

				// If i's not done. Start it all upp.
				if(sessionBean.duration > 0) {
					this.resumeSession();
					self = this;
					$timeout(function(){
						document.getElementById("pause").click();
					},1000);	
				}
			} 
			else {
				getEmptySession();
			}

		};
		
		this.getCurrentSession = function() {
			if(sessionBean === null) {
			sessionBean = findOldSession();
			return sessionBean;
			}			
			else{
				saveSessionToLocalStorage(sessionBean);
			}
			return sessionBean; 
		};
		  
		function saveSessionToLocalStorage(object) {
			if(sessionBeanIsDefined()) {
			localStorage.setItem("sessionBean", JSON.stringify(object));	
			}

			
		}

		this.setFocusDelay = function(time, id) {
			setTimeout(function(){
				document.getElementById(id).focus();
			},time);
		};

		this.setBlurDelay = function(time, id) {
			setTimeout(function(){
				document.getElementById(id).blur();
			},time);
		};
		
		
		this.getTagById = function(TagId) {
			var item;
			angular.forEach($scope.tags, function(value, key) {
				if(value.TagId == TagId) {
					item = value.name;
				}
			});

			return item;
		};
		
		this.addTag = function(tagID) {
			var name = this.getTagById(tagID);
			if(sessionBean.notes.length === 0) {
				sessionBean.notes = sessionBean.notes + name.toUpperCase();
			}
			else {
				sessionBean.notes = sessionBean.notes + '\n' + name.toUpperCase();	
			}
			sessionBean.notes = sessionBean.notes +'\n';
			this.setFocusDelay(0, 'notes');
		};

		//setters currently not in use
		this.setId = function(id) {sessionBean.id = id;};
		this.setStart = function(start) {sessionBean.start = start;};
		this.setEnd = function(end) {sessionBean.end = end;};
		//setters currently not in use
		
		this.setDuration = function(duration) {
			var dur = duration * 60;
			sessionBean.duration = dur;
			convertingTimeToNiceName(dur);
		};
		
		this.setNotes = function(notes) {
			console.log("notes " + notes);
			sessionBean.notes = notes;
		};
		
		this.getMinutes = function() {
			return SessionService.getMinutes();
		};
		var setRunning = function(bool) {
			sessionBean.running = bool;
			$scope.running = bool;
		};
		var setGeneratedXml = function(bool) {
			sessionBean.generatedXml = bool;
			$scope.generatedXml = bool;
		};
		var setDone = function(bool) {
			sessionBean.done = bool;
			$scope.done = bool;
		};


		this.startSession = function() {  
			
			this.start = function() {
			if($scope.running && !$scope.done){
				this.setFocusDelay(1000, 'notes');
				//update				
				return;
			}
			
			if(sessionBean.duration === 0) {
				//default duration
				this.setDuration(5);
			}
			
			sessionBean.id = 1;
			sessionBean.start = new Date().toString();
			setRunning(true);
			setDone(false);
			setGeneratedXml(false);
			console.log(sessionBean);
			startTimer();
			this.setFocusDelay(1000, 'notes');	
			};
			
			this.cancelStartSession = function() {
				if($scope.running) {
					this.setFocusDelay(1000, 'notes');
					return;	
				} 
				sessionBean = getEmptySession();
			};
		};

		this.pauseKey = function(event, modalBool) {
		
			event.stopPropagation();
			event.preventDefault();
			if($scope.running === undefined || (!$scope.running && !modalBool)) {
				return;
			}
			
			var pausePressed = false;
			var enterPressed = false;
			if(event.which === 19) {
				pausePressed = true;
			}
			if(event.which === 27) {
				enterPressed = true;	
			}
			
			if(pausePressed || enterPressed) {
				
				if(modalBool) {
					this.resumeSession();
				$('#pauseModal').modal('hide');					
				}
				else if(pausePressed) {
					this.pauseSession();
					$('#pauseModal').modal('show');
				} else {
					console.log("enter pressed");
				}

			}
		}; 

		this.pauseSession = function() {
			setRunning(false); 
			$scope.pause = true;
			stopTimer();
		};

		this.resumeSession = function(event) {
			setRunning(true);
			$scope.pause = false;
			startTimer();
			this.setFocusDelay(1000, 'notes');
		};

		this.clearSession = function() {
			this.clear = function() {
				stopTimer();
				localStorage.clear();
				getEmptySession();
				setRunning(false);
				convertingTimeToNiceName(0);
				return true;
			};

			this.cancelClearSession = function() {
				this.setFocusDelay(1000, 'notes');
				return false;
			};
			
		};

		this.shortenDuration = function() {
			if(sessionBean.duration > 60) {
			sessionBean.duration = sessionBean.duration - 60;
			convertingTimeToNiceName(sessionBean.duration);
			}
			this.setFocusDelay(1000, 'notes');
		};
		this.extendDuration = function() {
			if((sessionBean.duration / 60) < 119) {
			sessionBean.duration = sessionBean.duration + 60; 
			convertingTimeToNiceName(sessionBean.duration);
			}
			this.setFocusDelay(1000, 'notes');
		};

		var getNextRandomPrime = function() {
			var random = Math.floor((Math.random() * $scope.primes.length));
				return $scope.primes[random];	
		};		
		
		
		this.primeMe = function() {
			var self = this;
			$timeout.cancel(promise);
			$scope.currentPrime = getNextRandomPrime();
			$('.primeOutput').show();
			
			promise = $timeout(function(){
				$('.primeOutput').fadeOut('slow');
				done();
			},3000);

			var done = function() {
			self.setFocusDelay(100, 'notes');
			$timeout.cancel(promise);	
			};
		};

		this.getProgressDuration = function() {
			 var progress = (sessionBean.duration / 60) / 1.2;
			 return progress;
		};

		this.getProgressStyle = function() {
			if($scope.running === true) {
				return 'progress-bar-success active';
			} else {
				return 'progress-bar-warning disabled';
			}
		};
		this.getSelectTagStyle = function() {
			if($scope.running === false || $scope.running === undefined) {
				return 'tag_disabled';
			}
		};
		this.getStartBtnStyle = function() {
			var style = "";
			if($scope.pause === false) {
				style = 'btn-success ';
			} else {
				style = 'btn-warning';
			} 
			return style;
		};
	
		$interval(function() {
				if(!$scope.running && !$scope.pause && $scope.animations.on) {
				self.toggleAnimation('btnStart','animated pulse');
				} 
			}, 2000);

		//var self = this;
		$interval(function() {
				if($scope.running && !$scope.pause && $scope.animations.on) {
				self.toggleAnimation('btnPrimeMe','animated rubberBand');
				} 
			}, 20000);


		this.toggleAnimation = function(className,animationClass, delay) {
			if(!$scope.animations.on) {return;}
			$timeout(function() {	

				$('.'+className).addClass(animationClass);
				$timeout(function() {
				$('.'+className).removeClass(animationClass);	
				},1000);

			},delay);					
		};

		this.getStartBtnName = function() {
			if($scope.running) {return 'EDIT';}			
			if(!$scope.running && !$scope.pause) {return 'START';}
			if($scope.pause && !$scope.running) {return 'PAUSED';}
		};
		this.getStartModalName = function() {
			if($scope.running) {return 'EDIT';}			
			if(!$scope.running) {return 'START NEW SESSION';}
		};
		this.getDefaultNotes = function() {
			return "Press the green start button below to start a new session";
		};

		function getEmptySession() {
			sessionBean = SessionService.getNewSession();	
			convertingTimeToNiceName(0);
			saveSessionToLocalStorage(sessionBean);
			console.log('new and empty session = ', sessionBean);
			return sessionBean;		
		}
		
		//Function to save TextArea to .txt file
		function saveToFile() {
			//Puts the value of localStorage in a variable
			var textToWrite = localStorage.getItem("sessionBean");
			//Formats localStorage to text
			var json = textToWrite;
			//Creates the file and opens save file dialog
			var textFileAsBlob = new Blob([json], {type:"application/octet-stream"});
			//Gives the .txt file a name (the Mission name)
			var fileNameToSaveAs = document.getElementById("missionId").value;
			//Makes a downloadable link to click
			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs + ".json";
			//Check if fileName is empty, then return.
			if(fileNameToSaveAs == "") {
				alert("No values to save");
				return;
			}
			//The hidden name for the link
			downloadLink.innerHTML = "My Hidden Link";
			//Allows the code to work in Gecko based browsers
			window.URL = window.URL || window.webkitURL;
			//Creates the link object
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			//Remove it from the DOM allowing multiple saves
			downloadLink.onclick = destroyClickedElement;
			//Hides the link
			downloadLink.style.display = "none";
			//Add link to DOM
			document.body.appendChild(downloadLink);
			//Click the link
			downloadLink.click();

		}

		//Function to remove downloaded link from DOM
		function destroyClickedElement(event) {
		document.body.removeChild(event.target);
		};

		//Function to load json.file to application
		$scope.load = function loadFromFile(modalBool) {
			//External data file handling starts here
 			var control = document.getElementById("uploadBtn");    
    	 	
    	 	control.addEventListener("change", function(event){    
	         	var reader = new FileReader();        
	         	
	         	reader.onload = function(event){        
		            sessionBean = JSON.parse(event.target.result);    	 	
					saveSessionToLocalStorage(sessionBean);

	    	 	};

		    	 reader.onerror = function(event){
		             console.error("File could not be read! Code " + event.target.error.code);
		         };        
		         
		         console.log("Filename: " + control.files[0].name);
		         reader.readAsText(control.files[0]);
		         location.reload();
		               
     		}, false); 
		};

		function sessionBeanIsDefined() {
			if (angular.isDefined(sessionBean)) {return true;}
        	return false;
		}

		function convertingTime(sec) {
			sessionBean.duration = sessionBean.duration - sec;
			if(sessionBean.duration >= 0) {
			convertingTimeToNiceName(sessionBean.duration);
			}
			return sessionBean.duration;
		} 

		function convertingTimeToNiceName(duration) {
			var min = Math.floor(duration / 60);
			var sec = duration - min * 60;

			if(min < 10 ) {
				$scope.minutesNiceName = '0'+parseInt(min); 
			} else {
				$scope.minutesNiceName = parseInt(min); 
			}
			if(sec < 10) {
				$scope.secondsNiceName = '0'+parseInt(sec); 
			} else{
				$scope.secondsNiceName = parseInt(sec); 
			}
		}

		function countDown() {
			if(sessionBean.duration <= 0) {
				sessionBean.duration = 0;
				stopTimer();
			} else {
				convertingTime(1);			
			}
		}

		var stop;
		var startTimer = function() {

			if(!sessionBeanIsDefined()) {return;}

			stop = $interval(function() {
				countDown();
			}, 1000 );
			
		};

		var stopTimer = function() {
			
			if(!sessionBeanIsDefined()) {return;}

			if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
            setRunning(false);
        	} 

        	else {
        		startTimer();
        		stopTimer();
        		return;
        	}
        	
        	if(sessionBean.duration === 0 ) {
        		sessionBean.end = new Date().toString();
        		setDone(true);
        		
        		self.toggleAnimation('progress','animated shake');
        		self.toggleAnimation('icon','animated wobble');
        		
        		if($scope.generatedXml === false) {
        			console.log("generatedXml is true");
        			saveToFile();
        			
        		//Simulated click deactivated
        		//document.getElementById("saveAndDownload").click();
        		// TODO --- setGeneratedXml is set to true but don't do anything yet... 
        		setGeneratedXml(true);
        		}	
  	        }
		};

	}); //end controller

	})(); //end