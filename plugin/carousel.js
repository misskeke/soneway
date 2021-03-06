﻿//carousel.js
(function (window, $) {

    $.fn.carousel = function (options) {
        $.fn.carousel.defaults = {
            //是否竖直方向滚动
            isVertical: false,
            //滑动阈值
            swipThreshold: 50,
            //是否自动轮播
            isAutoPlay: true,
            //轮播inter
            autoPlayInter: 8000,
            //轮播回调函数
            slideCallback: null,
            //是否显示title
            isShowTitle: true,
            //是否显示pager
            isShowPager: true
        };

        //每个元素执行
        return this.each(function () {
            var opts = $.extend({}, $.fn.carousel.defaults, options);

            //配置项
            var isVertical = opts.isVertical,
                swipThreshold = opts.swipThreshold,
                isAutoPlay = opts.isAutoPlay,
                autoPlayInter = opts.autoPlayInter,
                slideCallback = opts.slideCallback,
                isShowTitle = opts.isShowTitle,
                isShowPager = opts.isShowPager;

            //变量
            var $this = $(this),
                me = this,
                $wrap, wrapElStyle, $items, itemCount,
                $title, $pagers;

            //初始化函数
            function init() {
                $this.addClass('pi-carousel').html('<div class="pi-carousel-wrap">' + $this.html() + '</div>' + (isShowTitle ? '<div class="pi-carousel-title"></div>' : ''));

                $wrap = $this.find('.pi-carousel-wrap');
                wrapElStyle = $wrap[0].style;
                $items = $wrap.children('*');
                itemCount = $items.length;

                isVertical && $this.addClass('vertical');
                $title = $this.find('.pi-carousel-title');

                //pager
                var html = '';
                if (isShowPager) {
                    html += '<div class="pi-carousel-pager">';
                    for (var i = 0, len = itemCount; i < len; i++) {
                        html += '<span></span>';
                    }
                    html += '</div>';
                }
                $pagers = $this.append(html).find('.pi-carousel-pager span');

                //初始化事件
                initEvent();
            }

            //初始化事件函数
            function initEvent() {
                var width, height, inter, index = 0,
                    startX, startY,
                    swipSpan;

                //设置尺寸函数
                function setSize() {
                    width = $this.width();
                    height = $this.height();

                    $items.css({
                        width: width + 'px',
                        height: height + 'px'
                    });

                    //水平方向滚动
                    if (!isVertical) {
                        wrapElStyle.width = width * itemCount + 'px';
                        wrapElStyle.height = height + 'px';
                    }
                    //竖直方向滚动
                    else {
                        wrapElStyle.width = width + 'px';
                        wrapElStyle.height = height * itemCount + 'px';
                    }
                }

                //设置inter函数
                function setInter() {
                    isAutoPlay && (inter = setInterval(function () {
                        ++index === itemCount && (index = 0);
                        slide();
                    }, autoPlayInter));
                }

                //移动到函数
                function slide(swipSpan) {
                    var translate = -index * (isVertical ? height : width),
                        transform;

                    if (typeof swipSpan === 'number') {
                        //起点
                        if (index === 0 && swipSpan > 0) {
                            swipSpan /= 2;
                        }
                        //终点
                        if (index === itemCount - 1 && swipSpan < 0) {
                            swipSpan /= 2;
                        }
                        translate += swipSpan;
                    }
                    else {
                        //滚动回调函数
                        typeof slideCallback === 'function' && slideCallback(index);
                        //title
                        var title = $items.removeClass('current').eq(index).addClass('current').attr('data-title');
                        $title.removeClass('visible');
                        title && setTimeout(function () {
                            $title.addClass('visible').html(title);
                        }, 200);
                        //pager状态
                        $pagers.removeClass('selected').eq(index).addClass('selected');
                    }

                    transform = 'translate3d(' + (isVertical ? '0,' + translate + 'px,0' : translate + 'px,0,0') + ')';
                    $wrap.css({
                        '-webkit-transform': transform,
                        'transform': transform
                    });
                }


                //初始化
                //设置尺寸
                setSize();

                //暴露slideToIndex方法
                me.slideToIndex = function (i) {
                    index = i;
                    slide();
                };


                //触摸开始事件
                $this.on('touchstart', function (evt) {
                    var touch = evt.targetTouches[0];
                    //记录触摸开始位置
                    startX = touch.pageX;
                    startY = touch.pageY;
                    //重置swipSpan
                    swipSpan = 0;
                    //取消动画
                    $wrap.removeClass('transform');
                    //取消自动轮播
                    isAutoPlay && clearInterval(inter);
                });

                //触摸移动事件
                $this.on('touchmove', function (evt) {
                    var touch = evt.targetTouches[0],
                        swipSpanX = touch.pageX - startX,
                        swipSpanY = touch.pageY - startY;

                    //上下
                    if (isVertical) {
                        if (Math.abs(swipSpanY) > Math.abs(swipSpanX)) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            slide(swipSpan = swipSpanY);
                        }
                    }
                    //左右
                    else {
                        if (Math.abs(swipSpanX) > Math.abs(swipSpanY)) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            slide(swipSpan = swipSpanX);
                        }
                    }
                });

                //触摸结束事件
                $this.on('touchend', function (evt) {
                    //向右,下
                    if (swipSpan > swipThreshold) {
                        --index < 0 && (index = 0);
                    }
                    //向左,上
                    if (swipSpan < -swipThreshold) {
                        ++index === itemCount && (index = itemCount - 1);
                    }

                    //加上动画
                    $wrap.addClass('transform');

                    //滚动
                    swipSpan !== 0 && slide();

                    //自动轮播
                    setInter();
                }).trigger('touchend');

                //屏幕尺寸改变事件
                window.addEventListener('resize', function () {
                    var w = $this.width();
                    if (w > 0) {
                        setSize();
                        slide(0);
                    }
                }, false);

            }


            //初始化
            init();

        });

    };

})(this, $);