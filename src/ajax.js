let ajaxModule = {

    // ajax package(only support XHR)
    http: function (method, url, data, header) {
        return new Promise(function (resolve, reject) {
            let options = ajaxModule.httpDataResolve(method, url, data);
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
    }
}

module.exports = ajaxModule;