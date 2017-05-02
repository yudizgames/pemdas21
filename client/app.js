'use strict';
var pemdas = angular.module('Pemdas',['ui.router',
    // 'datatables',
    'ui.bootstrap',
    'ngAnimate',
    'oc.lazyLoad',
    'LocalForageModule',
    'toastr',
    'ngResource',
    // 'frapontillo.bootstrap-switch',
    // load your modules here
    "admin", // starting with the main module
    "client"
]);
pemdas.config(function($stateProvider,$urlRouterProvider,$locationProvider,$ocLazyLoadProvider,$localForageProvider,toastrConfig,$qProvider){
    console.log("config call");
    /**
     * $qProvider add because in angularjs -v 1.5.9 and ui-router -v 0.2.18 Transmission error when state change
     * i user some whenre $state.go to $state.transitionTo
     */
    $qProvider.errorOnUnhandledRejections(false);
    $ocLazyLoadProvider.config({
        cssFilesInsertBefore:'ng_load_plugins_before'
    });

    $stateProvider.state('login',{
        url:'/',
        templateUrl:'templates/login.html',
        data : { pageTitle: 'Login',bodyClass:'login-page authentication'},
        controller:'LoginCtrl',
        resolve: {
            depends: ['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'main',
                    insertBefore: '#ng_load_plugins_before', // load the above css files before
                    files: [
                        'assets/css/main.css',
                        'assets/css/login.css',
                        'assets/css/themes/all-themes.css',
                        'assets/bundles/libscripts.bundle.js',
                        'assets/bundles/vendorscripts.bundle.js',
                        'assets/bundles/mainscripts.bundle.js',
                        'assets/js/pages/examples/sign-in.js',
                        'loginctrl.js',
                    ]
                });
            }]
        }
    })
    $stateProvider.state('signup',{
        url:'/signup',
        templateUrl:'templates/signup.html',
        data : { pageTitle: 'Login',bodyClass:'login-page authentication'},
        controller:'SignupCtrl',
        resolve: {
            depends: ['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'main',
                    insertBefore: '#ng_load_plugins_before', // load the above css files before
                    files: [
                        'assets/css/main.css',
                        'assets/css/login.css',
                        'assets/css/themes/all-themes.css',
                        'assets/bundles/libscripts.bundle.js',
                        'assets/bundles/vendorscripts.bundle.js',
                        'assets/bundles/mainscripts.bundle.js',
                        'assets/js/pages/examples/sign-in.js',
                        'signupctrl.js',
                    ]
                });
            }]
        }
    })
    $stateProvider.state('fpass',{
        url:'/fpass',
        templateUrl:'templates/fpass.html',
        data : { pageTitle: 'Login',bodyClass:'login-page authentication'},
        controller:'FpassCtrl',
        resolve: {
            depends: ['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name: 'main',
                    insertBefore: '#ng_load_plugins_before', // load the above css files before
                    files: [
                        'assets/css/main.css',
                        'assets/css/login.css',
                        'assets/css/themes/all-themes.css',
                        'assets/bundles/libscripts.bundle.js',
                        'assets/bundles/vendorscripts.bundle.js',
                        'assets/bundles/mainscripts.bundle.js',
                        'assets/js/pages/examples/sign-in.js',
                        'fpassctrl.js',
                    ]
                });
            }]
        }
    });

    $locationProvider.hashPrefix('');

    // To define only one db driver - Logout issue (Because WebSql and Indexdb both store data)
    $localForageProvider.config({
        driver      : localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
        name        : 'Pemdas',
        version     : 1.0,
        size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
    });

    angular.extend(toastrConfig, {
        allowHtml: false,
        closeButton: false,
        closeHtml: '<button>&times;</button>',
        extendedTimeOut: 1000,
        timeOut: 3000,
        toastClass: 'toast',
        titleClass: 'toast-title'
    });
});
pemdas.run(function($state,$rootScope,$http,$localForage){
    console.log("run call");
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$on('$stateChangeStart',function(event,toState,fromState,fromParams,$localtion){
        console.log(toState);
        var currentState = toState.name;
        if(currentState){
            console.log(currentState);
            $localForage.getItem('UserInfo').then(function(data){
                console.log("Local Forage Call");
                if(data != null){
                    console.log(data);
                    if(data.vUserType == 'super_admin' && data.status == 200){
                        console.log('inside super admin');
                        var notAllowed = ['login','admin','client.dashboard'];
                        if(notAllowed.indexOf(currentState) > -1){
                            $state.transitionTo('admin.dashboard');
                        }
                        $http.defaults.headers.common.Authorization = 'JWT '+data.token;
                        $(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
                            jqXHR.setRequestHeader('Authorization',  'JWT '+data.token);
                        });
                    }
                    else if(data.vUserType == 'client' && data.status == 200){
                        console.log('inside client');
                        var notAllowed = ['login','admin','client','admin.dashboard'];
                        $http.defaults.headers.common.Authorization = 'JWT '+data.token;
                        $(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
                            console.log("Ajax Header Set");
                            jqXHR.setRequestHeader('Authorization',  'JWT '+data.token);
                        });
                        if(notAllowed.indexOf(currentState) > -1){
                            $state.transitionTo('client.dashboard');
                        }

                    }
                    else{
                        $state.transitionTo("login");
                    }
                }else{

                    if(currentState == 'signup'){
                        $state.transitionTo('signup');
                    }else if(currentState == 'fpass'){
                        $state.transitionTo('fpass');
                    }else{
                        $state.transitionTo('login');
                    }

                }
            });
        }
    });
    $rootScope.$state = $state;
    console.log("hello");
});
pemdas.controller('GlobalCtrl',function ($scope,$rootScope) {
    console.log("Global Controller call");
    $rootScope.hideLoad = true;
    console.log("asdfasdfasdfasfasdf");
    console.log($scope.hideLoad);
});
pemdas.controller('AppCtrl', function ($scope) {
    console.log("App Controller call");
});


