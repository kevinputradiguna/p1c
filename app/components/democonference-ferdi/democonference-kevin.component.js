function DemoConferenceControllerK($scope, Rest, $q, $sce, $route, $location, $compile, CONFIG, detailServices, locationService, NgTableParams, $anchorScroll){

var ctrl = this;
var slides = $scope.slides = [];
var session;
var publisher;
var publisherSwitch;
var publisherMember;
var subscriber;

$scope.slickConfig2 = {
    autoplay: false,
    infinite: true,
    autoplaySpeed: 1000,
    slidesToShow: 10,
    slidesToScroll: 10,
    method: {},
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};

ctrl.$onInit = function(){
    sessionId = localStorage.getItem('sessionId');
    token = localStorage.getItem('token');
    apiKey = localStorage.getItem('apiKey');
    isInstructor = localStorage.getItem('instructor');
    localStorage.setItem('isSwitch', 0);
    if(localStorage.getItem('slides') != undefined || localStorage.getItem('slides') != '' || localStorage.getItem('slides') != null){
        
    }else{
        $scope.slides = JSON.parse(localStorage.getItem('slides'));
    }
    
    $scope.raiseHandInsShow = false;
    if(localStorage.getItem('raiseHandStatus') == 1){
        $scope.raiseHandShow = true;
    }else{
        $scope.raiseHandShow = false;
    }

    if(localStorage.getItem('messageStatus') == 1){
        $scope.messageShow = true;
    }else{
        $scope.messageShow = false;
    }
    $scope.topMessageShow = false;
    $scope.topFolderShow = false;
    $scope.isInsturctorToogle = isInstructor;
    
    ctrl.initialSession();
};

//toogle menu
$scope.topFolder = function(){
    if($scope.topFolderShow){
        $scope.topFolderShow = false;
    }else{
        $scope.topFolderShow = true;
    }
}

$scope.topMessage = function(){
    if($scope.topMessageShow){
        $scope.topMessageShow = false;
    }else{
        $scope.topMessageShow = true;
    }
}

ctrl.initialSession = function(){
    session = OT.initSession(apiKey, sessionId);
    
    session.on({
        connectionCreated : function(event){
            if(event.connection.connectionId != session.connection.connectionId){
                var objEventData = JSON.parse(event.connection.data);
                $scope.slickConfig2Loaded = false;
                $scope.$watch('slides',() =>{
                    $scope.slickConfig2Loaded = true;
                    slides.push({
                        connectionId:event.connection.connectionId,
                        image:'assets/img/icon/profile-default.png',
                        text:objEventData.name,
                        userId: objEventData.userId
                    });
                    localStorage.setItem('slides',JSON.stringify(slides));
                });
                $scope.$apply();
            }
        },

        connectionDestroyed: function(event){
            var eventObject = JSON.parse(event.connection.data);
            $scope.slickConfig2Loaded = false;
            var localStorageVar = JSON.parse(localStorage.getItem('slides'));
            var index = 0;
            angular.forEach(localStorageVar, function(slide){
                if(slide.userId == eventObject.userId){
                    $scope.$watch('slides',()=>{
                        $scope.slickConfig2Loaded = true;
                        localStorageVar.splice(index,1);
                        slides.splice(index,1);
                        localStorage.setItem('slides',JSON.stringify(localStorageVar));
                    });
                    $scope.$apply();
                }
                index++;
            });
            console.log('connection destroyed');
        },

        sessionDisconnected: function(event){

        },

        streamCreated: function(event){
            if(isInstructor == 0 && localStorage.getItem('isSwitch') == 0){
                subscriber = session.subscribe(event.stream,'subscriber',{
                    resolution:'320x240',
                    frameRate: 30,
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%',
                    disabledAudioProcessing: false
                },handleError);
                subscriber.setAudioVolume(100);
            }else if(isInstructor == 1 && localStorage.getItem('isSwitch') == 1){
                subscriber = session.subscribe(event.stream,'subscriber',{
                    resolution:'320x240',
                    frameRate: 30,
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%',
                    disabledAudioProcessing: false
                },handleError);
                subscriber.setAudioVolume(100);
            }else if(isInstructor == 0 && localStorage.getItem('isSwitch') == 1){
                subscriber = session.subscribe(event.stream,'subscriber',{
                    resolution:'320x240',
                    frameRate: 30,
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%',
                    disabledAudioProcessing: false
                },handleError);
                subscriber.setAudioVolume(100);
            }
            console.log('stream created');
        },

        streamDestroyed: function(event){
            event.preventDefault();
            console.log('stream destroyed');
        }

        
    });
    session.connect(token, function(error){
        if(error){
            handleError(error);
        }else{
            if(isInstructor == 1){
                publisher = OT.initPublisher('publisher',{
                    resolution:'1280x720',
                    frameRate: 30,
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%',
                    disabledAudioProcessing: true,
                    audioBitrate: 64000,
                    enableStereo: true,
                }, handleError);
                
                session.publish(publisher);
                $scope.raiseHandInsShow = true;
                $scope.messageShow = true;
            }
        }
    });

    session.on('signal:raiseHandOpen', function(event){
        if(event.from.connectionId != session.connection.connectionId && event.data == 'open'){
            localStorage.setItem('instructorConnection', event.from.connectionId);
            localStorage.setItem('raiseHandStatus', 1);
            localStorage.setItem('messageStatus', 1);
            $scope.raiseHandShow = true;
            $scope.messageShow = true;
            $scope.$apply();
        }else if(event.from.connectionId != session.connection.connectionId && event.data == 'closed'){
            localStorage.setItem('instructorConnection', event.from.connectionId);
            localStorage.setItem('raiseHandStatus', 0);
            localStorage.setItem('messageStatus', 0);
            $scope.messageShow = false;
            $scope.raiseHandShow = false;
            $scope.$apply();
        }else if(event.from.connectionId == session.connection.connectionId && event.data == 'open'){
            document.getElementById('insRaiseHand').setAttribute('src','assets/img/icon/raisehand-conference-demo-active.png');
        }else if(event.from.connectionId == session.connection.connectionId && event.data == 'closed'){
            document.getElementById('insRaiseHand').setAttribute('src','assets/img/icon/raisehand-conference-demo.png');
        }
    });

    session.on('signal:raiseHand', function(event){
        document.getElementById(event.from.connectionId).setAttribute('src','assets/img/icon/raisehand-conference-demo.png');
    });

    session.on('signal:changeMonitor', function(event){
        if(event.data.flag == 1){
            localStorage.setItem('isSwitch', 1);
            if(event.from.connectionId == session.connection.connectionId && event.data.memberConn != session.connection.connectionId){
                publisherSwitch = OT.initPublisher('publisherSwitch',{
                    resolution: '320x240',
                    frameRate: 7,
                    insertMode: 'replace',
                    width: '25%',
                    height: '25%',
                    disabledAudioProcessing: false
                }, handleError);
                session.publish(publisherSwitch);
                session.unpublish(publisher);
                var videoContainer = document.getElementById('videos');
                var newPublisher = document.createElement('div');
                newPublisher.setAttribute('id','publisher');
                videoContainer.appendChild(newPublisher);
                document.getElementById(event.data.memberConn).setAttribute('src','assets/img/icon/raisehand-conference-demo-active.png');
            }else if(session.connection.connectionId == event.data.memberConn){
                publisherMember = OT.initPublisher('publisherSwitch',{
                    resolution: '320x240',
                    frameRate: 7,
                    insertMode: 'replace',
                    width: '25%',
                    height: '25%',
                    disabledAudioProcessing: false
                }, handleError);
                session.publish(publisherMember);
                document.getElementById('publisher').style.zIndex = -10;
                document.getElementById(event.data.memberConn).setAttribute('src','assets/img/icon/raisehand-conference-demo-active.png');
            }else{
                document.getElementById(event.data.memberConn).setAttribute('src','assets/img/icon/raisehand-conference-demo-active.png');
            }
        }else{
            localStorage.setItem('isSwitch', 0);
            if(event.from.connectionId == session.connection.connectionId && event.data.memberConn != session.connection.connectionId){
                session.unpublish(publisherSwitch);
                var videoContainer = document.getElementById('videos');
                var newPublisherSwitch = document.createElement('div');
                newPublisherSwitch.setAttribute('id','publisherSwitch');
                videoContainer.appendChild(newPublisherSwitch);
                session.unsubscribe(subscriber.stream);
                var newSubscriber = document.createElement('div');
                newSubscriber.setAttribute('id','subscriber');
                videoContainer.appendChild(newSubscriber);
                publisher = OT.initPublisher('publisher',{
                    resolution:'320x240',
                    frameRate: 7,
                    insertMode: 'replace',
                    width: '100%',
                    height: '100%',
                    disabledAudioProcessing: false
                }, handleError);
                session.publish(publisher);
                document.getElementById(event.data.memberConn).setAttribute('src','assets/img/icon/profile-default.png');
            }else if(session.connection.connectionId == event.data.memberConn){
                session.unpublish(publisherMember);
                var videoContainer = document.getElementById('videos');
                var newPublisherSwitch = document.createElement('div');
                newPublisherSwitch.setAttribute('id','publisherSwitch')
                videoContainer.appendChild(newPublisherSwitch);
                document.getElementById(event.data.memberConn).setAttribute('src','assets/img/icon/profile-default.png');
            }else{
                document.getElementById(event.data.memberConn).setAttribute('src','assets/img/icon/profile-default.png');
            }
        }
    });
    var chatIndex = 0;
    session.on('signal:msg', function(event){
        var chatPanel = document.getElementById('chat');
        if(event.from.connectionId == session.connection.connectionId){
            var list = document.createElement('li');
            list.setAttribute('class','right clearfix');
            list.setAttribute('id',chatIndex);
            var spanChat = document.createElement('span');
            spanChat.setAttribute('class','chat-img pull-right');
            var imageSpanChat = document.createElement('img');
            imageSpanChat.setAttribute('class','img-circle');
            imageSpanChat.setAttribute('src','assets/img/icon/profile-default.png');
            imageSpanChat.setAttribute('alt','User Avatar');
            imageSpanChat.setAttribute('width','50');
            imageSpanChat.setAttribute('height','50');
            var chatBody = document.createElement('div');
            chatBody.setAttribute('class','chat-body clearfix');
            var chatHeader = document.createElement('div');
            chatHeader.setAttribute('class','header');
            var name = document.createElement('p');
            name.setAttribute('class','pull-right primary-font name-bold');
            name.textContent = event.data.name;
            var chatText = document.createElement('p');
            chatText.textContent= event.data.msg;
            chatHeader.appendChild(name);
            spanChat.appendChild(imageSpanChat);
            chatBody.appendChild(chatHeader);
            chatBody.appendChild(chatText);
            list.appendChild(spanChat);
            list.appendChild(chatBody);
            chatPanel.appendChild(list);
            $compile(chatPanel)($scope);
            
        }else{
            var list = document.createElement('li');
            list.setAttribute('class','left clearfix')
            list.setAttribute('id',chatIndex);
            var spanChat = document.createElement('span');
            spanChat.setAttribute('class','chat-img pull-left');
            var imageSpanChat = document.createElement('img');
            imageSpanChat.setAttribute('class','img-circle');
            imageSpanChat.setAttribute('src','assets/img/icon/profile-default.png');
            imageSpanChat.setAttribute('alt','User Avatar');
            imageSpanChat.setAttribute('width','50');
            imageSpanChat.setAttribute('height','50');
            var chatBody = document.createElement('div');
            chatBody.setAttribute('class','chat-body clearfix');
            var chatHeader = document.createElement('div');
            chatHeader.setAttribute('class','header');
            var name = document.createElement('p');
            name.setAttribute('class','primary-font name-bold');
            name.textContent = event.data.name;
            var chatText = document.createElement('p');
            chatText.textContent = event.data.msg;
            chatHeader.appendChild(name);
            spanChat.appendChild(imageSpanChat);
            chatBody.appendChild(chatHeader);
            chatBody.appendChild(chatText);
            list.appendChild(spanChat);
            list.appendChild(chatBody);
            chatPanel.appendChild(list);
            $compile(chatPanel)($scope);
        }
        $scope.glued = true;
        $scope.$apply();
    });

        

    };

    window.setInterval(function(){
        subscriber.getStats(function(error,stats){
        if(error){
            console.log(error.message);
        }
        
        var totalAudioPacket = stats.audio.packetsReceived + stats.audio.packetsLost;
        var totalVideoPacket = stats.video.packetsReceived + stats.video.packetsLost;
        var audioPacketLost = stats.audio.packetsLost / totalAudioPacket;
        var videoPacketLost = stats.video.packetsLost / totalVideoPacket;

        if(videoPacketLost < 0.005 && stats.video.bytesReceived > 1000000 ){
            subscriber.setPreferredResolution({width: 1280, height: 720});
            subscriber.setPreferredFrameRate(15);
            console.log('resolution 1280x720, frame rate 15');
        }else if(videoPacketLost < 0.005 && stats.video.bytesReceived > 600000){
            subscriber.setPreferredResolution({width: 640, height: 480});
            subscriber.setPreferredFrameRate(15);
            console.log('resolution 640x480, frame rate 15');
        }else if(videoPacketLost < 0.005 && stats.video.bytesReceived > 300000){
            subscriber.setPreferredResolution({width: 320, height: 240});
            subscriber.setPreferredFrameRate(15);
            console.log('resolution 320x240, frame rate 15');
        }else if(videoPacketLost < 0.03 && stats.video.bytesReceived > 350000){
            subscriber.setPreferredResolution({width: 1280, height: 720});
            subscriber.setPreferredFrameRate(7);
            console.log('resolution 1280x720, frame rate 7');
        }else if(videoPacketLost < 0.03 && stats.video.bytesReceived > 250000){
            subscriber.setPreferredResolution({width: 640, height: 480});
            subscriber.setPreferredFrameRate(7);
            console.log('resolution 640x480, frame rate 7');
        }else{
            subscriber.setPreferredResolution({width: 320, height: 240});
            subscriber.setPreferredFrameRate(7);
            console.log('resolution 320x240, frame rate 7');
        }
        
        });
    }, 10000);

    $scope.disconnect = function(){
        session.disconnect();
    }
    
    $scope.submitChat = function(event){
        var message = $scope.msg;
        session.signal({
            type:'msg',
            data: {
                msg: message,
                name: localStorage.getItem('name')
            }
        }, function(error){
            if(error){
                console.log('error sending signal message');
            }else{
                var inputText = document.getElementById('btn-input');
                inputText.value = "";
                $scope.msg = "";
            }
        });
    }

    $scope.raiseHand = function(){
        session.signal({
            type:'raiseHand'
        }, function(error){
            if(error){
                console.log('Error sending signal raise hand');
            }
        });
    }

    var flag = 1;
    $scope.chooseMember = function ($event, index) {
        if(isInstructor == 1){
            session.signal({
            type:'changeMonitor',
            data: {
                    memberConn : index,
                    flag : flag
                }
            }, function(error){
                if(error){
                    console.log('Error sending signal raise hand');
                }
            });
            if(flag == 1){
                flag = 0;
            }else{
                flag = 1;
            }
        }else{
            console.log('user cannot do this');
        }
    }

    var raiseHandInsFlag = 1;
    $scope.raiseHandIns = function(){
        var dataMessage;
        if(raiseHandInsFlag ==1){
            dataMessage = 'open';
            raiseHandInsFlag = 0;
        }else{
            dataMessage = 'closed';
            raiseHandInsFlag = 1;
        }
        session.signal({
            type:'raiseHandOpen',
            data: dataMessage
        }, function(error){
            if(error){
                console.log('Error sending signal raise hand session');
            }
        });
    }

    function handleError(error) {
        if (error) {
            alert(error.message);
        }
    }
}

app.component('democonferencek', {
    templateUrl:'app/components/democonference-ferdi/democonference-ferdi.html',
    controller: DemoConferenceControllerK
});