function SubTopMenu($scope,locationService){
    var ctrl = this;
    ctrl.$onInit = function(){
        $scope.navName = locationService.getSubLocation();
        if($scope.navName == 'History'){
            $scope.isShow = true;
            $scope.isShowBack = false;
        }
        else if($scope.navName == 'History Detail'){
            $scope.navName == 'History';
            $scope.isShow = false;
            $scope.isShowBack = true;
            $scope.linkBack = '#/history';
        }
        else if($scope.navName == 'Create Room'){
            $scope.isShow = false;
            $scope.isShowBack = false;
        }
        else if($scope.navName == 'Join Room'){
            $scope.isShow = false;
            $scope.isShowBack = false;
        }
        else if($scope.navName == 'Evaluation'){
            $scope.isShow = false;
            $scope.isShowBack = false;
        }
        else if($scope.navName == 'Evaluation Detail'){
            $scope.navName == 'Evaluation';
            $scope.isShow = false;
            $scope.isShowBack = true;
            $scope.linkBack = '#/evaluation';
        }
        else if($scope.navName == 'Statistic'){
            $scope.isShow = false;
            $scope.isShowBack = false;
        }  
    };
    
}

app.component('subtopmenu',{
    templateUrl:'app/components/subtopmenu/subtopmenu-ver2.html',
    controller: SubTopMenu,
    bindings: {
            subTopMenuLocation: '='
        }
});