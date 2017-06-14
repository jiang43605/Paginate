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

let http = require('./ajax.js');
module.exports = tool.extend({}, tool, http);