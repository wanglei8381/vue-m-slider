'use strict';

require('./style.css');

var Touch = require('super-touch');
module.exports = {
    template: require('./template.html'),
    data: function data() {
        return {
            idx: 1,
            maxVal: 0,
            width: 0,
            timeoutFlag: null
        };
    },
    props: {
        list: { //显示的数组,数组中对象格式是{src:'图片地址',link:'跳转地址'}
            type: Array,
            required: true
        },
        link: { //link的别名
            type: String,
            required: false,
            default: 'link'
        },
        src: { //src的别名
            type: String,
            required: false,
            default: 'src'
        },
        autoPlayDelay: { //自动播放延迟时间,0不自动播放
            type: Number,
            required: false,
            default: 2000
        },
        slideDuration: { //滑动的时间
            type: Number,
            required: false,
            default: 500
        }
    },
    watch: {
        list: function list(arr) {
            this.maxVal = arr.length;
            this.idx = 1;
            this.reinit();
        }
    },
    computed: {
        data: function data() {
            if (this.list.length > 0) {
                return [].concat(this.list[this.list.length - 1], this.list, this.list[0]);
            }
        }
    },
    methods: {
        translate: function translate(x) {
            this.$slider.style.webkitTransform = 'translate3d(-' + x + 'px,0,0)';
        },
        goto: function goto(idx) {
            //用3d开启硬件加速
            this.$slider.style.webkitTransform = 'translate3d(-' + idx * this.width + 'px,0,0)';
        },
        transition: function transition() {
            var _this = this;

            setTimeout(function () {
                _this.$slider.style.webkitTransition = 'transform ' + _this.slideDuration + 'ms';
            }, 0);
        },
        reinit: function reinit() {
            var _this2 = this;

            this.$nextTick(function () {
                _this2.width = parseInt(getComputedStyle(_this2.$el).getPropertyValue('width'));
                _this2.maxDistinct = (_this2.maxVal + 1) * _this2.width + _this2.width / 2;
                _this2.goto(_this2.idx++);
                _this2.transition();
                _this2.autoPlay();
            });
        },
        autoPlay: function autoPlay() {
            var _this3 = this;

            if (this.autoPlayDelay) {
                this.timeoutFlag = setTimeout(function () {
                    clearTimeout(_this3.timeoutFlag);
                    _this3.goto(_this3.idx++);
                }, this.autoPlayDelay);
            }
        }
    },
    ready: function ready() {
        var _this4 = this;

        this.$slider = this.$el.querySelector('.slider-content');
        this.maxVal = this.list.length;
        this.reinit();

        var self = this;

        function transitionEnd() {
            if (self.idx > self.maxVal + 1) {
                self.idx = 2;
                self.$slider.style.webkitTransition = null;
                self.goto(1);
                setTimeout(function () {
                    self.$slider.style.webkitTransition = 'transform ' + self.slideDuration + 'ms';
                    self.autoPlay();
                }, 0);
            } else {
                self.autoPlay();
            }
        }

        this.$slider.addEventListener('webkitTransitionEnd', transitionEnd);

        this.$on('cancleAutoPlay', function () {
            _this4.$slider.removeEventListener('webkitTransitionEnd', transitionEnd);
            clearTimeout(_this4.timeoutFlag);
            _this4.$slider.style.webkitTransition = null;
        });

        var touch = new Touch(this.$el);
        var x = 0;
        touch.start();

        touch.on('touch:start', function (res) {
            res.e.preventDefault();
            _this4.$emit('cancleAutoPlay');
            x = _this4.idx * _this4.width;
        });

        touch.on('touch:move', function (res) {
            x += res.xrange;
            if (x < _this4.maxDistinct) {
                _this4.translate(x);
            }
        });

        touch.on('touch:end', function (res) {
            _this4.idx = Math.round(x / _this4.width);
            if (_this4.idx > _this4.maxVal + 1) {
                _this4.idx = _this4.maxVal + 1;
            }
            _this4.goto(_this4.idx);
            _this4.$slider.addEventListener('webkitTransitionEnd', transitionEnd);
            _this4.autoPlay();
        });
    }
};