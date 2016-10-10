require('./style.css');

let Touch = require('super-touch');
module.exports = {
    template: require('./template.html'),
    data: function () {
        return {
            idx: 1,
            maxVal: 0,
            width: 0,
            timeoutFlag: null
        };
    },
    props: {
        list: {//显示的数组,数组中对象格式是{src:'图片地址',link:'跳转地址'}
            type: Array,
            required: true
        },
        link: {//link的别名
            type: String,
            required: false,
            default: 'link'
        },
        src: {//src的别名
            type: String,
            required: false,
            default: 'src'
        },
        autoPlayDelay: {//自动播放延迟时间,0不自动播放
            type: Number,
            required: false,
            default: 2000
        },
        slideDuration: {//滑动的时间
            type: Number,
            required: false,
            default: 500
        }
    },
    watch: {
        list(arr) {
            this.maxVal = arr.length;
            this.idx = 1;
            this.reinit();
        }
    },
    computed: {
        data() {
            if (this.list.length > 0) {
                return [].concat(this.list[this.list.length - 1], this.list, this.list[0]);
            }
        }
    },
    methods: {
        translate(x) {
            this.$slider.style.webkitTransform = 'translate3d(-' + x + 'px,0,0)';
        },
        goto(idx) {
            //用3d开启硬件加速
            this.$slider.style.webkitTransform = 'translate3d(-' + idx * this.width + 'px,0,0)';
        },
        transition() {
            setTimeout(()=> {
                this.$slider.style.webkitTransition = 'transform ' + this.slideDuration + 'ms';
            }, 0);
        },
        reinit() {
            this.$nextTick(()=> {
                this.width = parseInt(getComputedStyle(this.$el).getPropertyValue('width'));
                this.maxDistinct = (this.maxVal + 1) * this.width + this.width / 2;
                this.goto(this.idx++);
                this.transition();
                this.autoPlay();
            });
        },
        autoPlay() {
            if (this.autoPlayDelay) {
                this.timeoutFlag = setTimeout(()=> {
                    clearTimeout(this.timeoutFlag);
                    this.goto(this.idx++);
                }, this.autoPlayDelay);
            }
        }

    },
    ready(){
        this.$slider = this.$el.querySelector('.slider-content');
        this.maxVal = this.list.length;
        this.reinit();

        var self = this;

        function transitionEnd() {
            if (self.idx > self.maxVal + 1) {
                self.idx = 2;
                self.$slider.style.webkitTransition = null;
                self.goto(1);
                setTimeout(()=> {
                    self.$slider.style.webkitTransition = 'transform ' + self.slideDuration + 'ms';
                    self.autoPlay();
                }, 0);
            } else {
                self.autoPlay();
            }
        }

        this.$slider.addEventListener('webkitTransitionEnd', transitionEnd);

        this.$on('cancleAutoPlay', ()=> {
            this.$slider.removeEventListener('webkitTransitionEnd', transitionEnd);
            clearTimeout(this.timeoutFlag);
            this.$slider.style.webkitTransition = null;
        });


        var touch = new Touch(this.$el);
        var x = 0;
        touch.start();

        touch.on('touch:start', (res)=> {
            res.e.preventDefault();
            this.$emit('cancleAutoPlay');
            x = this.idx * this.width;
        });

        touch.on('touch:move', (res)=> {
            x += res.xrange;
            if (x < this.maxDistinct) {
                this.translate(x);
            }
        });

        touch.on('touch:end', (res)=> {
            this.idx = Math.round(x / this.width);
            if (this.idx > this.maxVal + 1) {
                this.idx = this.maxVal + 1;
            }
            this.goto(this.idx);
            this.$slider.addEventListener('webkitTransitionEnd', transitionEnd);
            this.autoPlay();
        });

    }
};
