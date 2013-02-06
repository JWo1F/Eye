<!DOCTYPE html>
<html lang="ru">
	<head>
		<meta charset="utf-8" />
		<title>Eye.wolf</title>
		<script src="/JS/atom.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/lc.js"></script>
		<script src="/JS/Base64.js"></script>
		<script src="/JS/Source/Eye.Init.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/Eye.Controller.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/modules/Eye.Branch.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/modules/Eye.Loop.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/modules/Eye.Algoritm.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/modules/Eye.List.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/modules/Eye.Subprogram.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/units/Eye.Player.js?v=<?php echo rand(); ?>"></script>
		<script src="/JS/Source/units/Eye.Tail.js?v=<?php echo rand(); ?>"></script>
		<link rel="stylesheet/less" type="text/css" href="/CSS/main.less?v=<?php echo rand(); ?>">
		<script src="/JS/less-1.3.3.min.js"></script>
	</head>
	<body>
		<div id='container'>
			<div id="game"></div>
			<div id="controlls">
				<ul id="menu">
					<li id='move'>Шаг</li>
					<li id='rotate'>Поворот</li>
					<li id='jump'>Прыжок</li>
					<li id='bracnh'>Ветвление</li>
					<li id='loop'>Цикл</li>
					<li id='debug'>Отладка</li>
				</ul>
				<ul id='menuDebug'>
					<li id='start'>Запустить</li>
					<li id='stop'>Стоп</li>
					<li id='edit'>Редактирование</li>
				</ul>
				<div id="log" class='active'>
					<div class='item'>Прыжок</div>
					<div class='item'>Поворот</div>
					<div class='item'>Прыжок</div>
					<div class='item'>Шаг</div>
					<div class='item'>Шаг</div>
					<div class='loop'>
						<div class='info openTag'>Пока не стена {</div>
						<div class='loop-body'>
							<div class='item'>Шаг</div>
							<div class='item'>Шаг</div>
							<div class='loop'>
								<div class='info openTag'>10 раз {</div>
								<div class='loop-body'>
									<div class='item'>Шаг</div>
									<div class='branch'>
										<div class='info openTag'>Если стена {</div>
										<div class='branch-wall'>
											<div class='item'>Шаг</div>
											<div class='item'>Шаг</div>
										</div>
										<div class='info splice'>Иначе</div>
										<div class='branch-space'>
											<div class='item'>Шаг</div>
											<div class='item'>Шаг</div>
										</div>
										<div class='info closeTag'>}</div>
									</div>
									<div class='item'>Шаг</div>
								</div>
								<div class='info closeTag'>}</div>
							</div>
						</div>
						<div class='info closeTag'>}</div>
					</div>
					<div class='item'>Шаг</div>
					<div class='item'>Шаг</div>
					<div class='item'>Шаг</div>
					<div class='item'>Шаг</div>
					<div class='branch'>
						<div class='info openTag'>Если стена {</div>
						<div class='branch-wall'>
							<div class='item'>Шаг</div>
							<div class='item'>Шаг</div>
						</div>
						<div class='info splice'>Иначе</div>
						<div class='branch-space'>
							<div class='item'>Шаг</div>
							<div class='item'>Шаг</div>
						</div>
						<div class='info closeTag'>}</div>
					</div>
					<div class='item'>Шаг</div>
				</div>
			</div>
		</div>
	</body>

</html>
