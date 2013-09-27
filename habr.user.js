// ==UserScript==
// @name habrUserJS
// @description модификация отображения комментариев на хабрахабре habrahabr
// @author Ruslan Login
// @license MIT
// @version 1.0
// @include http://habrahabr.ru/*
// ==/UserScript==
// [1] Оборачиваем скрипт в замыкание, для кроссбраузерности (opera, ie)
var minGoodCommentRating = 7;
var maxBadCommentRating = -7;

(function (window, undefined) {  // [2] нормализуем window
    var w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }
    // В юзерскрипты можно вставлять практически любые javascript-библиотеки.
    // Код библиотеки копируется прямо в юзерскрипт.
    // При подключении библиотеки нужно передать w в качестве параметра окна window
    // Пример: подключение jquery.min.js
    // (function(a,b){function ci(a) ... a.jQuery=a.$=d})(w);

    // [3] не запускаем скрипт во фреймах
    // без этого условия скрипт будет запускаться несколько раз на странице с фреймами
    if (w.self != w.top) {
        return;
    }
    // [4] дополнительная проверка наряду с @include
    if (/http:\/\/habrahabr.ru/.test(w.location.href)) {
        //Ниже идёт непосредственно код скрипта
        var bestComments = [];
        var badComments = [];
        var commentsList = $(".comments_list");

        $(".comment_item").each(function(){   
          var commentRating = parseInt($(".score", this)[0].innerText.replace("–","-").replace("+",""));
          if(commentRating >= minGoodCommentRating)
          {
            var _elementClone = $(this).clone();
            $(".reply_form_placeholder", _elementClone).remove();
            bestComments.push(_elementClone); 
          }
          else if(commentRating <= maxBadCommentRating)
          {
            var _elementClone = $(this).clone();
            $(".reply_form_placeholder", _elementClone).remove();
            badComments.push(_elementClone); 
          }
        });

        var sortFunction = function(a, b){
          if( parseInt($(".score",a)[0].innerText.replace("–","-")) < parseInt($(".score",b)[0].innerText.replace("–","-")) )
            return -1;
          if( parseInt($(".score",a)[0].innerText.replace("–","-")) > parseInt($(".score",b)[0].innerText.replace("–","-")) )
            return 1; 
          return 0;
        };

        bestComments.sort(sortFunction);
        badComments.sort(sortFunction);

        bestComments.forEach(function(element){
          commentsList.prepend(element);
        });
        commentsList.prepend("<div><h1>Лучшие комментарии:</h1></div><br>");

        commentsList.append("<div><h1>Худшие комментарии:</h1></div><br>");
        badComments.forEach(function(element){
          commentsList.append(element);
        });
        
        $(".comment_item > .score").each(function(){
            var commentRating = parseInt($(this).text().replace("–","-").replace("+",""));
            if(commentRating > maxBadCommentRating && commentRating < minGoodCommentRating)
                $(this).text("");
        });
    }
})(window);
