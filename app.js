var app = angular.module('bluebox',['ngRoute','ngTable', 'slickCarousel',
 'angularjs-datetime-picker', 'ngSanitize','ui.bootstrap', 'luegg.directives']);

app.service('detailServices', function(){
    var historyDetails = "";
    var evaluationDetails = "";
    
    this.setHistoryDetail = function(historyDetail){
        historyDetails = historyDetail;
    };

    this.setEvaluationDetail = function(evaluationDetail){
        evaluationDetails = evaluationDetail;
    };
    this.getHistoryDetail = function(){
        return historyDetails;
    };

    this.getEvaluationDetail = function(){
        return evaluationDetails;
    };
});

app.service('locationService',function(){
    var subLocation = "";

    this.setSubLocation = function(location){
        subLocation = location;
    };

    this.getSubLocation = function(){
        return subLocation;
    }
});

app.filter('type', function() {
    return function(obj) {
        return typeof obj;
    }});