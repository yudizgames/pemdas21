var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "ngStorage",
    "ngCookies"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
    });
}]);
 

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
}]);

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', '$localStorage', '$http', function($scope, $rootScope, $localStorage, $http) {

    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
    $scope.logout = function() {
        try {
            var authtoken = $localStorage.fantasyData.bearer;
        } catch (e) {
            var authtoken = 'undefined';
        }
        $http({
            method: "POST",
            url: "/api/logout",
            headers: {
                'Authorization': 'JWT ' + authtoken
            }
        }).then(function successCallback(response) {

            if (response.data.status === 200) {
                $localStorage.$reset({
                    fantasyData: {}
                });
                window.location.href = '/login#/login.html';
            } else {
                Metronic.alert({
                    type: 'danger',
                    icon: 'warning',
                    message: response.data.message,
                    container: 'body',
                    place: 'prepend'
                });
            }

        }, function errorCallback(response) {
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Something went wrong',
                container: 'body',
                place: 'prepend'
            });
        });
    };

    try {
        var authtoken = $localStorage.fantasyData.bearer;
    } catch (e) {
        var authtoken = 'undefined';
    }

    $scope.siteSettings = function() {
         
        $http({
            method: "GET",
            url: "/api/settings",
            headers: {
                'Authorization': 'JWT ' + authtoken
            }           

        }).then(function successCallback(response) {                
                    if (response.status === 200) {
                        var siteset = {};
                        $.each( response.data.settings, function( key, value ) {
                          siteset[value.vConstant] = value.vValue;                          
                        });
                        $scope.siteset = siteset;                        
                    }
                
            });
    }
    $scope.siteSettings();

}]);

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('PageHeadController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

MetronicApp.controller('formLoginController', ['$scope', '$http', '$localStorage', '$cookies', function($scope, $http, $localStorage, $cookies) {

    $scope.vEmail = $cookies.get('fantasy_email');
    $scope.vPassword = $cookies.get('fantasy_password');
    $scope.eRemember = $cookies.get('fantasy_remember');

    $scope.loginSubmit = function() {
        $http({
            method: "POST",
            url: "/api/authenticate",
            data: {
                vEmail: $scope.vEmail,
                vPassword: $scope.vPassword
            }
        }).then(function successCallback(response) {

            if (response.data.status === 200) {
                $localStorage.fantasyData = {
                    'bearer': response.data.token
                };

                if ($scope.eRememeber) {
                    $cookies.put('fantasy_email', $scope.vEmail);
                    $cookies.put('fantasy_password', $scope.vPassword);
                    $cookies.put('fantasy_remember', 1);
                } else {
                    $cookies.remove('fantasy_email');
                    $cookies.remove('fantasy_password');
                    $cookies.remove('fantasy_remember');
                }
                window.location.href = '/admin#/dashboard.html';
            } else {
                Metronic.alert({
                    type: 'danger',
                    icon: 'warning',
                    message: response.data.message,
                    container: 'body',
                    place: 'prepend'
                });
            }

        }, function errorCallback(response) {
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Something went wrong',
                container: 'body',
                place: 'prepend'
            });
        });
    };
}]);

