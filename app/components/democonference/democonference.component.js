function DemoConferenceController($scope){
    var ctrl = this;
    ctrl.$onInit = function(){
        var sessionId = localStorage.getItem('sessionId');
        var token = localStorage.getItem('token');
        var apiKey = localStorage.getItem('apiKey');
        var isInstructor = localStorage.getItem('instructor');
    };
        
    ctrl.initialSession = function(){
        session = OT.initSession(apiKey, sessionId);
        if(isInstructor == 1){
            session.on('streamCreated', function(event){
                session.subscribe(event.stream, 'subscriber', {
                insertMode: 'replace',
                resolution:'1280x960',
                frameRate: 15,
                width: '100%',
                height: '100%',
                disableAudioProcessing: false 
                }, handleError);
            });

            var publisher = OT.initPublisher('publisher', {
                resolution:'1280x960',
                frameRate: 15,
                insertMode: 'append',
                width: '100%',
                height: '100%',
                disableAudioProcessing: false
            }, handleError);

            var memberList = document.getElementById('conferenceMemberList');
            session.connect(token, function(error) {
                if (error) {
                    handleError(error);
                } else {
                    var profile = document.createElement('div');
                    var propic = document.createElement('img');
                    propic.setAttribute('alt', localStorage.getItem('memberName'));
                    var propicName = document.createElement('p');
                    propicName.textContent(localStorage.getItem('memberName'));
                    profile.appendChild(propic);
                    var newLine = document.createElement('BR');
                    profile.appendChild(newLine);
                    profile.appendChild(propicName);
                    profile.setAttribute('id', session.connection.connectionId);
                    profile.setAttribute('class', 'memberClass');
                    profile.setAttribute('ng-click', "chooseMember("+session.connection.connectionId+")");
                    memberList.appendChild(profile);
                }
            });

            $scope.chooseMember = function(event){
                

            }

            var msgHistory = document.getElementById('msgHistory');
            session.on('signal:msg', function(event){
                var chatLine = document.createElement('div');
                var profile = document.createElement('div');
                var propic = document.createElement('img');
                propic.setAttribute('alt',localStorage.getItem('memberName'));
                var propicName = document.createElement('p');
                propicName.textContent(localStorage.getItem('memberName'));
                profile.appendChild(propic);
                var newLine = document.createElement('BR');
                profile.appendChild(newLine);
                profile.appendChild(propicName);
                var chat = document.createElement('p');
                chat.textContent(event.data);

                chatLine.appendChild(profile);
                chatLine.appendChild(chat);
                chatLine.ClassName = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
                msgHistory.appendChild(chatLine);
                chatLine.scrollIntoView;
            });

            session.on('signal:raiseHand', function(event){
                if(event.data){
                    var raiseHandMember = document.getElementById(event.from.connectionId);

                }
            });

            $scope.textHistory = function(){
            // show value
            }

            var inputText = document.getElementById('inputText');
            $scope.submitChat = function(event){
                event.preventDefault();
                session.signal({
                    type:'msg',
                    data: inputText.value
                }, function(error){
                    
                });
            }

            $scope.raiseHand = function(){
                
            }
        }else{
            session.on('streamCreated', function(event){
                session.subscribe(event.stream, 'subscriber', {
                insertMode: 'replace',
                resolution:'1280x960',
                frameRate: 15,
                width: '100%',
                height: '100%',
                disableAudioProcessing: false 
                }, handleError);
            });

            session.connect(token, function(error) {
                if (error) {
                    handleError(error);
                } else {
                    var profile = document.createElement('div');
                    var propic = document.createElement('img');
                    propic.setAttribute('alt', localStorage.getItem('memberName'));
                    var propicName = document.createElement('p');
                    propicName.textContent(localStorage.getItem('memberName'));
                    profile.appendChild(propic);
                    var newLine = document.createElement('BR');
                    profile.appendChild(newLine);
                    profile.appendChild(propicName);
                    profile.setAttribute('id', session.connection.connectionId);
                    profile.setAttribute('class', 'memberClass');
                    profile.setAttribute('ng-click', "chooseMember("+session.connection.connectionId+")");
                    memberList.appendChild(profile);
                }
            });

            var msgHistory = document.getElementById('msgHistory');
            session.on('signal:msg', function(event){
                var chatLine = document.createElement('div');
                var profile = document.createElement('div');
                var propic = document.createElement('img');
                propic.setAttribute('alt',localStorage.getItem('memberName'));
                var propicName = document.createElement('p');
                propicName.textContent(localStorage.getItem('memberName'));
                profile.appendChild(propic);
                var newLine = document.createElement('BR');
                profile.appendChild(newLine);
                profile.appendChild(propicName);
                var chat = document.createElement('p');
                chat.textContent(event.data);

                chatLine.appendChild(profile);
                chatLine.appendChild(chat);
                chatLine.ClassName = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
                msgHistory.appendChild(chatLine);
                chatLine.scrollIntoView;
            });

            session.on('signal:raiseHand', function(event){
                if(event.data){
                    var raiseHandMember = document.getElementById(event.from.connectionId);

                }
            });

            $scope.textHistory = function(){
            // show value
            }

            var inputText = document.getElementById('inputText');
            $scope.submitChat = function(event){
                event.preventDefault();
                session.signal({
                    type:'msg',
                    data: inputText.value
                }, function(error){
                    
                });
            }

            $scope.raiseHand = function(){
                
            }
        }
        
    };
}

app.component('democonference',{
    templateUrl:'app/components/democonference/democonference.html',
    controller: DemoConferenceController
});