pemdas.directive('ngSpinnerBar', ['$rootScope',
    function ($rootScope) {
        return {
            link: function (scope, element, attrs) {
                // by defult hide the spinner bar
                // element.addClass('hide');

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu

                    // // auto scorll to page top
                    // setTimeout(function() {
                    //     Metronic.scrollTop(); // scroll to the top on content load
                    // }, $rootScope.settings.layout.pageAutoScrollOnLoad);
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });


                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // count how many time requests were sent to the server
                // so when they all done the spinner will be removed
                scope.counterNetwork = 0;
                $rootScope.$on('$stateNetworkRequestStarted', function () {
                    console.log("networdk request start");
                    scope.counterNetwork++;
                    element.removeClass('hide'); // show spinner bar
                    //  $('body').addClass('page-on-load');
                });

                $rootScope.$on('$stateNetworkRequestEnded', function () {
                    console.log("networdk request close");
                    scope.counterNetwork--;
                    if (scope.counterNetwork <= 0) {
                        scope.counterNetwork = 0;
                        element.addClass('hide'); // show spinner bar
                        //  $('body').removeClass('page-on-load'); // remove page loading indicator
                    }
                });

            }
        };
    }
]);
var directiveId = 'ngMatch';

pemdas.directive(directiveId, ['$parse', function($parse) {

    var directive = {
        link: link,
        restrict: 'A',
        require: '?ngModel'
    };
    return directive;

    function link(scope, elem, attrs, ctrl) {
        // if ngModel is not defined, we don't need to do anything
        if (!ctrl) return;
        if (!attrs[directiveId]) return;

        var firstPassword = $parse(attrs[directiveId]);

        var validator = function(value) {
            var temp = firstPassword(scope),
                v = value === temp;
            ctrl.$setValidity('match', v);
            return value;
        }

        ctrl.$parsers.unshift(validator);
        ctrl.$formatters.push(validator);
        attrs.$observe(directiveId, function() {
            validator(ctrl.$viewValue);
        });

    }
}]);
