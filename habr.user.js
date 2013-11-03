// ==UserScript==
// @name habrUserJS
// @description модификация отображения комментариев на хабрахабре habrahabr
// @author Ruslan Login
// @license MIT
// @version 1.2
// @include http://habrahabr.ru/*
// @match http://habrahabr.ru/*
// ==/UserScript==
// [1] Оборачиваем скрипт в замыкание, для кроссбраузерности (opera, ie)



(function (window, undefined) {  // [2] нормализуем window

var load,execute,loadAndExecute;load=function(a,b,c){var d;d=document.createElement("script"),d.setAttribute("src",a),b!=null&&d.addEventListener("load",b),c!=null&&d.addEventListener("error",c),document.body.appendChild(d);return d},execute=function(a){var b,c;typeof a=="function"?b="("+a+")();":b=a,c=document.createElement("script"),c.textContent=b,document.body.appendChild(c);return c},loadAndExecute=function(a,b){return load(a,function(){return execute(b)})};

loadAndExecute("//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js", function() {

    var minGoodCommentRating = 7;
    var maxBadCommentRating = -7;

    window.$ = jQuery;

    var w;
    if (typeof unsafeWindow != "undefined") {
        w = unsafeWindow
    } else {
        w = window;
    }
    // В юзерскрипты можно вставлять практически любые javascript-библиотеки.
    // Код библиотеки копируется прямо в юзерскрипт.
    // При подключении библиотеки нужно передать w в качестве параметра окна window
    // Пример: подключение jquery.min.js
    // (function(a,b){function ci(a) ... a.jQuery=a.$=d})(w);

    if(typeof w.$ == "undefined")
        return;

    console.log("Loaded jQ!")

    // [3] не запускаем скрипт во фреймах
    // без этого условия скрипт будет запускаться несколько раз на странице с фреймами
    if (w.self != w.top) {
        return;
    }
    // [4] дополнительная проверка наряду с @include
    if (!(/http:\/\/habrahabr.ru/.test(w.location.href)))
        return;

    console.log("Work!")

    //Ниже идёт непосредственно код скрипта

    // составление рейтинга лучших и худших комментариев
    var bestComments = [];
    var badComments = [];

    $(".comment_item").each(function(){
      var score = $(".score", this);
      console.log(score)
      var commentRating = parseInt($(score[0]).text().replace("–","-").replace("+",""));
      if(commentRating < minGoodCommentRating && commentRating > maxBadCommentRating)
        return;
      var _elementClone = $(this).clone();
      $(".reply_form_placeholder", _elementClone).remove();
      if(commentRating >= minGoodCommentRating)
        bestComments.push(_elementClone);
      else if(commentRating <= maxBadCommentRating)
        badComments.push(_elementClone);
    });

    var sortComments = function(a, b){
      var a = parseInt($($(".score",a)[0]).text().replace("–","-"));
      var b = parseInt($($(".score",b)[0]).text().replace("–","-"));
      return a - b;
    };

    bestComments.sort(sortComments).reverse();
    badComments.sort(sortComments);

    var bestCommentsContainer = $("<div class='best_comments'>")
    	.append("<div><h1>Лучшие комментарии:</h1></div><br>");
    if(!bestComments.length)
        bestCommentsContainer.append("<div><h2>все комментарии к этому посту имеют рейтинг < " + minGoodCommentRating + "</h2></div><br>");
    bestComments.forEach(function(element){
      bestCommentsContainer.append(element);
    });

    var badCommentsContainer = $("<div class='worst_comments'>")
    	.append("<div><h1>Худшие комментарии:</h1></div><br>");
    if(!badComments.length)
        badCommentsContainer.append("<div><h2>все комментарии к этому посту имеют рейтинг > " + maxBadCommentRating + "</h2></div><br>");
    badComments.forEach(function(element){
      badCommentsContainer.append(element);
    });

    var commentsList = $(".comments_list");
    commentsList.prepend(badCommentsContainer);
    commentsList.prepend(bestCommentsContainer);

    // скрытие рейтига у обычных комментариев
    $(".comment_item > .score").each(function(){
        var $this = $(this);
        var commentRating = parseInt($this.text().replace("–","-").replace("+",""));
        if(commentRating > maxBadCommentRating && commentRating < minGoodCommentRating)
            $this.text("");
    });

    // добавление ссылки скрыть/показать ответы
    $(".best_comments > .comment_item > .reply_comments").hide();
    $(".worst_comments > .comment_item > .reply_comments").hide();

    $(".comment_body").each(function(){
        var self = this;
        var $self = $(self)
        var commentReply = $(".reply_comments", $self.parent());

        if( commentReply.text() !== "\n	")
        {
            $self.parent().append("<div class = '.reply_filler'><br/></div>");
            var toggleReplyTitle = (commentReply.css("display")=="none") ?  "показать ответы" :  "скрыть ответы";
            var hideCommentTreeContainer = $("<div class='reply'>")
                .append("<a href='#hide' class='reply_link hide_link'>" + toggleReplyTitle + "</a>").appendTo($(this));
            $(".hide_link", hideCommentTreeContainer).click(function(){
                commentReply.toggle();
                $(".reply_filler", $self.parent()).toggle();

                // updateShowHideAnswersText
                $(".comment_item").each(function(){
                	var toggleReplyTitle = ($(".reply_comments", this).css("display")=="none") ?  "показать ответы" : "скрыть ответы";
                	$(".hide_link", this).text(toggleReplyTitle);
                });
            });
        }
    });

    $(".comment_body > .reply").css("display", "inline");

});

})(window);
