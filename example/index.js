require('./style.css');
var Vue = require('Vue');
Vue.component('slider', require('../src'));
new Vue({
    el: 'body',
    data: function () {
        return {
            list: [
                {src: 'http://img0.imgtn.bdimg.com/it/u=436662427,3486558713&fm=21&gp=0.jpg', link: ''},
                {src: 'http://img.hb.aicdn.com/29b8c01814fc27e9f449a5878b27a52a1b7cd67829373-dqD2gp_fw658', link: ''},
                {src: 'http://static.panoramio.com/photos/medium/62331386.jpg', link: ''}
            ]
        };
    }
});