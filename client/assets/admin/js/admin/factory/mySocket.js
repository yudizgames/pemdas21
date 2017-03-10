angular.module('main').factory('mySocket', function (socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://158.69.227.67:4000')
        // ioSocket: io.connect('http://192.168.10.147:4000')
    });
});