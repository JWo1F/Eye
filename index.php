<!DOCTYPE html>

<html lang="ru">
    <head>
        <meta charset="utf-8" />
        <title>Eye.wolf</title>
        <script src="/JS/atom.js?v=<?php echo rand(); ?>"></script>
        <script src="/JS/lc.js"></script>
        
        <script src="/JS/Source/Eye.Init.js?v=<?php echo rand(); ?>"></script>
        <script src="/JS/Source/Eye.Controller.js?v=<?php echo rand(); ?>"></script>
        
        <script src="/JS/Source/modules/Eye.Branch.js?v=<?php echo rand(); ?>"></script>
        <script src="/JS/Source/modules/Eye.Loop.js?v=<?php echo rand(); ?>"></script>
        <script src="/JS/Source/modules/Eye.Algoritm.js?v=<?php echo rand(); ?>"></script>
        <script src="/JS/Source/modules/Eye.List.js?v=<?php echo rand(); ?>"></script>
        <script src="/JS/Source/modules/Eye.Tail.js?v=<?php echo rand(); ?>"></script>
        
        <script src="/JS/Source/units/Eye.Player.js?v=<?php echo rand(); ?>"></script>
        
        
        <link rel="stylesheet/less" type="text/css" href="/CSS/main.less?v=<?php echo rand(); ?>">
        <script src="/JS/less-1.3.3.min.js"></script>
    </head>
    <body>
        <div id='container'>
        	<div id="game"></div>
    		<div id="controlls">
    			<ul id="menu">
    				<li id='move'>Шаг</li>
    				<li id='rotate' onclick='app.addAction(2)'>Поворот</li>
    				<li onclick='app.addAction(1)'>Прыжок</li>
    				<li>Ветвление</li>
    				<li onclick='play()'>Цикл</li>
    			</ul>
    			<div id="log">
    				<ul></ul>
    			</div>
    		</div>
            <div id='cycle' style='clear: left; opacity: 0; color: red'>Ошибка зацикливания. Остановка через <b></b> секунд</div>
            <div id='cPanel' class='hide'><a href='#' onclick='app.algoritm.speed(5)'>Скорость 5X</a> | <a href='#' onclick='app.algoritm.speed(50)'>Скорость 50X</a> | <a href='#' onclick='app.algoritm.reset(); app.algoritm.parse(); app.algoritm.start()'>Запуск</a> | <a href='#' onclick='app.algoritm.reset();'>Сброс</a></div>
            <a id='hash' style='display: block'></a>
        </div>
    </body>
</html>
