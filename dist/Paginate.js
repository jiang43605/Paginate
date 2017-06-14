(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function (window) {

    let __verison = 1.0;

    function Paginate(options, callBack) {

        let params = tool.extend({}, Paginate.default, options, { onClick: callBack });

        // create element
        Paginate.event.preClick = Paginate.event.click.bind(null, 'previousSibling', params);
        Paginate.event.nextClick = Paginate.event.click.bind(null, 'nextSibling', params);
        Paginate.event.itemClick = Paginate.event.click.bind(null, null, params);
        let obj = tool.createContanier(params);

        this.dom = obj.dom;
        this.preDom = obj.preDom;
        this.nextDom = obj.nextDom;
        this.options = params;

        this.optionsSet();

        if (params.contanier && params.contanier instanceof HTMLElement)
            params.contanier.appendChild(this.dom);
    }

    // when select change, adjustment UI layout
    Paginate.prototype.adjustment = function (selectNum) {
        if (selectNum) this.options.currentSelect = selectNum;
        Paginate.adjustment(this.dom, this.options);
    };

    // init options, and change options
    Paginate.prototype.optionsSet = function (params) {

        if (params && typeof params === 'object') tool.extend(this.options, params);

        let cp = this.options.cursorPosition,
            dc = this.options.displayCount,
            select = this.options.currentSelect,
            total = this.options.totalPages;


        if (cp > dc || cp < 1) this.options.cursorPosition = 1;
        if (select > total) this.options.currentSelect = 1;

        if (this.options.data) {
            // local data
            let itemsCount = this.options.itemsCount;
            let reallyTotalPages = parseInt(this.options.data.length / this.options.itemsCount) +
                (this.options.data.length % this.options.itemsCount === 0 ? 0 : 1);

            if (this.options.totalPages === null || reallyTotalPages < this.options.totalPages) {
                this.options.totalPages = reallyTotalPages;
            }

        } else if (this.options.ajax || this.options.dataHandle) {
            // ajax data
            if (!this.options.itemsCount || !this.options.totalPages)
                throw new Error('in ajax type, you must set a value to itemsCount and totalPages!');

        } else {
            throw new Error('no data can be load!');
        }

        if (this.options.totalPages > 1)
            tool.addEl.call(this.options, this.dom, 1, this.options.totalPages);
        else if (this.options.totalPages === 1)
            too.addEl.call(this.options, this.dom, 1);
        else {
            this.preDom.removeEventListener('click', Paginate.event.preClick);
            this.nextDom.removeEventListener('click', Paginate.event.nextClick);
            return;
        };

        // adjustment
        Paginate.adjustment(this.dom, this.options);

        // dispatch 1 event
        let e = document.createEvent('Event');
        e.initEvent('click', true, true);
        this.dom.children[this.options.currentSelect].dispatchEvent(e);
    };

    Paginate.adjustment = function (dom, options) {
        let activePageNum = [];
        const current = options.currentSelect,
            max = options.totalPages,
            displayNum = options.displayCount,
            indexNum = options.cursorPosition,
            leftNum = options.leftCount,
            rightNum = options.rightCount;

        if (!/^\d+$/g.test(current.toString())) throw new Error("adjustment fail");

        // clear all child
        for (let i = 1, len = dom.children.length - 1; i < len; i++) {
            dom.removeChild(dom.children[1]);
        }

        if (leftNum + displayNum + rightNum >= max) {

            // display all
            for (let i = 1; i <= max; i++)
                activePageNum.push(i);

        } else {
            for (let i = current + 1 - indexNum; i <= current; i++)
                activePageNum.push(i);
            for (let i = 0; i < displayNum - indexNum; i++)
                activePageNum.push(current + i + 1);

            if (activePageNum[0] <= leftNum + 1) {

                // type 1
                activePageNum.splice(0);
                for (let i = 1; i <= displayNum + leftNum; i++)
                    activePageNum.push(i);
                activePageNum.push(options.omittString);

                for (let i = rightNum - 1; i >= 0; i--)
                    activePageNum.push(max - i);

            } else if (activePageNum[0] > leftNum + 1 && activePageNum[activePageNum.length - 1] < max - rightNum) {

                //type 2
                activePageNum.unshift(options.omittString);
                for (let i = leftNum; i >= 1; i--)
                    activePageNum.unshift(i);

                activePageNum.push(options.omittString);
                for (let i = rightNum - 1; i >= 0; i--)
                    activePageNum.push(max - i);

            } else if (activePageNum[activePageNum.length - 1] >= max - rightNum) {

                //type 3
                activePageNum.splice(0);
                for (let i = max; i >= max - displayNum - rightNum + 1; i--)
                    activePageNum.unshift(i);
                activePageNum.unshift(options.omittString);

                for (let i = leftNum; i >= 1; i--)
                    activePageNum.unshift(i);
            }

        }
        activePageNum.unshift(dom);
        tool.addEl.apply(options, activePageNum);
        tool.find(dom.children, function (d) { return d.textContent === current.toString(); }).className = 'tabItem tabClick';
    };

    Paginate.event = {
        click: function (attr, options) {
            let target = event.srcElement || event.target;
            let clickEl, dom = target.parentNode;

            // disable `pre` or `next` when user click first or last
            let disablePreOrNext = function (targetParam) {

                dom.firstChild.removeEventListener('click', Paginate.event.preClick);
                dom.lastChild.removeEventListener('click', Paginate.event.nextClick);

                if (targetParam.textContent === '1') dom.firstChild.className = 'tabItem tabFlag disable';
                else {
                    dom.firstChild.className = 'tabItem tabFlag';
                    dom.firstChild.addEventListener('click', Paginate.event.preClick);
                }

                if (targetParam.textContent === dom.children[dom.children.length - 2].textContent)
                    dom.lastChild.className = 'tabItem tabFlag tabNext disable';
                else {
                    dom.lastChild.className = 'tabItem tabFlag tabNext';
                    dom.lastChild.addEventListener('click', Paginate.event.nextClick);
                }
            };

            let now = tool.find(dom.children, function (o) {
                return o.className.indexOf('tabClick') !== -1;
            });

            disablePreOrNext(target);
            if (!attr) {
                clickEl = target;
            }
            else {
                clickEl = now[attr];
                disablePreOrNext(clickEl);
            }

            options.currentSelect = parseInt(clickEl.textContent);
            Paginate.adjustment(target.parentNode, options);

            // the now.addEventListener must in front of clickEl.removeEventListener
            // because some time now === clickEl
            now.addEventListener('click', Paginate.event.itemClick);
            clickEl.removeEventListener('click', Paginate.event.itemClick);

            if (options.dataHandle) {
                let callBack = function (data) {
                    options.onClick(data);
                    Paginate.adjustment(dom, options);
                };
                options.dataHandle(clickEl.textContent, options, callBack, tool.http);
            }
            else if (options.ajax) {

                const url = tool.resolveUrl(options.ajax, clickEl.textContent, options.itemsCount);

                if (options.onAjaxRequestting) options.onAjaxRequestting();
                tool.http(options.ajaxMethod, url, options.ajaxData)
                    .then(function (data) {
                        if (data[options.ajaxDataName]) options.onClick(data[options.ajaxDataName]);
                        else options.onClick(data);

                        if (data[options.ajaxTotalPagesName]) {
                            options.totalPages = parseInt(data[options.ajaxTotalPagesName]);
                            Paginate.adjustment(dom, options);
                        }

                    })
                    .catch(function (data) { options.onAjaxFail(data); });

            } else if (options.data && options.itemsCount) {

                const pageNum = parseInt(clickEl.textContent);
                const dataIndex = options.itemsCount * (pageNum - 1);

                let data = options.data.slice(dataIndex, dataIndex + options.itemsCount);
                options.onClick(data);

            } else {
                throw new Error('no data can be load');
            }
        }
    };

    Paginate.default = {
        ajaxMethod: 'GET',
        ajaxData: null,
        ajaxTotalPagesName: 'totalPages',
        ajaxDataName: 'data',
        dataHandle: null,
        onAjaxFail: null,
        onAjaxRequestting: null,
        omittString: '···',
        preString: 'Pre',
        nextString: 'Next',
        displayCount: 5,
        cursorPosition: 3,
        leftCount: 1,
        rightCount: 1,
        itemsCount: null,
        totalPages: null,
        onClick: null,
        contanier: null,
        currentSelect: 1
    };

    let tool = {

        //resolve ajax url
        resolveUrl: function (url, num, count) {
            return url.replace('{num}', num)
                .replace('{count}', count);
        },

        // create contanier
        createContanier: function (params) {
            let con = tool.createHtml('div', 'tab');
            let pre = tool.createHtml(con, 'div', 'tabItem tabFlag');
            let next = tool.createHtml(con, 'div', 'tabItem tabFlag tabNext');

            pre.textContent = params.preString;
            next.textContent = params.nextString;

            pre.addEventListener('click', Paginate.event.preClick);
            next.addEventListener('click', Paginate.event.nextClick);

            return {
                dom: con,
                preDom: pre,
                nextDom: next
            };
        },

        // add element to paginate contanier
        // the contanier already have the `pre` and `next` element
        addEl: function (contanier) {
            const self = this;
            if (!contanier || !(contanier instanceof HTMLElement)) return;

            for (let i = 1, len = arguments.length; i < len; i++) {
                if (typeof arguments[i] === 'number') {
                    let el = tool.createHtml('div', 'tabItem');
                    el.textContent = arguments[i];
                    el.addEventListener('click', Paginate.event.itemClick);
                    contanier.insertBefore(el, contanier.lastChild);
                } else if (arguments[i] === self.omittString) {
                    let el = tool.createHtml('div', 'tabItem disable');
                    el.textContent = arguments[i];
                    contanier.insertBefore(el, contanier.lastChild);
                }
            }
        },

        // merge object, don't support array
        extend: function () {
            let target = arguments[0] || {};

            for (let i = 1, len = arguments.length; i < len; i++) {
                if (typeof arguments[i] !== 'object') continue;

                for (let obj in arguments[i]) {
                    target[obj] = arguments[i][obj];
                }
            }

            return target;
        },

        // ajax package(only support XHR)
        http: function (method, url, data, header) {
            return new Promise(function (resolve, reject) {
                let options = tool.httpDataResolve(method, url, data);
                let http = new XMLHttpRequest();

                http.onload = function () { resolve(JSON.parse(http.responseText)); };
                http.onerror = function () { reject(JSON.parse(http.responseText)); };

                http.open(method, options.url);
                if (options.hasContent) http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                if (header) {
                    for (let i in header)
                        http.setRequestHeader(i, header[i]);
                }
                http.send(options.dataParam || null);
            });
        },

        // reslove data for ajax request
        httpDataResolve: function (method, url, data) {

            let hasContent, dataParam = '';
            const index = url.indexOf('?');

            if (index !== -1) {
                url = url.replace(url.slice(index + 1), url.slice(index + 1)
                    .split('&')
                    .map(function (param) {
                        return param.split('=').map(function (item) {
                            return encodeURIComponent(item);
                        }).join('=');
                    }).join('&'));
            }

            if (method.toLowerCase() === 'get') hasContent = false;
            else hasContent = true;

            if (typeof data === 'object' && !data.isPrototypeOf(FormData)) {

                for (let item in data) {
                    if (data[item] instanceof Array) {
                        for (let arrays in data[item]) {
                            dataParam += encodeURIComponent(item)
                                + '='
                                + encodeURIComponent(data[item][arrays])
                                + '&';
                        }
                    } else {
                        dataParam += encodeURIComponent(item)
                            + '='
                            + encodeURIComponent(data[item])
                            + '&';
                    }

                }
                dataParam = dataParam.substring(0, dataParam.length - 1);

            } else if (typeof data === 'string') {

                dataParam = data.split('&')
                    .map(function (param) {
                        return param.split('=').map(function (item) {
                            return encodeURIComponent(item);
                        }).join('=');
                    }).join('&');
            }

            if (!hasContent && dataParam && index !== -1) url = [url, dataParam].join('&');
            else if (!hasContent && dataParam) url = url + '?' + dataParam;

            return {
                url: url,
                data: hasContent ? dataParam : null,
                hasContent: hasContent
            }
        },

        createHtml: function () {
            if (!arguments.length) return;

            if (arguments.length === 1
                && typeof arguments[0] === 'string')
                var c = document.createElement(arguments[0]);

            else if (arguments.length === 2) {

                if (arguments[0] instanceof HTMLElement) var argumentindex = 1;
                else if (typeof arguments[1] === 'string') var argumentindex = 0;
                else if (typeof arguments[1] === 'object') var argumentindex = 0;
                else throw new Error('uncheck arguments!');

                c = document.createElement(arguments[argumentindex]);
                if (argumentindex) arguments[0].appendChild(c);
                else if (typeof arguments[1] === 'string') c.setAttribute('class', arguments[1]);
                else for (var key in arguments[1]) c.setAttribute(key, arguments[1][key]);
            }

            // arguments has 3
            else if (arguments.length === 3) {
                c = document.createElement(arguments[1]);
                arguments[0].appendChild(c);

                // if argument[2] is object type
                if (typeof arguments[2] === 'object') {
                    for (var key in arguments[2])
                        c.setAttribute(key, arguments[2][key]);
                }
                else c.setAttribute('class', arguments[2]);
            }

            else throw new Error('uncheck arguments!');

            return c;
        },

        find: function (array, callback) {
            for (let i in array) {
                if (callback(array[i])) return array[i];
            }
            return undefined;
        }
    };

    window.Paginate = Paginate;

    return Paginate;
});