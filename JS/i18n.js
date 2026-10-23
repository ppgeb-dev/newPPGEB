// Internacionalização (PT/EN). O português fica no próprio HTML/JS;
// o inglês é uma camada por cima, carregada de JSON/i18n/en.json.
(function () {
    var CHAVE_STORAGE = 'ppgeb_lang';
    var CAMINHO_DICIONARIO = 'JSON/i18n/en.json';
    var TIMEOUT_LOADING = 1500;

    function lerStorage() {
        try {
            return window.localStorage.getItem(CHAVE_STORAGE);
        } catch (e) {
            return null;
        }
    }

    function gravarStorage(valor) {
        try {
            window.localStorage.setItem(CHAVE_STORAGE, valor);
        } catch (e) {
            // storage indisponível (modo privado, etc.): segue sem lembrar a escolha
        }
    }

    function idiomaValido(valor) {
        return valor === 'pt' || valor === 'en';
    }

    function detectarIdioma() {
        var doUrl = null;
        try {
            doUrl = new URLSearchParams(window.location.search).get('lang');
        } catch (e) {
            doUrl = null;
        }
        if (idiomaValido(doUrl)) {
            gravarStorage(doUrl);
            return doUrl;
        }
        var salvo = lerStorage();
        return idiomaValido(salvo) ? salvo : 'pt';
    }

    var lang = detectarIdioma();
    var dicionario = {};
    var root = document.documentElement;

    root.lang = lang === 'en' ? 'en' : 'pt-BR';

    // Esconde o conteúdo enquanto o dicionário carrega, para não piscar em português
    if (lang === 'en') {
        root.classList.add('i18n-loading');
    }

    function removerLoading() {
        root.classList.remove('i18n-loading');
    }

    var ready;
    if (lang === 'en') {
        ready = fetch(CAMINHO_DICIONARIO)
            .then(function (resp) {
                return resp.ok ? resp.json() : {};
            })
            .then(function (dados) {
                dicionario = dados || {};
            })
            .catch(function () {
                dicionario = {};
            });
    } else {
        ready = Promise.resolve();
    }

    setTimeout(removerLoading, TIMEOUT_LOADING);

    function t(chave, fallback) {
        if (lang === 'en' && Object.prototype.hasOwnProperty.call(dicionario, chave)) {
            return dicionario[chave];
        }
        return fallback;
    }

    function temChave(chave) {
        return lang === 'en' && Object.prototype.hasOwnProperty.call(dicionario, chave);
    }

    function aplicarTexto(el, chave, html) {
        var guardado = el.hasAttribute('data-i18n-pt');
        if (lang === 'en') {
            if (!temChave(chave)) return;
            if (!guardado) {
                el.setAttribute('data-i18n-pt', html ? el.innerHTML : el.textContent);
            }
            if (html) {
                el.innerHTML = dicionario[chave];
            } else {
                el.textContent = dicionario[chave];
            }
        } else if (guardado) {
            var original = el.getAttribute('data-i18n-pt');
            if (html) {
                el.innerHTML = original;
            } else {
                el.textContent = original;
            }
            el.removeAttribute('data-i18n-pt');
        }
    }

    function aplicarAtributos(el) {
        var pares = el.getAttribute('data-i18n-attr').split(';');
        var originais = {};
        var temOriginais = el.hasAttribute('data-i18n-pt-attrs');
        if (temOriginais) {
            try {
                originais = JSON.parse(el.getAttribute('data-i18n-pt-attrs'));
            } catch (e) {
                originais = {};
            }
        }

        pares.forEach(function (par) {
            var idx = par.indexOf(':');
            if (idx < 1) return;
            var attr = par.slice(0, idx).trim();
            var chave = par.slice(idx + 1).trim();

            if (lang === 'en') {
                if (!temChave(chave)) return;
                if (!Object.prototype.hasOwnProperty.call(originais, attr)) {
                    originais[attr] = el.getAttribute(attr) || '';
                }
                el.setAttribute(attr, dicionario[chave]);
            } else if (Object.prototype.hasOwnProperty.call(originais, attr)) {
                el.setAttribute(attr, originais[attr]);
                delete originais[attr];
            }
        });

        if (Object.keys(originais).length > 0) {
            el.setAttribute('data-i18n-pt-attrs', JSON.stringify(originais));
        } else {
            el.removeAttribute('data-i18n-pt-attrs');
        }
    }

    function apply(raiz) {
        raiz = raiz || document;
        if (!raiz.querySelectorAll) return;

        var alvos = [];
        if (raiz.nodeType === 1) alvos.push(raiz);
        Array.prototype.push.apply(alvos, raiz.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-attr]'));

        alvos.forEach(function (el) {
            if (el.hasAttribute('data-i18n')) {
                aplicarTexto(el, el.getAttribute('data-i18n'), false);
            }
            if (el.hasAttribute('data-i18n-html')) {
                aplicarTexto(el, el.getAttribute('data-i18n-html'), true);
            }
            if (el.hasAttribute('data-i18n-attr')) {
                aplicarAtributos(el);
            }
        });
    }

    function setLang(novo) {
        if (!idiomaValido(novo)) return;
        gravarStorage(novo);

        // Se a URL já tem ?lang=, ele precisa acompanhar a escolha (senão voltaria ao idioma antigo)
        var url;
        try {
            url = new URL(window.location.href);
        } catch (e) {
            window.location.reload();
            return;
        }
        if (url.searchParams.has('lang')) {
            url.searchParams.set('lang', novo);
            window.location.href = url.toString();
        } else {
            window.location.reload();
        }
    }

    function nomeArquivo(caminho) {
        var semQuery = caminho.split('?')[0].split('#')[0];
        return semQuery.substring(semQuery.lastIndexOf('/') + 1);
    }

    function buscarOriginal(caminho) {
        return fetch(caminho).then(function (resp) {
            if (!resp.ok) throw new Error('Erro ao carregar ' + caminho + ': ' + resp.status);
            return resp.json();
        });
    }

    // Em EN tenta JSON/en/<arquivo>; se não existir, usa o original em PT
    function fetchJSON(caminho) {
        if (lang !== 'en') return buscarOriginal(caminho);

        var caminhoEn = 'JSON/en/' + nomeArquivo(caminho);
        return fetch(caminhoEn)
            .then(function (resp) {
                if (!resp.ok) throw new Error('sem versão EN');
                return resp.json();
            })
            .catch(function () {
                return buscarOriginal(caminho);
            });
    }

    function textoBotao() {
        return lang === 'en'
            ? 'Switch language to Portuguese (Português)'
            : 'Mudar idioma para inglês (English)';
    }

    function inserirSeletor() {
        var container = document.querySelector('.header-container');
        if (!container || container.querySelector('.lang-switch')) return;

        var botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'lang-switch';
        botao.setAttribute('aria-label', textoBotao());
        botao.setAttribute('title', textoBotao());
        botao.innerHTML =
            '<span class="lang-opt' + (lang === 'pt' ? ' active' : '') + '" lang="pt">PT</span>' +
            '<span class="lang-sep" aria-hidden="true">|</span>' +
            '<span class="lang-opt' + (lang === 'en' ? ' active' : '') + '" lang="en">EN</span>';
        botao.addEventListener('click', function () {
            setLang(lang === 'en' ? 'pt' : 'en');
        });

        var menuBtn = container.querySelector('#mobile-menu-btn');
        if (menuBtn) {
            container.insertBefore(botao, menuBtn);
        } else {
            container.appendChild(botao);
        }
    }

    function iniciar() {
        inserirSeletor();
        ready.then(function () {
            apply(document);
            removerLoading();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

    window.i18n = {
        lang: lang,
        ready: ready,
        t: t,
        apply: apply,
        setLang: setLang,
        fetchJSON: fetchJSON
    };
})();