MetronicApp.controller('UserController', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage) {
    $scope.fantasyData = $localStorage.fantasyData;
    try {
        var authtoken = $localStorage.fantasyData.bearer;
    } catch (e) {
        var authtoken = 'undefined';
    }
    $scope.bulkAction = function($event) {
        var action = $(".table-group-action-input", grid.getTableWrapper());

        if (action.val() != "" && grid.getSelectedRowsCount() > 0) {
            $http({
                method: "POST",
                url: "/api/users/status",
                headers: {
                    'Authorization': 'JWT ' + authtoken
                },
                data: {
                    'value': action.val(),
                    'id': grid.getSelectedRows()
                }
            }).then(function successCallback(response) {
                if (response.status == 200) {
                    Metronic.alert({
                        type: 'success',
                        icon: 'check',
                        message: 'Record has been updated successfully',
                        container: grid.getTableWrapper(),
                        place: 'prepend'
                    });
                    grid.getDataTable().ajax.reload();
                }

            }, function errorCallback(response) {
                Metronic.alert({
                    type: 'danger',
                    icon: 'warning',
                    message: 'Something went wrong',
                    container: grid.getTableWrapper(),
                    place: 'prepend'
                });
            });
        } else if (action.val() == "") {
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Please select an action',
                container: grid.getTableWrapper(),
                place: 'prepend'
            });
        } else if (grid.getSelectedRowsCount() === 0) {
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'No record selected',
                container: grid.getTableWrapper(),
                place: 'prepend'
            });
        }
    };
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {


    var redirectDash = function($q, $timeout, $http, $location, $rootScope, $localStorage, $state) {
        // Initialize a new promise
        var deferred = $q.defer();

        try {
            var authtoken = $localStorage.fantasyData.bearer;
        } catch (e) {
            var authtoken = 'undefined';
        }

        $rootScope.loggedin = false;
        if (authtoken != 'undefined' && $location.$$path != null) {

            $http({
                method: "POST",
                url: "/api/checklogin",
                headers: {
                    'Authorization': 'JWT ' + authtoken
                }
            }).then(function successCallback(response) {

                try {
                    if (response.data.message == 'Authorized') {
                        $rootScope.loggedin = true;
                        deferred.reject();
                        window.location.href = '/admin#dashboard.html';
                    }
                    else
                    {
                        $rootScope.loggedin = false;
                        deferred.resolve();
                    }                    
                } catch (e) {
                    $rootScope.loggedin = false;
                    deferred.resolve();
                }

            }, function errorCallback(response) {
                $rootScope.loggedin = false;
                deferred.resolve();
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, $localStorage) {
        // Initialize a new promise
        var deferred = $q.defer();
        try {
            var authtoken = $localStorage.fantasyData.bearer;
        } catch (e) {
            var authtoken = 'undefined';
        }
        $rootScope.loggedin = false;
        if (authtoken != 'undefined' && $location.$$path != null) {
            $http({
                method: "POST",
                url: "/api/checklogin",
                headers: {
                    'Authorization': 'JWT ' + authtoken
                }
            }).then(function successCallback(response) {

                try {
                    if (response.data.message == 'Authorized') {
                        $rootScope.loggedin = true;
                        deferred.resolve();
                    }
                    else
                    {
                        $rootScope.loggedin = false;
                        deferred.reject();
                        window.location.href = '/login#login.html';
                    }
                } catch (e) {
                    $rootScope.loggedin = false;
                    deferred.reject();
                    window.location.href = '/login#login.html';
                }


            });
        } else {
            deferred.reject();
            window.location.href = '/login#/login.html';
        }

        return deferred.promise;
    };


    $httpProvider.interceptors.push(function($q, $location) {
        return {
            response: function(response) {
                // do something on success
                return response;
            },
            responseError: function(response) {

                if (response.status === 401 && response.data == 'Unauthorized') {
                    window.location.href = '/login#/login.html';
                    return false;
                }
                return $q.reject(response);
            }
        };
    });

    $stateProvider
        .state('login', {
            url: "/login.html",
            templateUrl: "../templates/admin/login.html",
            data: {
                pageTitle: 'Admin Login',
                pageSubTitle: 'Login to access admin panel'
            },
            controller: 'formLoginController',
            resolve: {
                loggedin: redirectDash,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before
                        files: [
                            '../assets/admin/global/plugins/select2/select2.css',
                            '../assets/admin/pages/css/login3.css'
                        ]
                    });
                }]
            }
        })
        .state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "../templates/admin/dashboard.html",
            data: {
                pageTitle: 'Dashboard',
                pageSubTitle: 'statistics & reports'
            },
            controller: "DashboardController",
            resolve: {
                checkLog: checkLoggedin,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before
                        files: [
                            '../assets/admin/global/plugins/amcharts/amcharts/amcharts.js',
                            '../assets/admin/pages/scripts/charts-amcharts.js',
                            '../assets/admin/js/controllers/DashboardController.js'
                        ]
                    });
                }]
            }
        })
        .state('site_settings', {
            url: "/site_settings.html",
            templateUrl: "../templates/admin/site_settings.html",
            data: {
                pageTitle: 'Site Settings',
                pageSubTitle: 'Getneral settings'
            },
            controller: "siteSettingController",
            resolve: {
                checkLog: checkLoggedin,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before
                        files: [
                            '../assets/admin/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css'

                        ]
                    }, {
                        name: 'MetronicApp',
                        files: [
                            '../assets/admin/js/controllers/siteSettingController.js',
                            '../assets/admin/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js'
                        ]
                    }]);
                }]
            }
        })
        .state('change_password', {
            url: "/change_password.html",
            templateUrl: "../templates/admin/change_password.html",
            data: {
                pageTitle: 'Change Password',
                pageSubTitle: 'Reset your password'
            },
            controller: "changePwdController",
            resolve: {
                checkLog: checkLoggedin,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            '../assets/admin/js/controllers/changePwdController.js'
                        ]
                    }]);
                }]
            }
        })
        .state('users', {
            url: "/users.html",
            templateUrl: "../templates/admin/list_users.html",
            data: {
                pageTitle: 'Manage Users',
                pageSubTitle: 'User listings and statistics'
            },
            controller: "GeneralPageController",
            resolve: {
                checkLog: checkLoggedin,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/admin/global/plugins/select2/select2.css',
                            '../assets/admin/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            '../assets/admin/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '../assets/admin/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            '../assets/admin/global/plugins/select2/select2.min.js',
                            '../assets/admin/global/plugins/datatables/all.min.js',
                            '../assets/admin/global/scripts/datatable.js',
                            '../assets/admin/js/scripts/table-ajax.js',
                            '../assets/admin/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })
        .state('profile', {
            url: "/profile/:iUserId",
            templateUrl: "../templates/admin/profile/main.html",
            abstract: true,
            data: {
                pageTitle: 'User Information',
                pageSubTitle: 'User details'
            },
            controller: "UserProfileController",
            resolve: {
                checkLog: checkLoggedin,
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/admin/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '../assets/admin/pages/css/profile.css',
                            '../assets/admin/pages/css/tasks.css',
                            
                            '../assets/admin/global/plugins/jquery.sparkline.min.js',
                            '../assets/admin/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            '../assets/admin/pages/scripts/profile.js',

                            '../assets/admin/js/controllers/UserProfileController.js'
                        ]                    
                    });
                }]                
            }
        })
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "../templates/admin/profile/dashboard.html",
            data: {pageTitle: 'User Profile', pageSubTitle: 'user profile dashboard sample'}
        })
        .state("profile.account", {
            url: "/account",
            templateUrl: "../templates/admin/profile/account.html",
            data: {pageTitle: 'User Account', pageSubTitle: 'user profile account sample'}
        });

    $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.path(),
            normalized = path.toLowerCase();

        if (path !== normalized) {
            return normalized;
        }
    });

    $urlRouterProvider.otherwise(function($injector, $location) {
        var filter = $injector.get('$filter');
        var state = $injector.get('$state');
        if (filter('_uriseg')(1) == 'login') {
            state.go('login');
        } else {
            state.go('dashboard');

        }
    });
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", "$filter", "$location", function($rootScope, settings, $state, $filter, $location) {
    $rootScope.$state = $state; // state to be accessed from view
}]);

MetronicApp.filter('_uriseg', function($location) {
    return function(segment) {
        var path = window.location.pathname;
        var data = path.split("/");

        if (data[segment]) {
            return data[segment];
        }
        return false;
    }
});

function ObjecttoParams(obj) {
    var p = [];
    for (var key in obj) {
        p.push(key + '=' + encodeURIComponent(obj[key]));
    }
    return p.join('&');
};