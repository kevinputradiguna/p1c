function DemoConferenceControllerV2($scope, Rest, $q, $sce, $route, $location, $compile, CONFIG, detailServices, locationService, NgTableParams){
    var ctrl = this;
    var publisher;
    var subscriber;
    var sessionId;
    var token;
    var apiKey;
    var isInstructor;
    var slides = $scope.slides = [];
    var text = [];
    var connectionId = [];
    var tokenEachMember = [];
    var currIndex = 0;
    var streamArray = [];
    var streamJson = {};
    var subscriberContainer;
    $scope.myInterval = 5000;
    
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
        $scope.raiseHandInsShow = false;
        $scope.raiseHandShow = false;
        $scope.topMessageShow = false;
        $scope.topFolderShow = false;
        $scope.isInsturctorToogle = isInstructor;

        ctrl.initialSession();
    };

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
            if(isInstructor == 0 && localStorage.getItem('isSwitch') == 0){
                session.on('streamCreated', function(event){
                    streamJson['streamId'] = event.stream.streamId;
                    streamJson['stream'] = event.stream;
                    streamJson['connectionId'] = event.stream.connection.id;
                    streamArray.push(streamJson);
                    subscriber = session.subscribe(event.stream, 'subscriber',{
                        resolution:'640x480',
                        frameRate: 7,
                        insertMode: 'replace',
                        width: '100%',
                        'max-width': '100%',
                        height: 'auto',
                        'obj-fit': 'fill',
                        disabledAudioProcessing: false
                    },handleError);
                    console.log(subscriber);
                });
                $scope.disabledMember = true;
                console.log(subscriber);
            }else if(localStorage.getItem('isSwitch') == 0 & isInstructor == 1){
                publisher = OT.initPublisher('publisher',{
                    resolution:'640x480',
                    frameRate: 7,
                    insertMode: 'replace',
                    width: '100%',
                    'max-width': '100%',
                    height: 'auto',
                    'obj-fit': 'fill',
                    disabledAudioProcessing: false
                }, handleError);
                $scope.raiseHandInsShow = true;
                $scope.disabledMember = false;
            }
            console.log(subscriber);
        session.connect(token, function(error) {
            if (error) {
                handleError(error);
            } else {
                if(isInstructor == 1){
                    session.publish(publisher);
                }
            }
        });

        session.on({
            connectionCreated : function(event){
                if (event.connection.connectionId != session.connection.connectionId) {
                    $scope.slickConfig2Loaded = false;
                    $scope.$watch('slides', () => {
                        $scope.slickConfig2Loaded = true;
                        slides.push({
                            connectionId: event.connection.connectionId,
                            image: 'assets/img/icon/profile-default.png',
                            text: event.connection.data,
                            id: currIndex++
                        });
                    });
                    $scope.$apply();
                }
                console.log(subscriber);
            },

            connectionDestroyed : function(event){
                var index;
                $scope.slickConfig2Loaded = false;
                angular.forEach(slides, function (slide) {
                    index = slides.indexOf(event.connection.connectionId);
                    $scope.$watch('slides', ()=>{
                        $scope.slickConfig2Loaded = true;
                        slides.splice(index, 1);
                    });
                    $scope.$apply();
                });
            }
        });

        console.log(subscriber);
        session.on('signal:raiseHandOpen', function(event){
            if(event.from.connectionId != session.connection.connectionId){
                localStorage.setItem('instructorConnection', event.from.connectionId);
                if(event.data == 'open'){
                    $scope.raiseHandShow = true;
                    $scope.$apply();
                    
                }
            }
        });

        session.on('signal:raiseHand',function(event){
            if(event.from.connectionId != session.connection.connectionId && event.data == true){
                var raisedHandProp = document.getElementById(event.from.connectionId);
                raisedHandProp.setAttribute('src','assets/img/icon/raisehand-conference-demo.png');
            }else if(event.from.connectionId !== session.connection.connectionId && event.data != true){
                var raisedHandProp = document.getElementById(event.from.connectionId);
                raisedHandProp.setAttribute('src','assets/img/icon/profile-default.png');
            }
        });

        console.log(subscriber);
        session.on('signal:changeMonitor', function(event){
            var publisherMember;
            var streaming;
            var insSubs;
            var memberSubs;
            localStorage.setItem('isSwitch', 1);
            
            var publisherSwitch = OT.initPublisher('publisherSwitch', {
                resolution: '640x480',
                frameRate: 7,
                insertMode: 'replace',
                width: '25%',
                height: '25%',
                disabledAudioProcessing: false
            }, handleError);

            var publisherMember = OT.initPublisher('publisherSwitch', {
                resolution: '640x480',
                frameRate: 7,
                insertMode: 'replace',
                width: '25%',
                height: '25%',
                disabledAudioProcessing: false
            }, handleError);

            if(event.data.flag == 1){
                if (event.from.connectionId == session.connection.connectionId && event.data.memberConn != session.connection.connectionId) {
                    $scope.pubShow = false;
                    document.getElementById('publisher').style.zIndex = -10;
                    publisher.publishVideo(false);
                    publisher.publishAudio(false);
                    
                    session.publish(publisherSwitch);
                    session.on('streamCreated', function (event) {
                        insSubs = session.subscribe(event.stream, 'subscriber', {
                            resolution: '640x480',
                            frameRate: 7,
                            insertMode: 'append',
                            disabledAudioProcessing: false
                        }, handleError);
                    });
                } else if(session.connection.connectionId == event.data.memberConn){
                    session.publish(publisherMember);
                    session.on('streamCreated', function (event) {
                        memberSubs = session.subscribe(event.stream, 'subscriber', {
                            resolution: '640x480',
                            frameRate: 7,
                            insertMode: 'replace',
                            disabledAudioProcessing: false
                        }, handleError);
                        console.log(subscriber);
                    });
                }else{
                    session.on('streamCreated', function (event) {
                        session.subscribe(event.stream, 'subscriber', {
                            resolution: '640x480',
                            frameRate: 7,
                            insertMode: 'replace',
                            disabledAudioProcessing: false
                        }, handleError);
                    });
                }

            }else{
                if(event.from.connectionId == session.connection.connectionId && event.data.memberConn != session.connection.connectionId){
                    publisherSwitch.publishVideo(false);
                    publisherSwitch.publishAudio(false);
                    document.getElementById('publisher').style.zIndex = 10;
                    insSubs.subscribeToAudio(false);
                    insSubs.subscribeToVideo(false);
                }else if(session.connection.connectionId == event.data.memberConn){
                    publisherMember.publishVideo(false);
                    publisherMember.publishAudio(false);
                }
            }
        });

        session.on('signal:msg', function(event){
            var chatPanel = document.getElementById('chat');
            if(event.from.connectionId === session.connection.connectionId){
                var list = document.createElement('li');
                list.setAttribute('class','right clearfix');
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
            }else{
                var list = document.createElement('li');
                list.setAttribute('class','left clearfix')
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
            }
        });

        
    };

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
                console.log('Error sending signal chatting');
            }else{
                var inputText = document.getElementById('btn-input');
                inputText.value = "";
                $scope.msg = "";
            }
        });
    }

    $scope.raiseHand = function(){
        session.signal({
            type:'raiseHand',
            data: true
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
    
    $scope.raiseHandIns = function(){
        session.signal({
            type:'raiseHandOpen',
            data:'open'
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
    
app.component('democonferencev2',{
    templateUrl:'app/components/democonference-ferdi/democonference-ferdi.html',
    controller: DemoConferenceControllerV2
});