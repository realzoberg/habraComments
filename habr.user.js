// ==UserScript==
// @name habrUserJS
// @description модификация отображения комментариев на хабрахабре habrahabr
// @author Ruslan Login
// @license MIT
// @version 1.0
// @include http://habrahabr.ru/*
// ==/UserScript==
// [1] Оборачиваем скрипт в замыкание, для кроссбраузерности (opera, ie)
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
          var commentRating = $(".score", this).text().replace("–","-");
          
          if(commentRating > 7)
          {
            var _elementClone = $(this).clone();
            $(".reply_form_placeholder", _elementClone).remove();
            bestComments.push(_elementClone); 
          }
          else if(commentRating < -7)
          {
            var _elementClone = $(this).clone();
            $(".reply_form_placeholder", _elementClone).remove();
            badComments.push(_elementClone); 
          }
          else $(".score", this).text("");
        });

        var sortFunction = function(a, b){
          if( $(".score",a).text().replace("–","-") < $(".score",b).text().replace("–","-") )
            return -1;
          if( $(".score",a).text().replace("–","-") > $(".score",b).text().replace("–","-") )
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
    }
})(window);
