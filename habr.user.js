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
          console.log($(".score", this))
          var commentRating = parseInt($($(".score", this)[0]).text().replace("–","-").replace("+",""));
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
          if( parseInt($($(".score",a)[0]).text().replace("–","-")) < parseInt($($(".score",b)[0]).text().replace("–","-")) )
            return -1;
          if( parseInt($($(".score",a)[0]).text().replace("–","-")) > parseInt($($(".score",b)[0]).text().replace("–","-")) )
            return 1; 
          return 0;
        };

        bestComments.sort(sortFunction).reverse();
        badComments.sort(sortFunction);

        var bestCommentsContainer = $("<div>")
        	.append("<div><h1>Лучшие комментарии:</h1></div><br>");
        bestComments.forEach(function(element){
          bestCommentsContainer.append(element);
        });

        var badCommentsContainer = $("<div>")
        	.append("<div><h1>Худшие комментарии:</h1></div><br>");
        if(!badComments.length)
            badCommentsContainer.append("<div><h2>все комментарии к этому посту имеют рейтинг > " + maxBadCommentRating + "</h2></div><br>");
        badComments.forEach(function(element){
          badCommentsContainer.append(element);
        });
        
        commentsList.prepend(badCommentsContainer);
        commentsList.prepend(bestCommentsContainer);
        
        $(".comment_item > .score").each(function(){
            var commentRating = parseInt($(this).text().replace("–","-").replace("+",""));
            if(commentRating > maxBadCommentRating && commentRating < minGoodCommentRating)
                $(this).text("");
        });
    }
})(window);
