angular.module('main').factory('mySocket', function (socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://192.168.10.165:4000')
    });
});