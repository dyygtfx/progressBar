;
(function(root, opt) {
    var progressBar = {};
    // 进度条设置
    var config = progressBar.config = {
        minimum: 0.08,
        easing: 'ease',
        positionUsing: '',
        speed: 200,
        trickle: true,
        trickleRate: 0.02,
        trickleSpeed: 800,
        showSpinner: true,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        parent: 'body',
        template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
    };
    progressBar.configure = function(options) {
        var key,
            value;
        for (key in options) {
            value = options[key];
            if (value !== undefined && options.hasOwnProperty(key)) {
                config[key] = value;
            }
        }
        return this;
    };

    progress.status = null;

    progress.set = function(n) {
        var started = progressBar.isStarted();
        n = clamp(n, config.minimum, 1);
        progressBar.status = (n === 1 ? null : n);
        var progress = progressBar.render(!started),
            bar = progress.querySelector(config.barSelector),
            speed = config.speed,
            ease = config.easing;
        //  重绘
        progress.offsetWidth;

    };
    queue(function(next) {
        if (config.positionUsing === '') {
            config.positionUsing = progressBar.getPositioningCSS();
        }
        css(bar, barPositionCSS(n, speed, ease));
        if (n === 1) {
            css(progress, {
                transition: 'none',
                opacity: 1
            });
            progress.offsetWidth;
            setTimeout(function() {
                css(progress, {
                    transition: 'all ' + speed + 'ms linear',
                    opacity: 0
                });
                setTimeout(function() {
                    progressBar.remove();
                    next();
                }, speed);
            });
        } else {
            setTimeout(next, speed);
        }
        return this;

    });
    progressBar.isStarted = function() {
        return typeof NProgress.status === 'number';
    };

    progressBar.start = function() {
        if (!progressBar.status) {
            progressBar.set(0);
        }

        var work = function() {
            setTimeout(function() {
                if (!progressBar.status) return;
                progressBar.trickle();
                work();
            }, config.trickleSpeed);
        };

        if (config.trickle) {
            work();
        }

        return this;
    };

    progressBar.done = function(force) {
      if (!force && !progressBar.status) {
          return this;
      }

      return progressBar.inc(0.3 + 0.5 * Math.random()).set(1);
    };

    progressBar.inc = function(amount) {
      var n = progressBar.status;

      if (!n) {
        return progressBar.start();
      } else {
        if (typeof amount !== 'number') {
          amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
        }

        n = clamp(n + amount, 0, 0.994);
        return progressBar.set(n);
      }
    };
    progressBar.trickle = function() {
      return progressBar.inc(Math.random() * config.trickleRate);
    };

    (function () {
        var initial = 0,current = 0;
        progressBar.promise = function($promise) {
            if (!$promise || $promise.state() === "resolved") {
                return this;
            }
            if (current === 0) {
                progressBar.start();
            }
            initial++;
            current++;
            $promise.always(function () {
                current--;
                if (current === 0) {
                    initial = 0;
                    progressBar.done();
                } else {
                    progressBar.set((initial - current) / initial);
                }
            });
            return this;
        };
    }());

    progressBar.render = function (formStart) {
        if (progressBar.isRender()) {
            return document.getElementById('progressBar');
        }
        addClass(document.documentElement,'progress-busy');
        var _progress = document.createElement('div');
        _progress.id = 'progressBar';
        _progress.innerHTML = config.template;
        var bar = _progress.querySelector(config.barSelector),
            perc = fromStart ? '-100' : toBarPerc(progressBar.status || 0),
            parent = document.querySelector(config.parent),
            spinner;
        css(bar, {
            transition: 'all 0 linner',
            transform: 'translate3d('+perc+'%,0,0)'
        });
        if (!config.showSpinner) {
            spinner = _progress.querySelector(config.spinnerSelector);
            spinner && removeElement(spinner);
        }
        if (parent != document.body) {
            addClass(parent, 'nprogress-custom-parent');
        }

        parent.appendChild(progress);
        return progress;
    };

    /**
     * 删除元素
     */
    progressBar.remove = function () {
        removeClass(document.documentElement,'progress-busy');
        removeClass(document.querySelector(Setting.parent),'progress-custom-parent');
        var progress = document.getElementById('progress');
        progress && removeElement(progress);

    };

}());
