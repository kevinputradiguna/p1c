function DemoController($scope, Rest, $location){
    
    var ctrl = this;
    ctrl.$onInit = function(){
        localStorage.setItem('apiKey','');
        localStorage.setItem('instructor','');
        localStorage.setItem('instructorConnection','');
        localStorage.setItem('isSwitch','');
        localStorage.setItem('name','');
        localStorage.setItem('opentok_client_id','');
        localStorage.setItem('sessionId','');
        localStorage.setItem('slides','');
        localStorage.setItem('token','');
        localStorage.setItem('messageStatus','');
        localStorage.setItem('raiseHandStatus','');
    }

    $scope.topMenu = 'app/components/template/topmenu-demo.html';
    $scope.join = function(){
        joinObj = {};
        joinObj['roomName'] = $scope.roomName;
        joinObj['name'] = $scope.name;
        Rest.post('/v1/demoJoin', joinObj)
        .success(function(result){
            localStorage.setItem('sessionId', result.data.sessionId);
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('apiKey', result.data.apiKey);
            localStorage.setItem('name', $scope.name);
            localStorage.setItem('instructor', result.data.instructor);
            $location.url('/conference').replace();
        })
        .error(function(error,status){

        });
    }
}

app.component('demo',{
    templateUrl:'app/components/demo/demo.html',
    controller: DemoController
});